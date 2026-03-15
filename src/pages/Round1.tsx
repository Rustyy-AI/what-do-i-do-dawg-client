import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";

const questions = [
  { id: "q1", category: "Logical Reasoning", text: "Does the sequence 3, 9, 25, 49 correctly follow the rule of squares for odd prime numbers?" },
  { id: "q2", category: "Pattern Recognition", text: 'In the pattern "Circle, Square, Circle, Triangle", is the third element identical to the first?' },
  { id: "q3", category: "Analytical Thinking", text: "If all A are B, and some B are C, is it necessarily true that some A are C?" },
  { id: "q4", category: "Spatial Reasoning", text: "Would a 3D cube appear as a hexagon when viewed directly through one of its corners?" },
  { id: "q5", category: "Numerical Sequences", text: "In the series 2, 4, 8, 16, is the next number 32?" },
  { id: "q6", category: "Verbal Reasoning", text: 'Is the word "Incite" a synonym for "Quell"?' },
];

const Round1 = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const answeredCount = Object.keys(answers).length;

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
          <div className="text-sm font-medium text-muted-foreground">
            Round 1: Cognitive Patterns
          </div>
        </div>
      </header>

      <main className="py-10 px-4">
        <div className="max-w-[800px] mx-auto">
          {/* Progress */}
          <section className="mb-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-primary">Assessment Progress</span>
              <span className="text-sm text-muted-foreground">{answeredCount} of {questions.length} answered</span>
            </div>
            <div className="w-full bg-progress-track h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </section>

          {/* Questions */}
          <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {questions.map((q, idx) => (
              <article
                key={q.id}
                className="bg-card rounded-custom shadow-sm border border-question-border p-6"
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-badge-bg text-primary text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
                    {q.category} - Q{idx + 1}
                  </span>
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
                      <span className={`ml-3 font-medium ${
                        answers[q.id] === option ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground"
                      }`}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>

          {/* Navigation */}
          <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 mt-6 border-t border-border">
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-3 text-muted-foreground font-semibold rounded-custom border border-border hover:bg-muted transition-colors text-center"
            >
              Discard Draft
            </Link>
            <Link
              to="/test/round-2"
              className="w-full sm:w-auto px-10 py-3 bg-primary text-primary-foreground font-bold rounded-custom shadow-lg hover:bg-accent transition-all active:scale-95 text-center"
            >
              Submit All Answers
            </Link>
          </nav>

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
