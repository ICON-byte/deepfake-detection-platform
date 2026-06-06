import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · TruthLens" },
      { name: "description", content: "Advancing trust through intelligent verification — the team and mission behind TruthLens." },
      { property: "og:title", content: "About · TruthLens" },
      { property: "og:description", content: "Advancing trust through intelligent verification." },
    ],
  }),
  component: AboutPage,
});

const team = [
  { n: "01", name: "David Bara", role: "Cybersecurity Analyst" },
  { n: "02", name: "Sarah Neo Cloud", role: "Design Lead" },
  { n: "03", name: "Ayomide O", role: "Design Lead" },
  { n: "04", name: "Khandle E", role: "Design Lead" },
];

function AboutPage() {
  const [tab, setTab] = useState<"mission" | "vision">("mission");

  return (
    <SiteLayout>
      {/* Hero Section (unchanged – kept exactly as you wrote) */}
      <section className="bg-[#eef2ff]/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 pt-40">
          <nav className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>{" "}
            / <span className="text-foreground">About</span>
          </nav>

          <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Advancing Trust Through
              <br />
              Intelligent Verification
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Detect manipulated content, reduce misinformation, and verify
              authenticity before you trust or share.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-6 md:grid-cols-2">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300">
              <img
                src="/images/about-1.png"
                alt="Media verification illustration left"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-4">
              <Link
                to="/detect"
                className="rounded-2xl flex gap-2 bg-primary px-10 py-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 w-52"
              >
                Analyse Media
                <ChevronRight />
              </Link>
              <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-blue-700">
                <img
                  src="/images/about-2.png"
                  alt="Media verification illustration right"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Our Story
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Your Vision, Our Expertise, Your Success.
              <br />
              <span className="text-primary">Leads Dominate.</span>
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              TruthLens AI is a cybersecurity research initiative built for the{" "}
              <a href="#" className="text-primary hover:underline">
                Nigerian Computer Society
              </a>{" "}
              (NCS) by Neo Cloud Technologies. We give journalists, regulators,
              and citizens the tools to verify whether media has been
              synthetically generated or manipulated.
            </p>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700">
            <img
              src="/images/about-3.png"
              alt="Our story illustration"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Commitment (Mission / Vision) */}
      <section className="bg-[#f7f8ff]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mx-auto max-w-3xl text-2xl font-bold sm:text-3xl">
              Commitment to Transparency, Trust, and{" "}
              <span className="text-primary">Digital Authenticity</span> in an
              Increasingly <span className="text-primary">AI-Generated World</span>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              Helping individuals and organisations verify digital content with
              confidence and build trust in the digital world.
            </p>
          </div>

          <div className="mx-auto mt-8 flex max-w-xs rounded-full bg-white p-1 shadow-sm">
            <button
              onClick={() => setTab("mission")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "mission"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70"
              }`}
            >
              Our Mission
            </button>
            <button
              onClick={() => setTab("vision")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "vision"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70"
              }`}
            >
              Our Vision
            </button>
          </div>

          <div className="mt-10 grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold">
                What we <span className="italic text-primary">Stand</span> For
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {tab === "mission"
                  ? "To empower individuals and organisations with accessible, reliable, and transparent tools for verifying digital content; helping them identify manipulated media and make informed decisions with confidence."
                  : "A future where every piece of digital media can be trusted — where AI augments human judgement rather than undermining it, and where verification is universal."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square w-full overflow-hidden rounded-2xl">
                <img
                  src="/images/about-4.png"
                  alt="Commitment illustration left"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="aspect-square w-full overflow-hidden rounded-2xl">
                <img
                  src="/images/about-5.png"
                  alt="Commitment illustration right"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Our Team
          </p>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            A growing team of AI researchers, cybersecurity experts, and
            technology
            <br className="hidden sm:block" />
            professionals working to build trust in the age of digital media.
          </p>
        </div>

        <ul className="mt-10 divide-y divide-border/70 rounded-2xl border border-border/70 bg-card">
          {team.map((p) => (
            <li
              key={p.n}
              className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-primary/5"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">( {p.n} )</span>
                <span className="text-base font-semibold">{p.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">( {p.role} )</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[#7a92ff] p-10 text-center text-primary-foreground shadow-xl shadow-primary/25">
          <h3 className="text-2xl font-bold sm:text-3xl">
            Ready to verify the truth?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/80">
            Upload your first file and get fast, reliable authenticity analysis
            from TruthLens AI.
          </p>
          <div className="mt-6">
            <Link
              to="/detect"
              className="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90"
            >
              Start Detection
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}