import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Network, X } from "lucide-react";
import { Graph } from "../components/Graph";

// ── Cookie helper ────────────────────────────────────────────────────────────
function parseCookieJSON<T>(name: string): T | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match.split("=")[1])) as T; } catch { return null; }
}

const Round3 = () => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [cookieError, setCookieError] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [refinementJobs, setRefinementJobs] = useState<string[]>([]);

  useEffect(() => {
    const parsed = JSON.parse(localStorage.getItem("final_questions") ?? "null") as string[] | null;
    if (!parsed || parsed.length === 0) { setCookieError(true); return; }
    setQuestions(parsed);
  }, []);

  // Load refinement_jobs from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("refinement_jobs");
      const parsed: object[] = raw ? JSON.parse(raw) : [];
      const jobNames = parsed.map((j: any) =>
        typeof j === "string" ? j : j.job_name ?? j.name ?? String(j)
      );
      setRefinementJobs(jobNames);
    } catch {
      setRefinementJobs([]);
    }
  }, []);

  const progress = questions.length
    ? (Object.keys(answers).length / questions.length) * 100
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Top navbar ── */}
      <header className="bg-card border-b border-border py-4 px-6 sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-primary-foreground font-bold text-xl">Ψ</div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-foreground">PsycheAdapt</h1>
              <p className="text-xs text-muted-foreground">Adaptive Intelligence Test</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Graph toggle */}
            <button
              onClick={() => setGraphOpen((prev) => !prev)}
              title="Toggle job graph"
              className={`relative p-2 rounded-custom border transition-all duration-200 ${
                graphOpen
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              <Network className="h-5 w-5" />
              {refinementJobs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {refinementJobs.length}
                </span>
              )}
            </button>

            <div className="text-right">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Round 03: Final Evaluation</span>
              <div className="w-32 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body: split layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Questions pane ── */}
        <main
          className={`flex-grow flex flex-col items-center p-4 md:p-8 overflow-y-auto transition-all duration-500 ease-in-out ${
            graphOpen ? "max-w-[55%]" : "max-w-full w-full"
          }`}
        >
          <div className="w-full max-w-3xl bg-card shadow-xl rounded-custom border border-border overflow-hidden flex flex-col">

            {/* Card header */}
            <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-foreground">Psychometric Assessment</h2>
                <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">Phase 03: Final Evaluation</p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-custom">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
                <span className="text-xs font-bold text-primary tracking-wider uppercase">Deep Analysis Active</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-6 py-4 bg-muted border-b border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Final Verification Series</span>
                <span className="text-xs font-semibold text-primary">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-progress-track h-2 rounded-custom overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Questions */}
            <section className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-grow">
              <div className="mb-10 p-4 bg-muted border-l-4 border-primary rounded-custom">
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                  "The engine is now cross-referencing your previous logic patterns. Please confirm the following deep-dive propositions to finalize your profile."
                </p>
              </div>

              {cookieError && (
                <div className="flex flex-col items-center gap-3 py-16 text-destructive">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm font-semibold text-center">Could not load final questions. Please complete Round 2 first.</p>
                  <Link
                    to="/test/round-2"
                    className="mt-2 px-5 py-2 border border-destructive rounded-custom text-sm font-medium hover:bg-destructive/10 transition-colors"
                  >
                    Back to Round 2
                  </Link>
                </div>
              )}

              {!cookieError && (
                <div className="space-y-12">
                  {questions.map((q, idx) => (
                    <article key={idx} className="space-y-6">
                      <h2 className="text-lg font-semibold text-foreground leading-snug">
                        {idx + 1}. {q}
                      </h2>
                      <div className="flex gap-4">
                        {["YES", "NO"].map((option) => (
                          <button
                            key={option}
                            onClick={() => setAnswers((prev) => ({ ...prev, [idx]: option }))}
                            className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 transition-all rounded-custom focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                              answers[idx] === option
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary hover:bg-option-hover-bg"
                            }`}
                          >
                            <span className="text-foreground font-bold">{option}</span>
                          </button>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="p-6 bg-muted border-t border-border flex justify-between items-center">
              <Link to="/test/round-2" className="px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Previous Section
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-custom hover:bg-accent transition-all shadow-md active:scale-95"
              >
                Finalize Analysis
              </Link>
            </footer>
          </div>

          <div className="mt-8 text-center pb-8">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              Encrypted Session • AI Engine v4.2 Deep Dive
            </p>
          </div>
        </main>

        {/* ── Graph panel ── */}
        <aside
          className={`border-l border-border bg-card flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
            graphOpen ? "w-[45%] opacity-100" : "w-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground tracking-wide">Job Knowledge Graph</span>
              {refinementJobs.length > 0 && (
                <span className="text-xs text-muted-foreground">({refinementJobs.length} jobs)</span>
              )}
            </div>
            <button
              onClick={() => setGraphOpen(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {graphOpen && <Graph jobs={refinementJobs} limit={5000} />}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Round3;