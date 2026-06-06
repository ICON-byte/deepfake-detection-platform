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
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                180deg,
                #b8cbff 0%,
                #c6d6ff 20%,
                #d8e4ff 45%,
                #edf3ff 70%,
                #ffffff 100%
              )
            `,
          }}
        />

        {/* Grey Block Pattern */}
        <div className="absolute inset-0 opacity-60">
          <GreyBlockBackground />
        </div>

        {/* Optional Glow */}
        <div
          className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(102,153,255,0.18) 0%, rgba(102,153,255,0.08) 45%, transparent 75%)",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-[90rem] px-3 pb-16 pt-28 text-center sm:px-4 sm:pb-20 lg:px-6 lg:pb-28 lg:pt-36">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-5 py-2 text-sm font-medium text-[#6699ff] backdrop-blur-sm shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#B23200]" />
              NCS - Neo Cloud Technologies
            </span>
          </div>

          {/* Heading */}
          <h1 className="mx-auto mt-8 max-w-5xl text-4xl font-medium leading-tight tracking-tight text-black sm:text-6xl lg:text-7xl">
            Verify Media Authenticity
            <br />
            <span>with </span>
            <span className="bg-gradient-to-r from-[#B23200] via-[#8A2E73] to-[#2F3BD1] bg-clip-text text-transparent font-bold">
              AI-Powered Detection
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
            TruthLens AI analyzes images, videos, and audio for signs of
            manipulation using advanced AI detection technology. Get clear
            authenticity insights in seconds.
          </p>

          {/* Button */}
          <div className="mt-10 flex justify-center">
            <Link
              to="/detect"
              className="flex items-center gap-2 rounded-2xl bg-[#6699ff] px-10 py-5 text-lg font-semibold text-white shadow-xl shadow-[#6699ff]/30 transition-all duration-300 hover:-translate-y-1 hover:bg-[#5b8df5]"
            >
              Analyse Media
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Detection Across Every Media Format */}
      <section className="mx-auto mt-8 max-w-[90rem] px-3 py-14 sm:mt-12 sm:px-4 sm:py-16 lg:px-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6699ff] text-white shadow-md shadow-[#6699ff]/20">
            <Sparkles className="size-6" />
          </div>
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
            Detection Across Every <span className="text-[#6699ff]">Media Format</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A unified detection engine for images, videos and audio — engineered for speed.
          </p>
        </div>

        {/* Formatted flexible layout to precisely map a centered 3+2 visual flow */}
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap lg:justify-center lg:max-w-6xl lg:mx-auto">
          {features.map((f, i) => (
            <article
              key={f.title}
              className={`flex flex-col justify-between rounded-2xl border border-gray-200 bg-[#fbfbfb] p-5 transition hover:border-[#6699ff]/40 hover:shadow-md sm:p-6 w-full lg:w-[calc(33.333%-1rem)] lg:min-w-[320px] ${
                i >= 3 ? "md:col-span-1" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-[#6699ff]/10 px-3 py-1 text-sm font-medium text-[#6699ff] inline-flex items-center gap-1.5">
                    <f.icon className="h-3.5 w-3.5" />
                    {f.title}
                  </span>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100/50">
                <a href="#" className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-[#6699ff] transition-colors">
                  Learn More
                  <ChevronRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Works / Steps section */}
      <section className="bg-white border-y border-border/40">
        <div className="mx-auto max-w-[90rem] px-3 py-14 sm:px-4 sm:py-20 lg:px-6">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6699ff] text-white shadow-md">
              <Sparkles className="size-6" />
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight sm:text-4xl">
              How it <span className="text-white bg-[#6699ff] px-2 py-0.5 rounded-none">Works</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500 text-sm sm:text-base">
              A simple three-step process designed to help you verify digital content quickly and confidently.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 items-stretch max-w-6xl mx-auto pt-4">
            {steps.map((s, i) => (
              <div key={s.n} className="relative group">
                {/* Visual stacked card effect for the middle container */}
                {i === 1 && (
                  <>
                    <div className="absolute inset-0 bg-[#6699ff]/20 translate-y-4 scale-[0.94] rounded-2xl -z-10" />
                    <div className="absolute inset-0 bg-[#6699ff]/40 translate-y-2 scale-[0.97] rounded-2xl -z-10" />
                  </>
                )}
                
                <div
                  className={`rounded-2xl border p-8 h-full transition-all flex flex-col justify-between ${
                    i === 1
                      ? "border-[#6699ff] bg-[#6699ff] text-white shadow-xl shadow-[#6699ff]/20"
                      : "border-gray-200/80 bg-[#fbfbfb] text-foreground"
                  }`}
                >
                  <div>
                    <div
                      className={`text-5xl font-bold tracking-tight ${
                        i === 1 ? "text-white/30" : "text-gray-200/80"
                      }`}
                    >
                      {s.n}
                    </div>
                    <h3 className="mt-6 text-xl font-bold tracking-tight">{s.title}</h3>
                    <p
                      className={`mt-3 text-sm leading-relaxed ${
                        i === 1 ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asked Questions */}
      <section className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 items-start max-w-6xl mx-auto">
          {/* Left Column Heading */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl leading-tight">
              Frequently
              <br />
              <span className="bg-gradient-to-r from-[#B23200] to-[#2F3BD1] bg-clip-text text-transparent">
                Asked Questions
              </span>
            </h2>
          </div>

          {/* Right Column Accordion Items */}
          <div className="lg:col-span-7 space-y-4">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6699ff] to-[#4e88ff] p-7 text-center text-white shadow-xl shadow-[#6699ff]/25 sm:p-12">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to verify the truth?</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-blue-50/90 sm:text-base">
              Upload your first file and get fast, reliable authenticity analysis from TruthLens AI.
            </p>
            <div className="mt-8">
              <Link
                to="/detect"
                className="inline-block rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-[#6699ff] shadow-md transition-all duration-200 hover:bg-blue-50 sm:px-8 sm:py-4"
              >
                Start Dectection
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
    <div className="rounded-xl border border-gray-100 bg-[#fbfbfb] shadow-sm transition-all duration-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
      >
        <span className="text-base font-semibold text-gray-900">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180 text-[#6699ff]" : ""}`}
        />
      </button>
      {open && (
        <div className="animate-in fade-in slide-in-from-top-1 border-t border-dashed border-gray-200 px-5 pb-6 pt-5 text-sm leading-relaxed text-gray-500 duration-200 sm:px-6 sm:text-base">
          {a}
        </div>
      )}
    </div>
  );
}