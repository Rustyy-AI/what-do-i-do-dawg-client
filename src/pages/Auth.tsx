import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Brain } from "lucide-react";
import Navbar from "@/components/Navbar";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();
        await fetch(`${import.meta.env.VITE_FASTAPI_URI}/users/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ email }),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      const token = await auth.currentUser!.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_FASTAPI_URI}/sessions/create`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
      const { session_id } = await res.json();
      localStorage.setItem("session_id", session_id);
      navigate("/test/round-1");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Navbar />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[480px] flex flex-col gap-8">
          <div className="text-center flex flex-col gap-2">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-base">
              Continue your journey to mental well-being
            </p>
          </div>

          <div className="bg-card p-6 sm:p-8 rounded-xl shadow-sm border border-border">
            {/* Toggle */}
            <div className="flex h-12 w-full items-center justify-center rounded-xl bg-muted p-1 mb-8">
              <label
                className={`flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all ${
                  mode === "login"
                    ? "bg-card shadow-sm text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMode("login")}
              >
                Login
              </label>
              <label
                className={`flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 text-sm font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-card shadow-sm text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setMode("signup")}
              >
                Sign Up
              </label>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground/80 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    className="w-full rounded-xl border border-border bg-muted py-3.5 pl-12 pr-4 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-foreground/80">
                    Password
                  </label>
                  {mode === "login" && (
                    <a href="#" className="text-xs font-semibold text-primary hover:underline">
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    className="w-full rounded-xl border border-border bg-muted py-3.5 pl-12 pr-4 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg transition-all mt-2 text-center active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait..." : "Continue"}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-card border border-border py-3.5 rounded-xl hover:bg-muted transition-all text-foreground font-semibold shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </form>
          </div>

          <div className="text-center px-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to PsychoAI's{" "}
              <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>

      <div className="w-full h-1.5 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
    </div>
  );
};

export default Auth;