/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Brain, Briefcase, Star, TrendingUp, ChevronRight,
  Download, RefreshCw, Sparkles, Target, Zap, Users, BookOpen,
  AlertCircle
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseCookieJSON<T>(name: string): T | null {
  const match = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  if (!match) return null;
  try { return JSON.parse(decodeURIComponent(match.split("=")[1])) as T; } catch { return null; }
}

function getLS<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : null; } catch { return null; }
}

const ASSESSMENT_LS_KEYS = [
  "holland_questions",
  "holland_answers",
  "holland_codes",
  "holland_jobs",
  "refinement_questions",
  "refinement_jobs",
  "final_questions",
  "final_careers",
  "session_id",
];

// ── Holland code metadata ─────────────────────────────────────────────────────
const HOLLAND_META: Record<string, { label: string; desc: string; color: string; icon: React.ReactNode }> = {
  R: { label: "Realistic",      desc: "Hands-on, practical, and technically minded",        color: "#e07b39", icon: <Zap className="w-4 h-4" /> },
  I: { label: "Investigative",  desc: "Analytical, intellectual, and research-driven",       color: "#4f9cf9", icon: <Brain className="w-4 h-4" /> },
  A: { label: "Artistic",       desc: "Creative, expressive, and imaginative",               color: "#b07ef8", icon: <Sparkles className="w-4 h-4" /> },
  S: { label: "Social",         desc: "Empathetic, collaborative, and people-oriented",      color: "#4caf82", icon: <Users className="w-4 h-4" /> },
  E: { label: "Enterprising",   desc: "Ambitious, persuasive, and leadership-focused",       color: "#ec9213", icon: <TrendingUp className="w-4 h-4" /> },
  C: { label: "Conventional",   desc: "Detail-oriented, organised, and systematic",          color: "#f06292", icon: <BookOpen className="w-4 h-4" /> },
};

const TRAIT_INSIGHTS: Record<string, { strengths: string[]; growth: string; careers: string[] }> = {
  R: { strengths: ["Technical precision", "Problem-solving", "Mechanical aptitude"],    growth: "Develop communication skills for cross-functional work.", careers: ["Engineer", "Technician", "Architect", "Pilot"] },
  I: { strengths: ["Critical thinking", "Research depth", "Logical reasoning"],         growth: "Balance analysis with decisive action in ambiguous situations.", careers: ["Data Scientist", "Researcher", "Analyst", "Doctor"] },
  A: { strengths: ["Creative vision", "Originality", "Aesthetic sensibility"],           growth: "Structure creative output with repeatable processes.", careers: ["Designer", "Writer", "Art Director", "Musician"] },
  S: { strengths: ["Active listening", "Team building", "Conflict resolution"],         growth: "Set firm boundaries to avoid burnout from over-giving.", careers: ["Counselor", "Teacher", "HR Manager", "Social Worker"] },
  E: { strengths: ["Strategic thinking", "Influence", "Risk tolerance"],                growth: "Cultivate patience with detail-oriented team members.", careers: ["Product Manager", "Entrepreneur", "Sales Director", "Consultant"] },
  C: { strengths: ["Attention to detail", "Reliability", "Process design"],              growth: "Build comfort with ambiguity and iterative approaches.", careers: ["Accountant", "Project Manager", "Compliance Officer", "Actuary"] },
};

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, backgroundColor: color, transitionDelay: `${delay}ms` }}
      />
    </div>
  );
}

// ── Radar polygon ─────────────────────────────────────────────────────────────
function RadarChart({ codes, scores }: { codes: string[]; scores: number[] }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 80;
  const n = codes.length || 1;

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const ptFor = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angleFor(i)),
    y: cy + radius * Math.sin(angleFor(i)),
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const shapePoints = scores.map((s, i) => ptFor(i, (s / 100) * r));
  const shapePath = shapePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px] mx-auto">
      {/* Grid */}
      {gridLevels.map((lvl) => {
        const pts = codes.map((_, i) => ptFor(i, r * lvl));
        return (
          <polygon
            key={lvl}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="var(--color-border, #333)"
            strokeOpacity="0.3"
            strokeWidth="0.5"
          />
        );
      })}
      {/* Spokes */}
      {codes.map((_, i) => {
        const outer = ptFor(i, r);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="var(--color-border, #333)" strokeOpacity="0.2" strokeWidth="0.5" />;
      })}
      {/* Shape */}
      <path d={shapePath} fill="rgba(236,146,19,0.25)" stroke="#ec9213" strokeWidth="2" />
      {/* Dots */}
      {shapePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#ec9213" />
      ))}
      {/* Labels */}
      {codes.map((code, i) => {
        const pt = ptFor(i, r + 18);
        const meta = HOLLAND_META[code];
        return (
          <text key={i} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="700" fill={meta?.color ?? "#ec9213"} letterSpacing="0.05em">
            {meta?.label?.toUpperCase() ?? code}
          </text>
        );
      })}
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  const hollandCodes: string[] = getLS("holland_codes") ?? [];
  const hollandJobs: string[]  = getLS("holland_jobs") ?? [];
  const refinementJobs: any[]  = getLS("refinement_jobs") ?? [];
  const finalQs: string[]      = getLS("final_questions") ?? [];

  // Derive display jobs — prefer refined list
  const topJobs: string[] = (refinementJobs.length > 0 ? refinementJobs : hollandJobs)
    .slice(0, 6)
    .map((j: any) => typeof j === "string" ? j : j.job_name ?? j.name ?? String(j));

  // Fake score distribution based on holland codes order (first = dominant)
  const radarScores = hollandCodes.map((_, i) => Math.max(35, 95 - i * 14));

  // Trait scores for bar chart — map each code to a percentage
  const traitScores: Record<string, number> = {};
  hollandCodes.forEach((code, i) => { traitScores[code] = Math.max(30, 95 - i * 12); });

  const primaryCode   = hollandCodes[0] ?? "E";
  const primaryMeta   = HOLLAND_META[primaryCode];
  const primaryInsight = TRAIT_INSIGHTS[primaryCode];

  const hasData = hollandCodes.length > 0 || topJobs.length > 0;

  const handleRetake = () => {
    ASSESSMENT_LS_KEYS.forEach((key) => localStorage.removeItem(key));
    navigate("/test/round-1");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow">

        {/* ── Hero banner ── */}
        <section className="relative overflow-hidden border-b border-border">
          {/* Subtle background grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, var(--color-primary,#ec9213) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
            {/* Avatar ring */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Brain className="w-12 h-12 text-primary" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Star className="w-4 h-4 text-white" />
              </span>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" /> Assessment Complete
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-3 leading-tight">
                Your Psychometric Profile
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                {primaryInsight
                  ? `You lead with ${primaryMeta?.label} tendencies — ${primaryMeta?.desc?.toLowerCase()}. Here's what the data says about your ideal career path.`
                  : "Complete the assessment rounds to unlock your personalised career insights."}
              </p>
              {hollandCodes.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
                  {hollandCodes.map((code) => {
                    const m = HOLLAND_META[code];
                    return (
                      <span key={code} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                        style={{ borderColor: m?.color, color: m?.color, backgroundColor: `${m?.color}15` }}>
                        {m?.label ?? code}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-border rounded-custom text-sm font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all">
                <RefreshCw className="w-4 h-4" /> Retake
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-custom text-sm font-bold hover:bg-accent transition-all shadow-md">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
        </section>

        {!hasData ? (
          <div className="max-w-5xl mx-auto px-6 py-24 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" /> 
            <h2 className="text-xl font-bold text-foreground mb-2">No results yet</h2>
            <p className="text-muted-foreground mb-6">Complete all three assessment rounds to see your results here.</p>
            <Link to="/test/round-1" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-custom font-bold hover:bg-accent transition-all">
              Start Assessment <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

            {/* ── Row 1: Trait bars + Radar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Trait bars */}
              <div className="lg:col-span-2 bg-card rounded-custom border border-border p-8 shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-8 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Holland Code Breakdown
                </h2>
                <div className="space-y-7">
                  {hollandCodes.map((code, i) => {
                    const meta    = HOLLAND_META[code];
                    const score   = traitScores[code] ?? 50;
                    return (
                      <div key={code}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span style={{ color: meta?.color }}>{meta?.icon}</span>
                            <span className="text-sm font-semibold text-foreground">{meta?.label ?? code}</span>
                            <span className="text-xs text-muted-foreground hidden sm:block">— {meta?.desc}</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: meta?.color }}>{score}%</span>
                        </div>
                        <AnimatedBar value={score} color={meta?.color ?? "#ec9213"} delay={i * 120} />
                      </div>
                    );
                  })}
                  {hollandCodes.length === 0 && (
                    <p className="text-muted-foreground text-sm">Complete Round 1 to see your Holland codes.</p>
                  )}
                </div>
              </div>

              {/* Radar */}
              <div className="bg-card rounded-custom border border-border p-8 shadow-sm flex flex-col items-center">
                <h2 className="text-lg font-bold text-foreground mb-6 w-full flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Competency Map
                </h2>
                {hollandCodes.length >= 3 ? (
                  <>
                    <RadarChart codes={hollandCodes} scores={radarScores} />
                    <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                      Your profile shape reflects the relative strength of each trait cluster.
                    </p>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm text-center">
                    Need at least 3 Holland codes to render the map.
                  </div>
                )}
              </div>
            </div>

            {/* ── Row 2: Top career matches ── */}
            {topJobs.length > 0 && (
              <div className="bg-card rounded-custom border border-border p-8 shadow-sm">
                <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Your Top Career Matches
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Refined across {finalQs.length} deep-profile questions from {hollandJobs.length} initial matches.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topJobs.map((job, i) => (
                    <div key={job}
                      className="group relative p-5 rounded-custom border-2 border-border hover:border-primary transition-all duration-200 cursor-default overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-start justify-between mb-3">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        {i === 0 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Top Match
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-foreground text-base leading-snug">{job}</h3>
                      <div className="mt-3 flex items-center gap-1 text-muted-foreground text-xs">
                        {hollandCodes.slice(0, 2).map((code) => (
                          <span key={code} className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: `${HOLLAND_META[code]?.color}20`, color: HOLLAND_META[code]?.color }}>
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Row 3: Insights + Working style ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Strengths & growth */}
              {primaryInsight && (
                <div className="bg-card rounded-custom border border-border p-8 shadow-sm space-y-6">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Insights & Recommendations
                  </h2>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Core Strengths</h3>
                    <ul className="space-y-2">
                      {primaryInsight.strengths.map((s) => (
                        <li key={s} className="flex items-center gap-3 text-sm text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-custom">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Growth Opportunity</h3>
                    <p className="text-sm text-foreground leading-relaxed">{primaryInsight.growth}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Suggested Career Paths</h3>
                    <div className="flex flex-wrap gap-2">
                      {primaryInsight.careers.map((c) => (
                        <span key={c} className="px-3 py-1.5 bg-muted rounded-custom text-xs font-semibold text-foreground border border-border">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Working style + stats */}
              <div className="space-y-6">
                <div className="bg-card rounded-custom border border-border p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Assessment Summary
                  </h2>
                  <div className="space-y-3">
                    {[
                      { label: "Holland Codes Identified", value: hollandCodes.length > 0 ? hollandCodes.join(", ") : "—", highlight: hollandCodes.length > 0 },
                      { label: "Initial Job Matches",      value: hollandJobs.length > 0 ? `${hollandJobs.length} careers` : "—", highlight: false },
                      { label: "Refined Matches",          value: refinementJobs.length > 0 ? `${refinementJobs.length} careers` : "—", highlight: false },
                      { label: "Deep Profile Questions",   value: finalQs.length > 0 ? `${finalQs.length} answered` : "—", highlight: false },
                    ].map(({ label, value, highlight }) => (
                      <div key={label}
                        className={`flex items-center justify-between p-3 rounded-custom ${highlight ? "bg-primary/5 border border-primary/20" : "bg-muted"}`}>
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className={`text-xs font-bold uppercase tracking-wide ${highlight ? "text-primary" : "text-muted-foreground"}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-foreground rounded-custom p-6 text-background text-center">
                  <h3 className="font-bold text-lg mb-1">Want a deeper dive?</h3>
                  <p className="text-sm opacity-60 mb-5">Unlock the full psychological profile report with personalised career roadmap and skill gap analysis.</p>
                  <button className="w-full py-3 bg-primary hover:bg-accent text-white font-bold rounded-custom text-sm transition-all shadow-md">
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card py-8 text-center text-muted-foreground text-xs mt-8">
        <p>© 2024 PsycheAdapt Adaptive Systems. All assessments are backed by empirical research.</p>
        <div className="mt-3 flex justify-center gap-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Methodology</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;