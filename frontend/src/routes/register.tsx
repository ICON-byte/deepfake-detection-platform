import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account · TruthLens" },
      { name: "description", content: "Get started with TruthLens — verify media authenticity in seconds." },
      { property: "og:title", content: "Register · TruthLens" },
      { property: "og:description", content: "Create your TruthLens account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-0 px-0 md:grid-cols-2">
        {/* Left */}
        <div className="flex flex-col justify-center bg-[#f4f6ff] px-6 py-12 sm:px-12">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Get Started with
            <br />
            <span className="text-primary">TruthLens.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Detect manipulated content, reduce misinformation, and verify authenticity before you trust or share.
          </p>
        </div>

        {/* Right - form */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Start verifying deepfakes in minutes.
            </p>

            <form className="mt-6 space-y-4">
              <Field label="Email" type="email" placeholder="Enter your email" />
              <Field label="Password" type="password" placeholder="Enter your password" />
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="rounded border-input" /> Remember me
                </label>
                <a href="#" className="text-primary hover:underline">Forgot Password?</a>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Create Account
              </button>
            </form>

            <div className="my-4 text-center text-xs text-muted-foreground">Or</div>

            <div className="space-y-2">
              <SocialBtn>Continue with Google</SocialBtn>
              <SocialBtn>Continue with Apple</SocialBtn>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground/80">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function SocialBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full rounded-md border border-input bg-background py-2 text-xs font-medium hover:bg-secondary">
      {children}
    </button>
  );
}
