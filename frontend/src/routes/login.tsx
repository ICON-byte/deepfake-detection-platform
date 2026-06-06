import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login · TruthLens" },
      { name: "description", content: "Sign in to your TruthLens account." },
      { property: "og:title", content: "Login · TruthLens" },
      { property: "og:description", content: "Sign in to TruthLens." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error("Please fill in all fields");
      }
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      localStorage.setItem("truthlens_auth", "true");
      localStorage.setItem("truthlens_user", email);
      
      navigate({ to: "/detect" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-0 px-0 pt-30 md:grid-cols-2">
        <div className="flex flex-col justify-center bg-[#f4f6ff] px-6 py-12 pt-100 sm:px-12">
          <div className="mb-20">
            <div className="absolute top-50 left-25">
              <img src="/public\images/logo.png" alt="NeoCloud" className="h-10 w-auto" />
            </div>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Welcome back to
            <br />
            <span className="text-primary">TruthLens.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Sign in to continue verifying media authenticity.
          </p>
        </div>

        <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="mt-1 text-xs text-muted-foreground">Use your TruthLens credentials.</p>

            {error && (
              <div className="mt-4 rounded-md bg-red-100 p-3 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground/80">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-foreground/80">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="rounded border-input" /> Remember me
                </label>
                <a href="#" className="text-primary hover:underline">Forgot Password?</a>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">Register</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}