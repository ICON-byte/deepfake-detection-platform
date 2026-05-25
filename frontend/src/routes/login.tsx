import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type ChangeEvent, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Mail, Lock, ShieldCheck, type LucideIcon } from "lucide-react";
import { api } from "@/api/axiosClient";

type LoginSearch = {
  redirect?: string;
  message?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: search.redirect as string | undefined,
    message: search.message as string | undefined,
  }),
  component: LoginPage,
});

type FieldProps = {
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

function Field({ icon: Icon, ...props }: FieldProps) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input {...props} className="login-input" />
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { redirect, message } = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(message || "");

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage(""); // clear any success message when user submits
    setIsLoading(true);
    
    try {
      // Connect directly to your Node.js server ports
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        // Cache your signed JWT credentials string securely inside the browser storage layer
        localStorage.setItem("token", response.data.token);
        
        // Push the user through to their protected target interface destination
        navigate({ to: redirect || "/dashboard" });
      }
    } catch (err: any) {
      console.error("🔴 Login Network Failure:", err);
      const serverMessage = err.response?.data?.message || "Invalid email or password. Please try again.";
      setError(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell hideFooter>
      <style>{`
        .login-input {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(102, 153, 255, 0.2);
          border-radius: 0.75rem;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          width: 100%;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .login-input:focus {
          outline: none;
          border-color: #6699FF;
        }
        .login-input::placeholder {
          color: #6b7280;
        }
      `}</style>
      <section className="max-w-md mx-auto px-4 pt-16 pb-20">
        <div className="glass-card p-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1
            className="text-2xl font-bold text-center text-white"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Welcome back
          </h1>
          <p className="text-sm text-gray-400 text-center mt-1">Sign in to your TruthLens account.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
                {error}
              </div>
            )}
            <Field
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            <Field
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-between text-xs text-gray-400">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[#6699FF]"
                  aria-label="Remember me"
                />{" "}
                Remember me
              </label>
              <a href="#" className="hover:text-[#6699FF] transition-colors">
                Forgot password?
              </a>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="gradient-text font-semibold">
              Register
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}