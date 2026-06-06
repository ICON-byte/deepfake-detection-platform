import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

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
  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-0 px-0 md:grid-cols-2">
        <div className="flex flex-col justify-center bg-[#f4f6ff] px-6 py-12 sm:px-12">
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

            <form className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground/80">Email</label>
                <input type="email" placeholder="Enter your email" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/80">Password</label>
                <input type="password" placeholder="Enter your password" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="rounded border-input" /> Remember me
                </label>
                <a href="#" className="text-primary hover:underline">Forgot Password?</a>
              </div>
              <button type="submit" className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Sign in
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