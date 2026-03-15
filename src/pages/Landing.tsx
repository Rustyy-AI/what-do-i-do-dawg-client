import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <header className="hero-gradient overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6 text-balance">
              Uncover Your True Potential with{" "}
              <span className="text-primary">AI-Driven</span> Psychometrics
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              The next generation of behavioral assessment. More accurate, less
              biased, and deeply personalized through three evolutionary testing
              rounds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/auth"
                className="bg-primary text-primary-foreground px-10 py-4 rounded-custom text-lg font-bold hover:bg-accent transition-all shadow-lg"
              >
                Start Test Now
              </Link>
              <Link
                to="/dashboard"
                className="bg-card text-foreground border-2 border-border px-10 py-4 rounded-custom text-lg font-bold hover:bg-secondary transition-all"
              >
                View Sample Report
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 3-Round Process */}
      <section className="py-24 bg-card" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The 3-Round Intelligence Process
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Round 1 */}
            <div className="group p-8 rounded-custom bg-background border border-border hover:shadow-card-hover transition-all duration-300">
              <div className="w-16 h-16 bg-card rounded-custom shadow-sm border border-border flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-accent">01</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Fixed Baseline
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A standardized set of foundational questions to establish your
                core psychometric baseline across universal psychological
                markers.
              </p>
            </div>

            {/* Round 2 */}
            <div className="group p-8 rounded-custom bg-secondary border-2 border-primary/20 hover:shadow-card-hover transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                Most Accurate
              </div>
              <div className="w-16 h-16 bg-card rounded-custom shadow-sm border border-border flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary">02</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                AI-Adaptive
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our engine learns from Round 1 to present challenges that
                dynamically adjust in difficulty and topic, drilling into your
                specific strengths.
              </p>
            </div>

            {/* Round 3 */}
            <div className="group p-8 rounded-custom bg-background border border-border hover:shadow-card-hover transition-all duration-300">
              <div className="w-16 h-16 bg-card rounded-custom shadow-sm border border-border flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-accent">03</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Deep AI Insight
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A conversational AI interface that explores nuance, emotional
                intelligence, and complex problem-solving through open-ended
                scenarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cta-bg py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-cta-foreground mb-6">
            Ready to see your behavioral profile?
          </h2>
          <p className="text-cta-foreground/60 text-lg mb-10 max-w-2xl mx-auto">
            Join 50,000+ professionals using AI to understand their cognitive
            patterns and career fit.
          </p>
          <div className="flex justify-center">
            <Link
              to="/auth"
              className="bg-primary text-primary-foreground px-12 py-5 rounded-custom text-xl font-bold hover:bg-card hover:text-primary transition-all flex items-center gap-3 group"
            >
              Start Test
              <ArrowRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="mt-6 text-cta-foreground/40 text-sm">
            Takes approximately 15 minutes. No credit card required for initial
            results.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-custom flex items-center justify-center text-primary-foreground font-bold text-sm">
                P
              </div>
              <span className="text-xl font-bold text-foreground">
                Psycho<span className="text-primary">AI</span>
              </span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground font-medium">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
              <a href="#" className="hover:text-primary">Scientific Basis</a>
              <a href="#" className="hover:text-primary">Contact</a>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2024 PsychoAI Labs. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
