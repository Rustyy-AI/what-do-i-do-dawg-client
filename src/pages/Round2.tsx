import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lightbulb, Info } from "lucide-react";

const questions = [
  { id: "ai1", module: "Conflict Resolution", code: "AI_GEN_882", text: "In a high-stakes negotiation where data is conflicting, would you prioritize the emotional state of the participants over the accuracy of the datasets?" },
  { id: "ai2", module: "Risk Assessment", code: "AI_GEN_883", text: "Based on your previous speed, we've increased complexity. Do you prefer iterative trials over comprehensive theoretical modeling?" },
  { id: "ai3", module: "Ethical Frameworks", code: "AI_GEN_884", text: "In an automated system failure, would you override the safety protocol if you believed your intuition was more accurate than the logged data?" },
];

const Round2 = () => {
  const [phase, setPhase] = useState<"analyzing" | "testing">("analyzing");
  const [progressWidth, setProgressWidth] = useState("0%");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    const t1 = setTimeout(() => setProgressWidth("100%"), 100);
    const t2 = setTimeout(() => setPhase("testing"), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleAnswer = (id: string, answer: string, idx: number) => {
    setAnswers((prev) => ({ ...prev, [id]: answer }));
    // Reveal next card
    setVisibleCards((prev) => new Set([...prev, idx + 1]));
  };

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
              <div className="h-full bg-primary transition-all" style={{ width: `${66 + (Object.keys(answers).length / questions.length) * 34}%` }} />
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

          {questions.map((q, idx) => {
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
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">Module: {q.module}</span>
                  <span className="text-xs text-muted-foreground font-mono">ID: {q.code}</span>
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

          {Object.keys(answers).length === questions.length && (
            <div className="text-center py-8">
              <Link
                to="/test/round-3"
                className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-custom text-lg font-bold hover:bg-accent transition-all"
              >
                Proceed to Round 3
              </Link>
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
