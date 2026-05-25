import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { PageShell } from "@/components/PageShell";
import { Mail, Lock, User, ShieldCheck, type LucideIcon } from "lucide-react";
import { api } from "@/api/axiosClient";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
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
      <input {...props} className="register-input" />
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("You must agree to the Terms and Privacy Policy.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      // Direct post network transaction using your axial base layer configuration
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
      });

      if (response.data.success) {
        // Cache the signed JWT access authorization string securely in the browser environment
        localStorage.setItem("token", response.data.token);
        
        // Advance the session securely straight into the monetization funnel
        navigate({ to: "/pricing" });
      }
    } catch (err: any) {
      console.error("🔴 Registration Network Failure:", err);
      const serverMessage = err.response?.data?.message || "Registration failed. Please try again.";
      setError(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell hideFooter>
      <style>{`
        .register-input {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(102, 153, 255, 0.2);
          border-radius: 0.75rem;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          width: 100%;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .register-input:focus {
          outline: none;
          border-color: #6699FF;
        }
        .register-input::placeholder {
          color: #6b7280;
        }
      `}</style>

      <section className="max-w-md mx-auto px-4 pt-16 pb-20">
        <div className="glass-card p-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Create your account
          </h1>
          <p className="text-sm text-gray-400 text-center mt-1">
            Start detecting deepfakes in minutes.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-center">
                {error}
              </div>
            )}
            <Field
              icon={User}
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
              required
            />
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
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
            <label className="flex items-start gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                className="mt-0.5 accent-[#6699FF]"
                checked={agreeTerms}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeTerms(e.target.checked)}
              />
              I agree to the Terms and Privacy Policy.
            </label>
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="gradient-text font-semibold">
              Login
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}