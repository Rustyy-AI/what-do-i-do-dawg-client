/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { useLeaveGuard } from "@/hooks/useLeaveGuard";
import { Graph } from "../components/Graph";
import Navbar from "../components/Navbar";
import { auth } from "@/firebase";

function getLS<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : null; } catch { return null; }
}

interface Question { id: string; text: string; }

const Round2 = () => {
  const navigate = useNavigate();
  const [answers, setAnswers]         = useState<Record<string, string>>({});
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [cookieError, setCookieError] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [graphOpen, setGraphOpen]     = useState(false);
  const [hollandJobs, setHollandJobs] = useState<string[]>([]);

  useEffect(() => {
    const parsed = getLS<string[]>("refinement_questions");
    if (!parsed || parsed.length === 0) { setCookieError(true); return; }
    setQuestions(parsed.map((text, i) => ({ id: `rq${i + 1}`, text })));
  }, []);

  useEffect(() => {
    const parsed = getLS<any[]>("holland_jobs") ?? [];
    setHollandJobs(parsed.map((j) => typeof j === "string" ? j : j.job_name ?? j.name ?? String(j)));
  }, []);

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const token         = await auth.currentUser!.getIdToken();
      const session_id    = localStorage.getItem("session_id");
      const hollandCodes  = getLS<string[]>("holland_codes") ?? [];
      const hollandJobsRaw = getLS<any[]>("holland_jobs") ?? [];
      const refinementQs  = getLS<string[]>("refinement_questions") ?? [];
      const answerList    = questions.map((q) => answers[q.id].toLowerCase());

      const submitRes = await fetch("http://127.0.0.1:8000/assessment/refinement/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id, holland_codes: hollandCodes, jobs: hollandJobsRaw, questions: refinementQs, answers: answerList }),
      });
      if (!submitRes.ok) throw new Error(`Refinement submit failed: ${submitRes.status} — ${await submitRes.text()}`);
      const submitData = await submitRes.json();
      localStorage.setItem("refinement_jobs", JSON.stringify(submitData.jobs));

      const finalQRes = await fetch("http://127.0.0.1:8000/assessment/final/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ session_id, holland_codes: hollandCodes, jobs: submitData.jobs }),
      });
      if (!finalQRes.ok) throw new Error(`Final questions fetch failed: ${finalQRes.status}`);
      const finalQData = await finalQRes.json();
      localStorage.setItem("final_questions", JSON.stringify(finalQData.questions));
      navigate("/test/round-3");
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
        roundLabel="Round 02: Neural Mapping"
        roundProgress={(answeredCount / (questions.length || 1)) * 100}
        showGraphToggle
        graphOpen={graphOpen}
        onGraphToggle={() => setGraphOpen((prev) => !prev)}
        graphJobCount={hollandJobs.length}
      />

      <div className="flex flex-1 overflow-hidden">
        <main className={`flex-grow flex flex-col items-center p-6 overflow-y-auto transition-all duration-500 ease-in-out ${
          graphOpen ? "max-w-[55%]" : "max-w-full w-full"
        }`}>
          <section className="max-w-3xl w-full space-y-12 pb-24">

            <div className="text-center py-10">
              <span className="inline-block py-1 px-4 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
                Adaptive Session
              </span>
              <h2 className="text-3xl font-bold text-foreground">Neural Mapping</h2>
              <p className="mt-2 text-muted-foreground">Refining your profile — answer each question to narrow down your ideal career paths.</p>
            </div>

            {cookieError && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-destructive">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm font-semibold">Could not load questions. Please complete Round 1 first.</p>
              </div>
            )}

            {!cookieError && questions.map((q, idx) => (
              <div key={q.id} className="bg-card p-8 md:p-10 rounded-custom shadow-sm border border-border">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">Question</span>
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
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))} className="sr-only" />
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
                        navigate("/test/round-1");
                      }
                    }}
                    className="flex-1 px-8 py-4 text-muted-foreground font-bold rounded-custom border-2 border-border hover:bg-muted transition-colors"
                  >
                    Previous Section
                  </button>
                  <button onClick={handleSubmit} disabled={!allAnswered || submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-custom text-lg font-bold hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                    {submitting ? "Processing..." : "Proceed to Round 3"}
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
              {hollandJobs.length > 0 && <span className="text-xs text-muted-foreground">({hollandJobs.length} jobs)</span>}
            </div>
            <button onClick={() => setGraphOpen(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-medium">
              Close
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            {graphOpen && <Graph jobs={hollandJobs} limit={5000} />}
          </div>
        </aside>
      </div>

      <footer className="p-6 text-center text-muted-foreground text-xs bg-card border-t border-border flex-shrink-0">
        <p>© 2024 PsycheAdapt Adaptive Systems. All data is encrypted and anonymized.</p>
      </footer>
    </div>
  );
};

export default Round2;