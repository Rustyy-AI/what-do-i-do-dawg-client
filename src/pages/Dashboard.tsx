import { Link } from "react-router-dom";
import { BarChart3, User } from "lucide-react";
import Navbar from "@/components/Navbar";

const traits = [
  { name: "Openness to Experience", value: 88, desc: "High scores suggest creativity, curiosity, and a preference for novelty." },
  { name: "Conscientiousness", value: 72, desc: "Reflects your organization, dependability, and discipline." },
  { name: "Extraversion", value: 65 },
  { name: "Agreeableness", value: 54 },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Summary Hero */}
        <section className="mb-12">
          <div className="bg-card p-8 rounded-custom shadow-sm border border-border flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0 w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User className="w-16 h-16" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Alex Johnson, The "Strategic Catalyst"
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Based on your responses, you possess a rare blend of analytical precision and visionary leadership. You excel in high-stakes environments where complex problem-solving meets interpersonal influence.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                {["Visionary", "Analytical", "Empathetic"].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-badge-bg text-primary text-xs font-bold uppercase rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Traits */}
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-card p-6 rounded-custom shadow-sm border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Core Personality Breakdown
              </h2>
              <div className="space-y-6">
                {traits.map((trait) => (
                  <div key={trait.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground">{trait.name}</span>
                      <span className="text-sm font-bold text-primary">{trait.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full transition-all duration-1000" style={{ width: `${trait.value}%` }} />
                    </div>
                    {trait.desc && <p className="mt-2 text-xs text-muted-foreground italic">{trait.desc}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-primary/5 p-8 rounded-custom border border-primary/20">
              <h2 className="text-xl font-bold text-primary mb-4">Insights & Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                    Career Path
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You thrive in roles that require long-term strategy and independent decision making. Consider paths in Product Leadership, Venture Capital, or Strategic Consulting.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                    Growth Area
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    While you are highly analytical, practicing active listening and vulnerability can strengthen your leadership influence and team cohesion.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Radar Chart Placeholder */}
            <div className="bg-card p-6 rounded-custom shadow-sm border border-border flex flex-col items-center">
              <h3 className="text-lg font-bold text-foreground mb-6 w-full">Competency Map</h3>
              <div className="relative w-full h-[300px] flex items-center justify-center">
                {/* CSS Radar */}
                {[1, 0.75, 0.5].map((scale) => (
                  <div
                    key={scale}
                    className="absolute w-[200px] h-[200px] border border-border"
                    style={{
                      transform: `scale(${scale})`,
                      clipPath: "polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)",
                    }}
                  />
                ))}
                <div
                  className="absolute w-[160px] h-[160px] bg-primary/30 border-2 border-primary"
                  style={{
                    clipPath: "polygon(50% 10%, 90% 40%, 75% 85%, 25% 80%, 15% 45%)",
                  }}
                />
                <span className="absolute top-0 text-[10px] font-bold uppercase tracking-wider text-foreground">Logic</span>
                <span className="absolute right-0 top-1/3 text-[10px] font-bold uppercase tracking-wider text-foreground">Focus</span>
                <span className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-wider text-foreground">Empathy</span>
                <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-wider text-foreground">Stability</span>
                <span className="absolute left-0 top-1/3 text-[10px] font-bold uppercase tracking-wider text-foreground">Drive</span>
              </div>
              <p className="mt-4 text-sm text-center text-muted-foreground">
                Your balanced distribution shows strong resilience and adaptability across different cognitive domains.
              </p>
            </div>

            {/* Working Style */}
            <div className="bg-card p-6 rounded-custom shadow-sm border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Preferred Working Style</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-custom">
                  <span className="text-sm font-medium text-foreground">Collaborative</span>
                  <span className="text-xs font-bold text-muted-foreground">Moderately High</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-custom">
                  <span className="text-sm font-medium text-foreground">Deep Work / Focus</span>
                  <span className="text-xs font-bold text-primary uppercase">Dominant</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-custom">
                  <span className="text-sm font-medium text-foreground">Fast-Paced Action</span>
                  <span className="text-xs font-bold text-muted-foreground">Medium</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-cta-bg p-6 rounded-custom text-center">
              <h4 className="font-bold mb-2 text-cta-foreground">Want a deeper dive?</h4>
              <p className="text-xs text-cta-foreground/60 mb-4">Unlock the full 20-page psychological profile and detailed career roadmap.</p>
              <button className="w-full py-2 bg-primary hover:bg-accent transition-colors rounded-custom font-bold text-sm text-primary-foreground">
                Upgrade to Premium
              </button>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-card border-t border-border mt-20 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-xs">
            © 2024 PsycheAI Labs. All psychometric assessments are backed by empirical research and modern AI modeling.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Methodology</a>
            <a href="#" className="hover:text-primary">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
