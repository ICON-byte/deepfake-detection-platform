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
  ChevronRight,
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
    desc: "Advanced texture analysis, error level analysis (ELA), and metadata checking to identify manipulated images.",
  },
  {
    icon: AudioLines,
    title: "Audio Detection",
    desc: "Voice cloning identification, synthetic speech detection, and anomaly screening for high-fidelity audio assets.",
  },
  {
    icon: Sparkles,
    title: "AI - Powered Analysis",
    desc: "Deep learning models trained on cutting-edge synthetic media datasets to deliver highly granular detection scores.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Scanning",
    desc: "Enterprise-grade security protocols ensuring your private media files remain completely confidential throughout scanning.",
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
    q: "1. What files types are supported",
    a: "TruthLens AI supports a variety of image, video, and audio formats, including JPG, JPEG, PNG, and other commonly used file types for media analysis.",
  },
  {
    q: "2. How accurate is TruthLens AI",
    a: "TruthLens AI achieves industry-leading accuracy backed by ongoing research and continuously updated training datasets. Detection confidence varies based on media quality and manipulation complexity.",
  },
  {
    q: "3. Is my Uploaded Media Stored?",
    a: "Your uploaded media is processed securely and removed after analysis unless you explicitly choose to keep it in your dashboard.",
  },
  {
    q: "4. Can i use it for Journalism or Law Enforcement?",
    a: "Yes — TruthLens is designed to support journalists, investigators, and law-enforcement workflows with detailed authenticity reports and forensic insights.",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <GreyBlockBackground />
        <div className="relative mx-auto mt-30 max-w-[90rem] px-3 pt-[88px] pb-16 text-center sm:px-4 lg:px-6 lg:pt-[120px] lg:pb-24">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-[#6699ff]/10 px-2.5 py-0.5 text-[#6699ff]">
              NCS-Neo Cloud Technologies
            </span>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Verify Media Authenticity
            <br />
            with <span className="bg-gradient-to-r from-[#B23200] to-[#6699ff] bg-clip-text text-transparent">AI-Powered Detection</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            TruthLens AI analyzes images, videos, and audio for signs of manipulation using advanced AI detection technology. Get clear authenticity insights in seconds.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/detect"
              className="rounded-2xl flex items-center gap-2 bg-[#6699ff] px-10 py-5 text-sm font-semibold text-white shadow-lg shadow-[#6699ff]/25 transition hover:bg-[#6699ff]/90"
            >
              Analyse Media
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Detection Across Every Media Format */}
      <section className="mx-auto max-w-[90rem] px-3 py-16 mt-12 sm:px-4 lg:px-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6699ff] text-white shadow-md shadow-[#6699ff]/20">
            <Sparkles className="size-6" />
          </div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            Detection Across Every <span className="bg-gradient-to-r from-[#B23200] to-[#6699ff] bg-clip-text text-transparent">Media Format</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A unified detection engine for images, videos and audio — engineered for speed.
          </p>
        </div>

        {/* Exact grid matching the alignment flow seen in the video */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <article
              key={f.title}
              className={`rounded-2xl border border-border/70 bg-card p-6 flex flex-col justify-between transition hover:border-[#6699ff]/40 hover:shadow-md ${
                i >= 3 ? "lg:col-span-1 md:col-span-1" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <div className="p-1.5 rounded-lg bg-[#6699ff]/10 text-[#6699ff]">
                    <f.icon className="h-4 w-4" />
                  </div>
                  {f.title}
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
              <div className="mt-6">
                <a href="#" className="inline-flex items-center gap-1 text-xs font-semibold text-[#6699ff] hover:underline">
                  Learn More
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Works / Steps section */}
      <section className="bg-gradient-to-b from-[#6699ff]/5 to-transparent border-y border-border/40">
        <div className="mx-auto max-w-[90rem] px-3 py-20 sm:px-4 lg:px-6">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6699ff] text-white shadow-md shadow-[#6699ff]/20">
              <Sparkles className="size-6" />
            </div>
            <h2 className="text-2xl font-bold sm:text-3xl text-foreground">
              How it <span className="text-[#6699ff]">Works</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              A simple three-step process designed to help you verify digital content quickly and confidently.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`rounded-2xl border p-8 transition ${
                  i === 1
                    ? "border-[#6699ff]/30 bg-[#6699ff]/5 shadow-md"
                    : "border-border/70 bg-card"
                }`}
              >
                <div className="text-4xl font-extrabold text-[#6699ff]/20">{s.n}</div>
                <div className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#6699ff]/10 text-[#6699ff]">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asked Questions */}
      <section className="mx-auto max-w-[90rem] px-3 py-20 sm:px-4 lg:px-6">
        <h2 className="text-3xl font-bold text-foreground">
          Frequently <span className="text-[#6699ff]">Asked Questions</span>
        </h2>
        <div className="mt-8 space-y-4">
          {faqs.map((f, i) => (
            <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#6699ff] to-[#4e88ff] p-12 text-center text-white shadow-xl shadow-[#6699ff]/25 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold sm:text-3xl tracking-tight">Ready to verify the truth?</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-blue-50/90">
              Upload your first file and get fast, reliable authenticity analysis from TruthLens AI.
            </p>
            <div className="mt-8">
              <Link
                to="/detect"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-[#6699ff] shadow-md hover:bg-blue-50 transition-all duration-200"
              >
                Start Dectection
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function GreyBlockBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[8%] top-0 h-28 w-28 bg-slate-100/70" />
      <div className="absolute left-[17%] top-28 h-28 w-36 bg-slate-100/60" />
      <div className="absolute left-[34%] top-0 h-28 w-44 bg-slate-100/45" />
      <div className="absolute right-[14%] top-0 h-28 w-44 bg-slate-100/70" />
      <div className="absolute right-[6%] top-28 h-28 w-28 bg-slate-100/55" />
      <div className="absolute left-0 top-80 h-28 w-28 bg-slate-100/55" />
      <div className="absolute left-[17%] top-[27rem] h-28 w-36 bg-slate-100/55" />
      <div className="absolute right-[26%] top-80 h-56 w-28 bg-slate-100/60" />
      <div className="absolute right-[8%] top-[27rem] h-28 w-28 bg-slate-100/60" />
    </div>
  );
}

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/70 bg-card transition-all duration-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-sm font-semibold text-foreground">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-muted-foreground border-t border-dashed border-border/50 pt-4 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
          {a}
        </div>
      )}
    </div>
  );
}
