import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isLanding = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 bg-nav-bg/80 backdrop-blur-md border-b border-nav-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-custom flex items-center justify-center text-primary-foreground font-bold text-xl">
              P
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Psycho<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
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
            <Link
              to="/auth"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-custom font-semibold hover:bg-accent transition-all shadow-md"
            >
              Start Test
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-foreground">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
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
            <Link
              to="/auth"
              className="block bg-primary text-primary-foreground px-6 py-2.5 rounded-custom font-semibold text-center"
            >
              Start Test
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
