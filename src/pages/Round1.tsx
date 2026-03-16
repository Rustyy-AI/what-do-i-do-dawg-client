import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, Loader2, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  category?: string;
}

// ── Cookie helpers ──────────────────────────────────────────────────────────
const COOKIE_QUESTIONS_KEY = "holland_questions";
const COOKIE_ANSWERS_KEY   = "holland_answers";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

// ── Component ───────────────────────────────────────────────────────────────
const Round1 = () => {
  const navigate = useNavigate();

  const [questions, setQuestions]   = useState<Question[]>([]);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Fetch questions (or restore from cookie) ──────────────────────────────
  useEffect(() => {
    const cachedQuestions = getCookie(COOKIE_QUESTIONS_KEY);
    const cachedAnswers   = getCookie(COOKIE_ANSWERS_KEY);

    if (cachedQuestions) {
      try {
        setQuestions(JSON.parse(cachedQuestions));
        if (cachedAnswers) setAnswers(JSON.parse(cachedAnswers));
        setLoading(false);
        return;
      } catch {
        // corrupted cookie — fall through to fetch
      }
    }

    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/assessment/holland/questions");
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();

        // Normalise: accept array of strings OR array of objects
        const normalised: Question[] = (Array.isArray(data) ? data : data.questions ?? []).map(
          (item: string | { id?: string; text?: string; question?: string; category?: string }, i: number) =>
            typeof item === "string"
              ? { id: `q${i + 1}`, text: item }
              : { id: item.id ?? `q${i + 1}`, text: item.text ?? item.question ?? "", category: item.category }
        );

        setQuestions(normalised);
        setCookie(COOKIE_QUESTIONS_KEY, JSON.stringify(normalised));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Persist answers to cookie on every change ─────────────────────────────
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      setCookie(COOKIE_ANSWERS_KEY, JSON.stringify(answers));
    }
  }, [answers]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);

    // Build parallel arrays expected by the API
    // answers list: "<question_id> <true|false>"
    const questionIds: string[] = questions.map((q) => q.text);
    const answerList: string[]  = questions.map((q) =>
      answers[q.id] === "Yes" ? "yes" : "no"
    );

    try {
      const payload = { questions: questionIds, answers: answerList };
      console.log("[Holland Submit] payload:", JSON.stringify(payload, null, 2));

      const res = await fetch("http://127.0.0.1:8000/assessment/holland/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error("[Holland Submit] error body:", errBody);
        throw new Error(`Submission failed: ${res.status} — ${errBody}`);
      }
      const result = await res.json();
      setCookie("holland_codes", JSON.stringify(result.holland_codes));
      localStorage.setItem("holland_jobs", JSON.stringify(result.jobs.map((item: {job: string}) => item.job)));
      console.log(localStorage.getItem("holland_jobs"))
      // Fetch refinement questions using holland results
      const refinementRes = await fetch("http://127.0.0.1:8000/assessment/refinement/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holland_codes: result.holland_codes, jobs: result.jobs }),
      });
      if (!refinementRes.ok) throw new Error(`Refinement fetch failed: ${refinementRes.status}`);
      const refinementData = await refinementRes.json();
      localStorage.setItem("refinement_questions", JSON.stringify(refinementData.questions));

      navigate("/test/round-2");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered   = questions.length > 0 && answeredCount === questions.length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full bg-card border-b border-border py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[800px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-custom flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">CogniAssess</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">Round 1: Cognitive Patterns</div>
        </div>
      </header>

      <main className="py-10 px-4">
        <div className="max-w-[800px] mx-auto">

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading questions…</p>
            </div>
          )}

          {/* ── Fetch error ── */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-5 py-2 border border-destructive rounded-custom text-sm font-medium hover:bg-destructive/10 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Questions ── */}
          {!loading && !error && questions.length > 0 && (
            <>
              {/* Progress */}
              <section className="mb-10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-primary">Assessment Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {answeredCount} of {questions.length} answered
                  </span>
                </div>
                <div className="w-full bg-progress-track h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
              </section>

              {/* Question cards */}
              <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {questions.map((q, idx) => (
                  <article
                    key={q.id}
                    className="bg-card rounded-custom shadow-sm border border-question-border p-6"
                  >
                    <div className="mb-4">
                      {q.category && (
                        <span className="inline-block px-3 py-1 bg-badge-bg text-primary text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
                          {q.category} — Q{idx + 1}
                        </span>
                      )}
                      {!q.category && (
                        <span className="inline-block px-3 py-1 bg-badge-bg text-primary text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
                          Q{idx + 1}
                        </span>
                      )}
                      <h2 className="text-lg font-semibold leading-snug text-foreground">{q.text}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {["Yes", "No"].map((option) => (
                        <label
                          key={option}
                          className={`flex items-center p-3 border rounded-custom cursor-pointer transition-all group ${
                            answers[q.id] === option
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary hover:bg-option-hover-bg"
                          }`}
                        >
                          <input
                            className="w-4 h-4 text-primary border-border focus:ring-primary"
                            name={q.id}
                            type="radio"
                            value={option}
                            checked={answers[q.id] === option}
                            onChange={() => handleAnswer(q.id, option)}
                          />
                          <span
                            className={`ml-3 font-medium ${
                              answers[q.id] === option
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground group-hover:text-foreground"
                            }`}
                          >
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="mt-4 flex items-center gap-2 text-destructive text-sm font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              {/* Navigation */}
              <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-6 border-t border-border">
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-8 py-3 text-muted-foreground font-semibold rounded-custom border border-border hover:bg-muted transition-colors text-center"
                >
                  Discard Draft
                </Link>
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className="w-full sm:w-auto px-10 py-3 bg-primary text-primary-foreground font-bold rounded-custom shadow-lg hover:bg-accent transition-all active:scale-95 text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Submitting…" : "Submit All Answers"}
                </button>
              </nav>
            </>
          )}

          <footer className="mt-12 text-center text-muted-foreground text-sm">
            <p>Instructions: Scroll through the list and select Yes or No for each statement.</p>
            <p className="mt-2">© 2024 Psychometric Systems Inc. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Round1;