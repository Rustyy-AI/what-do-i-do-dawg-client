/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { Graph } from "../components/Graph";
import Navbar from "../components/Navbar";
import { auth } from "@/firebase";

function getLS<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : null; } catch { return null; }
}

const Round3 = () => {
  const navigate = useNavigate();
  const [questions, setQuestions]           = useState<string[]>([]);
  const [answers, setAnswers]               = useState<Record<number, string>>({});
  const [cookieError, setCookieError]       = useState(false);
  const [graphOpen, setGraphOpen]           = useState(false);
  const [refinementJobs, setRefinementJobs] = useState<string[]>([]);
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState<string | null>(null);

  useEffect(() => {
    const parsed = getLS<string[]>("final_questions");
    if (!parsed || parsed.length === 0) { setCookieError(true); return; }
    setQuestions(parsed);
  }, []);

  useEffect(() => {
    const parsed = getLS<any[]>("refinement_jobs") ?? [];
    setRefinementJobs(parsed.map((j) => typeof j === "string" ? j : j.job_name ?? j.name ?? String(j)));
  }, []);

  const answeredCount = Object.keys(answers).length;
  const allAnswered   = questions.length > 0 && answeredCount === questions.length;
  const progress      = questions.length ? (answeredCount / questions.length) * 100 : 0;

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const token        = await auth.currentUser!.getIdToken();
      const session_id   = localStorage.getItem("session_id");
      const hollandCodes = getLS<string[]>("holland_codes") ?? [];
      const refinedJobs  = getLS<any[]>("refinement_jobs") ?? [];
      const finalQs      = getLS<string[]>("final_questions") ?? [];
      const answerList   = questions.map((_, idx) => answers[idx].toLowerCase());

      const res = await fetch(`${import.meta.env.VITE_FASTAPI_URI}/assessment/final/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id,
          holland_codes: hollandCodes,
          jobs: refinedJobs,
          questions: finalQs,
          answers: answerList,
        }),
      });
      if (!res.ok) throw new Error(`Submit failed: ${res.status} — ${await res.text()}`);
      const data = await res.json();
      localStorage.setItem("final_careers", JSON.stringify(data.final_careers));
      navigate("/dashboard");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  useLeaveGuard(answeredCount > 0 && !submitting);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        roundLabel="Round 03: Final Evaluation"
        roundProgress={progress}
        showGraphToggle
        graphOpen={graphOpen}
        onGraphToggle={() => setGraphOpen((prev) => !prev)}
        graphJobCount={refinementJobs.length}
      />

      <div className="flex flex-1 overflow-hidden">
        <main className={`flex-grow flex flex-col items-center p-6 overflow-y-auto transition-all duration-500 ease-in-out ${
          graphOpen ? "max-w-[55%]" : "max-w-full w-full"
        }`}>
          <section className="max-w-3xl w-full space-y-12 pb-24">

            <div className="text-center py-10">
              <span className="inline-block py-1 px-4 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
                Final Round
              </span>
              <h2 className="text-3xl font-bold text-foreground">Deep Profile Verification</h2>
              <p className="mt-2 text-muted-foreground">Cross-referencing your previous patterns — confirm each proposition to finalize your profile.</p>
            </div>

            {cookieError && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm font-semibold text-center">Could not load final questions. Please complete Round 2 first.</p>
                <Link to="/test/round-2" className="mt-2 px-5 py-2 border border-destructive rounded-custom text-sm font-medium hover:bg-destructive/10 transition-colors">
                  Back to Round 2
                </Link>
              </div>
            )}

            {!cookieError && questions.map((q, idx) => (
              <div key={idx} className="bg-card p-8 md:p-10 rounded-custom shadow-sm border border-border">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">Question</span>
                  <span className="text-xs text-muted-foreground font-mono">{idx + 1} / {questions.length}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground leading-tight mb-8">{q}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {["Yes", "No"].map((option, i) => (
                    <label key={option}
                      className={`flex items-center justify-center gap-3 py-4 border-2 rounded-custom font-bold cursor-pointer transition-all ${
                        answers[idx] === option
                          ? "bg-primary/10 border-primary text-foreground"
                          : "border-border text-muted-foreground hover:border-primary hover:bg-option-hover-bg hover:text-foreground"
                      }`}>
                      <input type="radio" name={`q${idx}`} value={option} checked={answers[idx] === option}
                        onChange={() => setAnswers((prev) => ({ ...prev, [idx]: option }))} className="sr-only" />
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">{i + 1}</span>
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {!cookieError && questions.length > 0 && (
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
                        navigate("/test/round-2");
                      }
                    }}
                    className="flex-1 px-8 py-4 text-muted-foreground font-bold rounded-custom border-2 border-border hover:bg-muted transition-colors"
                  >
                    Previous Section
                  </button>
                  <button onClick={handleSubmit} disabled={!allAnswered || submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-custom text-lg font-bold hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                    {submitting ? "Analyzing..." : "Finalize Analysis"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center text-muted-foreground text-xs">
              <span>Select Yes or No for each statement to proceed.</span>
            </div>

          </section>
        </main>

        <aside className={`border-l border-border bg-card flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
          graphOpen ? "w-[45%] opacity-100" : "w-0 opacity-0 pointer-events-none"
        }`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground tracking-wide">Job Knowledge Graph</span>
              {refinementJobs.length > 0 && <span className="text-xs text-muted-foreground">({refinementJobs.length} jobs)</span>}
            </div>
            <button onClick={() => setGraphOpen(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-medium">
              Close
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            {graphOpen && <Graph jobs={refinementJobs} limit={5000} />}
          </div>
        </aside>
      </div>

      <footer className="p-6 text-center text-muted-foreground text-xs bg-card border-t border-border flex-shrink-0">
        <p>© 2024 PsycheAdapt Adaptive Systems. All data is encrypted and anonymized.</p>
      </footer>
    </div>
  );
};

export default Round3;