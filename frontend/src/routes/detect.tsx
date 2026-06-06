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
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3 w-3" /> Multiple detection workflows for media and suspicious links.
          </span>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">TruthLens Detect</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Select a workflow below, then continue to the dedicated analysis flow for media files, text insights or suspicious URLs.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-md gap-2 rounded-full border border-border/70 bg-card p-1">
          <TabBtn active={tab === "deepfake"} onClick={() => setTab("deepfake")}>Deepfake Detect</TabBtn>
          <TabBtn active={tab === "ai"} onClick={() => setTab("ai")}>AI Generated Content</TabBtn>
          <TabBtn active={tab === "phishing"} onClick={() => setTab("phishing")}>Phishing</TabBtn>
        </div>

        <div className="mt-8">
          {tab === "deepfake" && <DeepfakePanel />}
          {tab === "ai" && <AiPanel />}
          {tab === "phishing" && <PhishingPanel />}
        </div>
      </section>
    </SiteLayout>
  );
}

function TabBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition sm:text-sm ${
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/70 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold">{title}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          <ShieldCheck className="h-3 w-3" /> Powered by TruthLens
        </span>
      </div>
      {children}
    </div>
  );
}

function Dropzone() {
  return (
    <>
      <p className="mt-1 text-xs text-muted-foreground">Upload Media file and run deepfake detection analysis.</p>
      <label className="mt-4 flex h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-[#f4f6ff] text-center transition hover:border-primary/60 hover:bg-[#eef2ff]">
        <UploadCloud className="h-7 w-7 text-primary" />
        <p className="mt-3 text-sm font-medium">Drag & Drop Media to Scan</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Or <span className="text-primary underline">choose file</span> from your device
        </p>
        <input type="file" className="hidden" />
      </label>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
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
      <p className="mt-1 text-xs text-muted-foreground">
        Use the upload/text toggle to analyse both file assets and suspicious text inputs.
      </p>
      <div className="mt-3 inline-flex gap-1 rounded-full bg-secondary p-1">
        <button
          onClick={() => setMode("file")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${mode === "file" ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}
        >
          File Upload
        </button>
        <button
          onClick={() => setMode("text")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${mode === "text" ? "bg-primary text-primary-foreground" : "text-foreground/70"}`}
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
          className="mt-4 w-full rounded-xl border border-input bg-background p-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      )}
    </PanelCard>
  );
}

function PhishingPanel() {
  return (
    <PanelCard title="Phishing Link Analysis">
      <p className="mt-1 text-xs text-muted-foreground">
        Upload suspicious URL and get a one-shot reliability indicator.
      </p>
      <label className="mt-4 block text-xs font-medium text-muted-foreground">URL Link</label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <input
          type="url"
          placeholder="https://example-login.verify-account.com"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
          Analyse URL
        </button>
        <button className="inline-flex items-center gap-1 rounded-full border border-input bg-background px-4 py-2 text-xs font-medium hover:bg-secondary">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>
    </PanelCard>
  );
}
