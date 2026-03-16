import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import Navbar from "../components/Navbar";
import { auth } from "@/firebase";

interface Question {
  id: string;
  text: string;
  category?: string;
}

const LS_QUESTIONS_KEY = "holland_questions";
const LS_ANSWERS_KEY   = "holland_answers";

const Round1 = () => {
  const navigate = useNavigate();
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [answers, setAnswers]         = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const cachedQuestions = localStorage.getItem(LS_QUESTIONS_KEY);
    const cachedAnswers   = localStorage.getItem(LS_ANSWERS_KEY);
    if (cachedQuestions) {
      try {
        setQuestions(JSON.parse(cachedQuestions));
        if (cachedAnswers) setAnswers(JSON.parse(cachedAnswers));
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_FASTAPI_URI}/assessment/holland/questions`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        const normalised: Question[] = (Array.isArray(data) ? data : data.questions ?? []).map(
          (item: string | { id?: string; text?: string; question?: string; category?: string }, i: number) =>
            typeof item === "string"
              ? { id: `q${i + 1}`, text: item }
              : { id: item.id ?? `q${i + 1}`, text: item.text ?? item.question ?? "", category: item.category }
        );
        setQuestions(normalised);
        localStorage.setItem(LS_QUESTIONS_KEY, JSON.stringify(normalised));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0)
      localStorage.setItem(LS_ANSWERS_KEY, JSON.stringify(answers));
  }, [answers]);

  const handleAnswer = (questionId: string, answer: string) =>
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    const questionIds = questions.map((q) => q.text);
    const answerList  = questions.map((q) => (answers[q.id] === "Yes" ? "yes" : "no"));
    try {
      const token      = await auth.currentUser!.getIdToken();
      const session_id = localStorage.getItem("session_id");

      const res = await fetch(`${import.meta.env.VITE_FASTAPI_URI}/assessment/holland/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id, questions: questionIds, answers: answerList }),
      });
      if (!res.ok) throw new Error(`Submission failed: ${res.status} — ${await res.text()}`);
      const result = await res.json();

      localStorage.setItem("holland_codes", JSON.stringify(result.holland_codes));
      localStorage.setItem("holland_jobs", JSON.stringify(result.jobs.map((item: { job: string }) => item.job)));

      const refinementRes = await fetch(`${import.meta.env.VITE_FASTAPI_URI}/assessment/refinement/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id, holland_codes: result.holland_codes, jobs: result.jobs }),
      });
      if (!refinementRes.ok) throw new Error(`Refinement fetch failed: ${refinementRes.status}`);
      const refinementData = await refinementRes.json();
      localStorage.setItem("refinement_questions", JSON.stringify(refinementData.questions));

      navigate("/test/round-2");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered   = questions.length > 0 && answeredCount === questions.length;

  useLeaveGuard(answeredCount > 0 && !submitting);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        roundLabel="Round 01: Cognitive Patterns"
        roundProgress={(answeredCount / (questions.length || 1)) * 100}
      />

      <main className="flex-grow flex flex-col items-center p-6 overflow-y-auto">
        <section className="max-w-3xl w-full space-y-12 pb-24">

          <div className="text-center py-10">
            <span className="inline-block py-1 px-4 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
              Assessment Started
            </span>
            <h2 className="text-3xl font-bold text-foreground">Cognitive Pattern Analysis</h2>
            <p className="mt-2 text-muted-foreground">Answer each statement honestly — there are no right or wrong answers.</p>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading questions…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm font-semibold">{error}</p>
              <button onClick={() => window.location.reload()}
                className="mt-2 px-5 py-2 border border-destructive rounded-custom text-sm font-medium hover:bg-destructive/10 transition-colors">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && questions.map((q, idx) => (
            <div key={q.id} className="bg-card p-8 md:p-10 rounded-custom shadow-sm border border-border">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold text-primary tracking-widest uppercase">
                  {q.category ?? "Question"}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{idx + 1} / {questions.length}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground leading-tight mb-8">{q.text}</h3>
              <div className="grid grid-cols-2 gap-4">
                {["Yes", "No"].map((option, i) => (
                  <label key={option}
                    className={`flex items-center justify-center gap-3 py-4 border-2 rounded-custom font-bold cursor-pointer transition-all ${
                      answers[q.id] === option
                        ? "bg-primary/10 border-primary text-foreground"
                        : "border-border text-muted-foreground hover:border-primary hover:bg-option-hover-bg hover:text-foreground"
                    }`}>
                    <input type="radio" name={q.id} value={option} checked={answers[q.id] === option}
                      onChange={() => handleAnswer(q.id, option)} className="sr-only" />
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">{i + 1}</span>
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {!loading && !error && questions.length > 0 && (
            <div className="text-center py-8 flex flex-col items-center gap-4">
              {submitError && (
                <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" /> {submitError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                  onClick={() => {
                    if (answeredCount === 0 || window.confirm("Your progress will be lost. Are you sure?")) {
                      navigate("/auth");
                    }
                  }}
                  className="flex-1 px-8 py-4 text-muted-foreground font-bold rounded-custom border-2 border-border hover:bg-muted transition-colors"
                >
                  Discard Draft
                </button>
                <button onClick={handleSubmit} disabled={!allAnswered || submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-custom text-lg font-bold hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {submitting ? "Submitting…" : "Submit Answers"}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
            <span>Select Yes or No for each statement to proceed.</span>
          </div>

        </section>
      </main>

      <footer className="p-6 text-center text-muted-foreground text-xs bg-card border-t border-border flex-shrink-0">
        <p>© 2024 PsycheAdapt Adaptive Systems. All data is encrypted and anonymized.</p>
      </footer>
    </div>
  );
};

export default Round1;