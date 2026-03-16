import { Link, useLocation } from "react-router-dom";
import { Menu, X, Network } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import dawg from "../media/dawg.svg"

interface NavbarProps {
  // Graph panel props — only passed in Round2/Round3
  showGraphToggle?: boolean;
  graphOpen?: boolean;
  onGraphToggle?: () => void;
  graphJobCount?: number;
  // Round progress bar — optional
  roundLabel?: string;
  roundProgress?: number; // 0–100
}

const Navbar = ({
  showGraphToggle = false,
  graphOpen = false,
  onGraphToggle,
  graphJobCount = 0,
  roundLabel,
  roundProgress,
}: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src={dawg}
              alt="What Do I Do Dawg logo"
              className="w-9 h-9 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-foreground leading-none">
              What Do I Do
              <span className="text-primary"> Dawg</span>
            </span>
          </Link>

          {/* ── Desktop right side ── */}
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            {isLanding ? (
              <>
                <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How it Works</a>
                <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
                <a href="#enterprise" className="text-muted-foreground hover:text-primary transition-colors">For Enterprise</a>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/test/round-1" className="text-muted-foreground hover:text-primary transition-colors">Tests</Link>
              </>
            )}

            <ThemeToggle />

            {/* Graph toggle — only on Round 2 & 3 */}
            {showGraphToggle && (
              <button
                onClick={onGraphToggle}
                title="Toggle job knowledge graph"
                className={`relative p-2 rounded-custom border transition-all duration-200 ${
                  graphOpen
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                <Network className="h-5 w-5" />
                {graphJobCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {graphJobCount}
                  </span>
                )}
              </button>
            )}

            {/* Round label + progress */}
            {roundLabel && (
              <div className="text-right">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                  {roundLabel}
                </span>
                {roundProgress !== undefined && (
                  <div className="w-28 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${roundProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {!roundLabel && (
              <Link
                to="/auth"
                className="bg-primary text-primary-foreground px-5 py-2 rounded-custom font-semibold hover:bg-accent transition-all shadow-md"
              >
                Start Test
              </Link>
            )}
          </div>

          {/* ── Mobile ── */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            {showGraphToggle && (
              <button
                onClick={onGraphToggle}
                className={`relative p-2 rounded-custom border transition-all duration-200 ${
                  graphOpen
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                <Network className="h-5 w-5" />
                {graphJobCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {graphJobCount}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-border pt-3">
            {isLanding ? (
              <>
                <a href="#how-it-works" className="block text-muted-foreground hover:text-primary transition-colors py-2">How it Works</a>
                <a href="#pricing" className="block text-muted-foreground hover:text-primary transition-colors py-2">Pricing</a>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="block text-muted-foreground hover:text-primary py-2">Dashboard</Link>
                <Link to="/test/round-1" className="block text-muted-foreground hover:text-primary py-2">Tests</Link>
              </>
            )}
            {!roundLabel && (
              <Link
                to="/auth"
                className="block bg-primary text-primary-foreground px-6 py-2.5 rounded-custom font-semibold text-center"
              >
                Start Test
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;