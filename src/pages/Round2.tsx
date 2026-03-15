import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Info, AlertCircle, Loader2 } from "lucide-react";

// ── Cookie helpers ───────────────────────────────────────────────────────────
function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function parseCookieJSON<T>(name: string): T | null {
  const raw = getCookie(name);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

interface Question {
  id: string;
  text: string;
}

const Round2 = () => {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<"analyzing" | "testing">("analyzing");
  const [progressWidth, setProgressWidth] = useState("0%");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set([0]));
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cookieError, setCookieError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load refinement questions from cookie
  useEffect(() => {
    try {
      const raw = localStorage.getItem("refinement_questions");
      const parsed: string[] | null = raw ? JSON.parse(raw) : null;
      if (!parsed || parsed.length === 0) { setCookieError(true); return; }
      setQuestions(parsed.map((text, i) => ({ id: `rq${i + 1}`, text })));
    } catch { setCookieError(true); }
  }, []);

  // Analyzing phase timer
  useEffect(() => {
    const t1 = setTimeout(() => setProgressWidth("100%"), 100);
    const t2 = setTimeout(() => setPhase("testing"), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleAnswer = (id: string, answer: string, idx: number) => {
    setAnswers((prev) => ({ ...prev, [id]: answer }));
    setVisibleCards((prev) => new Set([...prev, idx + 1]));
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitting(true);

    const hollandCodes = parseCookieJSON<string[]>("holland_codes") ?? [];
    const hollandJobs  = JSON.parse(localStorage.getItem("holland_jobs") ?? "[]");
    const refinementQs = JSON.parse(localStorage.getItem("refinement_questions") ?? "[]");
    const answerList   = questions.map((q) => answers[q.id].toLowerCase());

    const refinementPayload = {
      holland_codes: hollandCodes,
      jobs: hollandJobs,
      questions: refinementQs,
      answers: answerList,
    };
    console.log("[Refinement Submit] holland_codes:", hollandCodes);
    console.log("[Refinement Submit] jobs count:", hollandJobs.length);
    console.log("[Refinement Submit] questions count:", refinementQs.length);
    console.log("[Refinement Submit] answers count:", answerList.length);
    console.log("[Refinement Submit] answers:", answerList);

    try {
      // 1. Submit refinement answers
      const submitRes = await fetch("http://127.0.0.1:8000/assessment/refinement/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refinementPayload),
      });
      if (!submitRes.ok) {
        const errBody = await submitRes.text();
        console.error("[Refinement Submit] 400 body:", errBody);
        throw new Error(`Refinement submit failed: ${submitRes.status} — ${errBody}`);
      }
      const submitData = await submitRes.json();
      const refinedJobs: object[] = submitData.jobs;
      localStorage.setItem("refinement_jobs", JSON.stringify(refinedJobs));

      // 2. Fetch final questions using refined jobs
      const finalQRes = await fetch("http://127.0.0.1:8000/assessment/final/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holland_codes: hollandCodes,
          jobs: refinedJobs,
        }),
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

  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length;

  // ── Analyzing phase ──────────────────────────────────────────────────────
  if (phase === "analyzing") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-card border-b border-border py-4 px-6 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-primary-foreground font-bold text-xl">Ψ</div>
              <div>
                <h1 className="text-lg font-bold leading-tight text-foreground">PsycheAdapt</h1>
                <p className="text-xs text-muted-foreground">Adaptive Intelligence Test</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Round 02: Neural Mapping</span>
            </div>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center p-6">
          <section className="max-w-md w-full text-center py-24">
            <div className="mb-8 relative flex justify-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-soft">
                <Lightbulb className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-primary/30 animate-[spin_10s_linear_infinite]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">AI Analyzing Round 1...</h2>
            <p className="text-muted-foreground mb-8">Synthesizing your cognitive patterns to generate personalized Round 2 challenges.</p>
            <div className="space-y-4 text-left max-w-xs mx-auto mb-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Decision speed calibrated</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Emotional bias detected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                <span className="text-sm text-muted-foreground font-medium">Adapting complexity levels...</span>
              </div>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-[3s] ease-in-out"
                style={{ width: progressWidth }}
              />
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ── Testing phase ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border py-4 px-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-primary-foreground font-bold text-xl">Ψ</div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-foreground">PsycheAdapt</h1>
              <p className="text-xs text-muted-foreground">Adaptive Intelligence Test</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Round 02: Neural Mapping</span>
            <div className="w-32 h-2 bg-muted rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${66 + (questions.length ? (Object.keys(answers).length / questions.length) * 34 : 0)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center p-6">
        <section className="max-w-3xl w-full space-y-12 pb-24">
          <div className="text-center py-10">
            <span className="inline-block py-1 px-4 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
              Adaptive Session Started
            </span>
            <h2 className="text-3xl font-bold text-foreground">Cognitive Alignment Stream</h2>
            <p className="mt-2 text-muted-foreground">The AI will generate questions based on your real-time responses.</p>
          </div>

          {/* Cookie error state */}
          {cookieError && (
            <div className="flex flex-col items-center gap-3 py-16 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm font-semibold">Could not load refinement questions. Please complete Round 1 first.</p>
            </div>
          )}

          {/* Questions */}
          {!cookieError && questions.map((q, idx) => {
            const isVisible = visibleCards.has(idx);
            const isAnswered = !!answers[q.id];
            return (
              <div
                key={q.id}
                className={`bg-card p-8 md:p-10 rounded-custom shadow-sm border border-border transition-all duration-600 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none translate-y-5"
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">
                    Refinement Question
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {idx + 1} / {questions.length}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground leading-tight mb-8">{q.text}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {["Yes", "No"].map((option, i) => (
                    <button
                      key={option}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(q.id, option, idx)}
                      className={`flex items-center justify-center gap-3 py-4 border-2 rounded-custom font-bold transition-all group ${
                        answers[q.id] === option
                          ? "bg-primary/10 border-primary text-foreground"
                          : isAnswered
                          ? "border-border text-muted-foreground opacity-50 cursor-not-allowed"
                          : "border-border text-muted-foreground hover:border-primary hover:bg-option-hover-bg hover:text-foreground"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      {answers[q.id] === option ? "Saved" : option}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Submit button + error */}
          {!cookieError && allAnswered && (
            <div className="text-center py-8 flex flex-col items-center gap-4">
              {submitError && (
                <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-custom text-lg font-bold hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {submitting ? "Processing..." : "Proceed to Round 3"}
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
            <Info className="h-4 w-4" />
            <span>Questions are streaming in real-time as the AI adapts to your responses.</span>
          </div>
        </section>
      </main>

      <footer className="p-6 text-center text-muted-foreground text-xs bg-card border-t border-border">
        <p>© 2024 PsycheAdapt Adaptive Systems. All data is encrypted and anonymized.</p>
      </footer>
    </div>
  );
};

export default Round2;