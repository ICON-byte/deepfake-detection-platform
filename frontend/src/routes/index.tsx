import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import {
  ChevronDown,
  ScanFace,
  Image as ImageIcon,
  AudioLines,
  Sparkles,
  ShieldCheck,
  UploadCloud,
  Cpu,
  CheckCircle2,
  ArrowRight,
  ArrowRightIcon,
  ChevronRight,
  MousePointerClick,
  MousePointerClickIcon,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TruthLens — AI-Powered Deepfake Detection" },
      {
        name: "description",
        content:
          "TruthLens AI analyzes images, videos, and audio for signs of manipulation using advanced AI detection technology.",
      },
      { property: "og:title", content: "TruthLens — AI-Powered Deepfake Detection" },
      {
        property: "og:description",
        content: "Verify media authenticity in seconds with TruthLens.",
      },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: ScanFace,
    title: "Video Analysis",
    desc: "Frame-by-frame detection of facial swaps, GAN artifacts, and temporal inconsistencies across all major video formats.",
  },
  {
    icon: ImageIcon,
    title: "Image Deepfake Detection",
    desc: "Frame-by-frame detection of facial swaps, GAN artifacts, and temporal inconsistencies across all major videos.",
  },
  {
    icon: AudioLines,
    title: "Audio Detection",
    desc: "Frame-by-frame detection of facial swaps, GAN artifacts, and temporal inconsistencies across all video formats.",
  },
  {
    icon: Sparkles,
    title: "AI - Powered Analysis",
    desc: "Frame-by-frame detection of facial swaps, GAN artifacts, and temporal inconsistencies across all major video formats.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Scanning",
    desc: "Frame-by-frame detection of facial swaps, GAN artifacts, and temporal inconsistencies across all major videos.",
  },
];

const steps = [
  {
    n: "01",
    icon: UploadCloud,
    title: "Upload your Media",
    desc: "Simply upload your media file and let our platform securely analyze it for signs of manipulation.",
  },
  {
    n: "02",
    icon: Cpu,
    title: "AI Scans Content",
    desc: "Our AI scans the content for patterns commonly associated with deepfakes and digital manipulation.",
  },
  {
    n: "03",
    icon: CheckCircle2,
    title: "Receive your Results",
    desc: "Receive fast, easy-to-understand results with authenticity scores and risk indicators.",
  },
];

const faqs = [
  {
    q: "What files types are supported",
    a: "TruthLens AI supports a variety of image, video, and audio formats, including JPG, JPEG, PNG, and other commonly used file types for media analysis.",
  },
  {
    q: "How accurate is TruthLens AI",
    a: "TruthLens AI achieves industry-leading accuracy backed by ongoing research and continuously updated training datasets. Detection confidence varies based on media quality and manipulation complexity.",
  },
  {
    q: "Is my Uploaded Media Stored?",
    a: "Your uploaded media is processed securely and removed after analysis unless you explicitly choose to keep it in your dashboard.",
  },
  {
    q: "Can i use it for Journalism or Law Enforcement?",
    a: "Yes — TruthLens is designed to support journalists, investigators, and law-enforcement workflows with detailed authenticity reports and forensic insights.",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero Section — exactly matching Frame 2147227436.png, adjusted for floating navbar */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eef2ff] via-[#f4f6ff] to-background">
        {/* Light blue grid pattern (clear, airy) */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(135, 206, 250, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(135, 206, 250, 0.2) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* 
          Top padding accounts for:
          - floating navbar height (~64px)
          - top-6 gap (24px)
          - additional breathing space to match original composition
        */}
        <div className="relative mx-auto mt-30 max-w-5xl px-4 pt-[88px] pb-16 text-center sm:px-6 lg:pt-[120px] lg:pb-24">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
              NCS-Neo Cloud Technologies
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Verify Media Authenticity
            <br />
            with <span className="bg-gradient-to-r from-[#B23200] to-[#251FBA] bg-clip-text text-transparent">AI-Powered Detection</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            TruthLens AI analyzes images, videos, and audio for signs of manipulation using advanced AI detection technology. Get clear authenticity insights in seconds.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/detect"
              className="rounded-2xl flex gap-2 bg-primary px-10 py-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
            >
              Analyse Media
              <ChevronRight/>
            </Link>
          </div>
        </div>
      </section>

      {/* Detection Across Every Media Format */}
      <section className="mx-auto max-w-7xl px-4 py-16 mt-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-[#6699FF] to-[#09255D] text-primary-foreground">
            <MousePointerClickIcon className="size-7"/>
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            Detection Across Every <span className="bg-gradient-to-r from-[#B23200] to-[#251FBA] bg-clip-text text-transparent">Media Format</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A unified detection engine for images, videos and audio — engineered for speed.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-border/70 bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <f.icon className="h-4 w-4 text-primary" />
                {f.title}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{f.desc}</p>
              <a href="#" className="mt-4 inline-block text-xs font-semibold text-primary hover:underline">
                Learn More →
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Works / Steps section */}
      <section className="bg-[#f7f8ff]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-[#6699FF] to-[#09255D] text-primary-foreground">
              <MousePointerClickIcon className="size-7"/>
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              <span className="text-primary">Works</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A simple three-step process designed to help you verify digital content quickly and confidently.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`rounded-2xl border p-6 transition ${
                  i === 1
                    ? "border-primary/30 bg-primary/5 shadow-md"
                    : "border-border/70 bg-card"
                }`}
              >
                <div className="text-4xl font-extrabold text-primary/30">{s.n}</div>
                <div className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asked Questions */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold">
          Asked <span className="text-primary">Questions</span>
        </h2>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[#7a92ff] p-10 text-center text-primary-foreground shadow-xl shadow-primary/25">
          <h3 className="text-2xl font-bold sm:text-3xl">Ready to verify the truth?</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/80">
            Upload your first file and get fast, reliable authenticity analysis from TruthLens AI.
          </p>
          <div className="mt-6">
            <Link
              to="/detect"
              className="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm hover:bg-white/90 transition"
            >
              Start Dectection
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/70 bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-muted-foreground">{a}</p>}
    </div>
  );
}