import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { UploadCloud, ShieldCheck, FileText, RotateCcw } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/detect")({
  head: () => ({
    meta: [
      { title: "Detect · TruthLens" },
      { name: "description", content: "Run TruthLens deepfake, AI-generated content, and phishing analysis." },
      { property: "og:title", content: "TruthLens Detect" },
      { property: "og:description", content: "Verify media files, text and suspicious URLs in seconds." },
    ],
  }),
  component: DetectPage,
});

type Tab = "deepfake" | "ai" | "phishing";

function DetectPage() {
  const [tab, setTab] = useState<Tab>("deepfake");

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-background">
        <GreyBlockBackground />
        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#6699ff]/30 bg-[#6699ff]/5 px-4 py-1.5 text-sm font-medium text-[#6699ff]">
              <ShieldCheck className="h-4 w-4" /> Multiple detection workflows for media and suspicious links.
            </span>
            <h1 className="mt-5 text-4xl font-bold sm:text-5xl">TruthLens Detect</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Select a workflow below, then continue to the dedicated analysis flow for media files, text insights or suspicious URLs.
            </p>
          </div>

          <div className="mx-auto mt-10 flex max-w-2xl gap-2 rounded-full border border-border/70 bg-card p-1.5">
            <TabBtn active={tab === "deepfake"} onClick={() => setTab("deepfake")}>Deepfake Detect</TabBtn>
            <TabBtn active={tab === "ai"} onClick={() => setTab("ai")}>AI Generated Content</TabBtn>
            <TabBtn active={tab === "phishing"} onClick={() => setTab("phishing")}>Phishing</TabBtn>
          </div>

          <div className="mt-8">
            {tab === "deepfake" && <DeepfakePanel />}
            {tab === "ai" && <AiPanel />}
            {tab === "phishing" && <PhishingPanel />}
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
      <div className="absolute left-[34%] top-[27rem] h-56 w-28 bg-slate-100/45" />
      <div className="absolute right-[26%] top-80 h-56 w-28 bg-slate-100/60" />
      <div className="absolute right-[8%] top-[27rem] h-28 w-28 bg-slate-100/60" />
      <div className="absolute left-[8%] bottom-0 h-28 w-28 bg-slate-100/65" />
      <div className="absolute right-[14%] bottom-0 h-28 w-44 bg-slate-100/50" />
    </div>
  );
}

function TabBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition sm:text-base ${
        active ? "bg-[#6699ff] text-white shadow-sm" : "text-foreground/70 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-base">
        <span className="font-semibold">{title}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#6699ff]/10 px-2.5 py-1 text-sm font-medium text-[#6699ff]">
          <ShieldCheck className="h-3.5 w-3.5" /> Powered by TruthLens
        </span>
      </div>
      {children}
    </div>
  );
}

function Dropzone() {
  return (
    <>
      <p className="mt-2 text-sm text-muted-foreground">Upload Media file and run deepfake detection analysis.</p>
      <label className="mt-5 flex h-60 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#6699ff]/40 bg-[#6699ff]/10 text-center transition hover:border-[#6699ff]/70 hover:bg-[#6699ff]/15">
        <UploadCloud className="h-8 w-8 text-[#6699ff]" />
        <p className="mt-3 text-base font-medium">Drag & Drop Media to Scan</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Or <span className="text-[#6699ff] underline">choose file</span> from your device
        </p>
        <input type="file" className="hidden" />
      </label>
      <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
        <span>Supported Formats: JPEG, PNG, WEBP</span>
        <span>Max file size: 100MB</span>
      </div>
    </>
  );
}

function DeepfakePanel() {
  return (
    <PanelCard title="Deepfake Detection">
      <Dropzone />
    </PanelCard>
  );
}

function AiPanel() {
  const [mode, setMode] = useState<"file" | "text">("file");
  return (
    <PanelCard title="Advanced Media and Text Scan">
      <p className="mt-2 text-sm text-muted-foreground">
        Use the upload/text toggle to analyse both file assets and suspicious text inputs.
      </p>
      <div className="mt-4 inline-flex gap-1 rounded-full bg-secondary p-1">
        <button
          onClick={() => setMode("file")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${mode === "file" ? "bg-[#6699ff] text-white" : "text-foreground/70"}`}
        >
          File Upload
        </button>
        <button
          onClick={() => setMode("text")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${mode === "text" ? "bg-[#6699ff] text-white" : "text-foreground/70"}`}
        >
          Text Input
        </button>
      </div>
      {mode === "file" ? (
        <Dropzone />
      ) : (
        <textarea
          rows={6}
          placeholder="Paste any text you suspect was generated by AI..."
          className="mt-4 w-full rounded-xl border border-input bg-background p-4 text-base outline-none focus:border-[#6699ff] focus:ring-2 focus:ring-[#6699ff]/20"
        />
      )}
    </PanelCard>
  );
}

function PhishingPanel() {
  return (
    <PanelCard title="Phishing Link Analysis">
      <p className="mt-2 text-sm text-muted-foreground">
        Upload suspicious URL and get a one-shot reliability indicator.
      </p>
      <label className="mt-4 block text-sm font-medium text-muted-foreground">URL Link</label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <input
          type="url"
          placeholder="https://example-login.verify-account.com"
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-full bg-[#6699ff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6699ff]/90">
          Analyse URL
        </button>
        <button className="inline-flex items-center gap-1 rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
    </PanelCard>
  );
}
