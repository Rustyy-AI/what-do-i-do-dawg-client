import { useState } from "react";
import { Link } from "react-router-dom";

const questions = [
  "Would you sacrifice short-term profitability to ensure long-term alignment with your core ethical values?",
  "Do you believe a leader's primary responsibility is to the shareholders over the community impact?",
  "In a crisis, would you prioritize maintaining internal morale over external transparency?",
  "Is radical innovation more important than operational stability in your current strategic framework?",
];

const Round3 = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-background">
      <main className="w-full max-w-3xl bg-card shadow-xl rounded-custom border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground">Psychometric Assessment</h1>
            <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">Phase 03: Final Evaluation</p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-custom">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <span className="text-xs font-bold text-primary tracking-wider uppercase">Deep Analysis Active</span>
          </div>
        </header>

        {/* Progress */}
        <div className="px-6 py-4 bg-muted border-b border-border shrink-0">
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
        </section>

        {/* Footer */}
        <footer className="p-6 bg-muted border-t border-border flex justify-between items-center shrink-0">
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
      </main>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-xs tracking-widest uppercase">
          Encrypted Session • AI Engine v4.2 Deep Dive
        </p>
      </div>
    </div>
  );
};

export default Round3;
