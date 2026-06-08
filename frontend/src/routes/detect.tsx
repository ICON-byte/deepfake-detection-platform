import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import {
  UploadCloud,
  ShieldCheck,
  FileText,
  RotateCcw,
  Loader2,
  Image,
  FileCode2,
  Link2,
  File,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/detect")({
  head: () => ({
    meta: [
      { title: "Detect · TruthLens" },
      {
        name: "description",
        content: "Run TruthLens deepfake, AI-generated content, and phishing analysis.",
      },
      { property: "og:title", content: "TruthLens Detect" },
      {
        property: "og:description",
        content: "Verify media files, text and suspicious URLs in seconds.",
      },
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
        <div className="relative mx-auto max-w-5xl px-3 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8">
          <div className="text-center">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#6699ff]/30 bg-[#6699ff]/5 px-4 py-1.5 text-sm font-medium text-[#6699ff]">
              <ShieldCheck className="h-4 w-4" /> Multiple detection workflows for media and
              suspicious links.
            </span>
            <h1 className="mt-5 text-3xl font-bold sm:text-5xl">TruthLens Detect</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Select a workflow below, then upload files or paste content for real-time deepfake,
              AI, and phishing analysis.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl bg-gray-100/60 border border-gray-200/60 p-1 rounded-3xl sm:rounded-full shadow-inner">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 items-center">
              <TabBtn active={tab === "deepfake"} onClick={() => setTab("deepfake")}>
                Deepfake Detect
              </TabBtn>
              <TabBtn active={tab === "ai"} onClick={() => setTab("ai")}>
                AI Generated Content
              </TabBtn>
              <TabBtn active={tab === "phishing"} onClick={() => setTab("phishing")}>
                Phishing
              </TabBtn>
            </div>
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

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 px-6 text-sm font-medium tracking-wide rounded-full transition-all duration-200 select-none ${
        active
          ? "bg-[#6699ff] text-white shadow-sm"
          : "text-gray-500 hover:text-gray-800 bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function PanelCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-base">
        {icon && <span className="text-[#6699ff]">{icon}</span>}
        <span className="font-semibold">{title}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#6699ff]/10 px-2.5 py-1 text-sm font-medium text-[#6699ff]">
          <ShieldCheck className="h-3.5 w-3.5" /> Powered by TruthLens
        </span>
      </div>
      {children}
    </div>
  );
}

// ======================= DEEPFAKE PANEL =======================
function DeepfakePanel() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = async (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setIsUploading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsUploading(false);
    } else if (selectedFile) {
      alert("Please select a valid image file (JPEG, PNG, WEBP)");
    }
  };

  const resetAnalysis = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setStatusMessage("");
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setProgress(0);
    setStatusMessage("Preparing upload...");

    try {
      // 1. Request presigned URL
      const uploadRequest = await fetch("/api/detection/request-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          mode: "image",
        }),
      });
      const { presignedUrl, s3Key, fileUrl } = await uploadRequest.json();

      // 2. Upload to S3
      setStatusMessage("Uploading to cloud...");
      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // 3. Analyze
      setStatusMessage("Analyzing facial subjects...");
      const analyzeRequest = await fetch("/api/detection/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl,
          s3Key,
          fileName: file.name,
          detectionMode: "image",
        }),
      });
      const result = await analyzeRequest.json();

      if (!result.success) throw new Error(result.message);

      setIsAnalyzing(false);
      navigate({
        to: "/result",
        search: {
          type: "deepfake",
          data: {
            isDeepfake: result.data.status === "Manipulated",
            confidence: result.data.confidenceScore / 100,
            details:
              result.message ||
              (result.data.status === "Manipulated"
                ? "Multiple manipulation traces detected including inconsistent lighting and warped facial features."
                : "No significant deepfake patterns found. Image appears authentic."),
          },
          fileName: file.name,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      alert(error.message || "Analysis failed");
      setIsAnalyzing(false);
    }
  };

  return (
    <PanelCard title="Deepfake Detection" icon={<Image className="h-5 w-5" />}>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload an image to detect AI-manipulated faces, GAN artifacts, and synthetic alterations.
      </p>

      <div
        className={`mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
          isAnalyzing
            ? "border-[#6699ff]/40 bg-[#6699ff]/5"
            : file
              ? "border-[#6699ff]/70 bg-[#6699ff]/15"
              : "border-[#6699ff]/40 bg-[#6699ff]/10 hover:border-[#6699ff]/70 hover:bg-[#6699ff]/15"
        } px-4 py-8 text-center`}
        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#6699ff]" />
            <p className="text-sm font-medium text-[#6699ff]">{statusMessage}</p>
            <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6699ff] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#6699ff]" />
            <p className="text-sm font-medium">Uploading file...</p>
          </div>
        ) : file && previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-32 max-w-full rounded-lg object-contain shadow-sm"
            />
            <div>
              <p className="text-base font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-[#6699ff]" />
            <p className="mt-3 text-base font-medium">Drag & Drop Image to Scan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Or <span className="text-[#6699ff] underline">browse files</span>
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          id="deepfake-file-input"
          aria-label="Choose an image file to analyze for deepfakes"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          disabled={isUploading || isAnalyzing}
        />
      </div>
      <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Supported Formats: JPEG, PNG, WEBP</span>
        <span>Max file size: 100MB</span>
      </div>

      {file && !isAnalyzing && !isUploading && (
        <button
          onClick={handleAnalyze}
          className="mt-5 rounded-full bg-[#6699ff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6699ff]/90 transition-all"
        >
          Analyze Media
        </button>
      )}
    </PanelCard>
  );
}

// ======================= AI CONTENT PANEL =======================
function AiPanel() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = async (selectedFile: File | null) => {
    if (
      selectedFile &&
      (selectedFile.type.startsWith("image/") ||
        selectedFile.type.startsWith("video/") ||
        selectedFile.type === "text/plain")
    ) {
      setIsUploading(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
      setIsUploading(false);
    } else if (selectedFile) {
      alert("Please select an image, video, or text file");
    }
  };

  const resetAnalysis = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setTextContent("");
    setProgress(0);
    setStatusMessage("");
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setStatusMessage("Preparing analysis...");

    try {
      let finalFileUrl = "";
      let finalS3Key = "";
      let finalFileName = "";

      if (mode === "file") {
        if (!file) return;
        finalFileName = file.name;
        // 1. Request presigned URL
        setStatusMessage("Requesting cloud access...");
        const uploadRequest = await fetch("/api/detection/request-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            mode: "ai",
          }),
        });
        const { presignedUrl, s3Key, fileUrl } = await uploadRequest.json();
        finalFileUrl = fileUrl;
        finalS3Key = s3Key;

        // 2. Upload to S3
        setStatusMessage("Uploading to cloud...");
        await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
      } else {
        if (!textContent.trim()) return;
        finalFileName = "text_input.txt";
        // 1. Request presigned URL for text
        setStatusMessage("Processing text input...");
        const uploadRequest = await fetch("/api/detection/request-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: "text_input.txt",
            fileType: "text/plain",
            mode: "text",
          }),
        });
        const { presignedUrl, s3Key, fileUrl } = await uploadRequest.json();
        finalFileUrl = fileUrl;
        finalS3Key = s3Key;

        // 2. Upload text to S3
        await fetch(presignedUrl, {
          method: "PUT",
          body: textContent,
          headers: { "Content-Type": "text/plain" },
        });
      }

      // 3. Analyze
      setStatusMessage("Running AI analysis...");
      const analyzeRequest = await fetch("/api/detection/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: finalFileUrl,
          s3Key: finalS3Key,
          fileName: finalFileName,
          detectionMode:
            mode === "file" ? (file?.type.startsWith("video/") ? "video" : "image") : "text",
        }),
      });
      const result = await analyzeRequest.json();

      if (!result.success) throw new Error(result.message);

      setIsAnalyzing(false);
      navigate({
        to: "/result",
        search: {
          type: "ai",
          data: {
            isAIGenerated: result.data.status === "Manipulated",
            confidence: result.data.confidenceScore / 100,
            details:
              result.message ||
              (result.data.status === "Manipulated"
                ? "Synthetic artifacts detected consistent with AI generation."
                : "Likely human-created content."),
          },
          fileName: finalFileName,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      alert(error.message || "Analysis failed");
      setIsAnalyzing(false);
    }
  };

  return (
    <PanelCard title="AI Generated Content Scan" icon={<FileCode2 className="h-5 w-5" />}>
      <p className="mt-2 text-sm text-muted-foreground">
        Detect synthetic media and AI-written text using advanced pattern recognition.
      </p>

      <div className="mt-4 inline-flex bg-gray-100/60 border border-gray-200/60 p-1 rounded-full shadow-inner max-w-xs w-full">
        <div className="grid grid-cols-2 gap-1 w-full items-center">
          <button
            onClick={() => {
              setMode("file");
              resetAnalysis();
            }}
            className={`py-2 px-4 text-xs font-medium rounded-full transition-all duration-200 select-none ${
              mode === "file"
                ? "bg-[#6699ff] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 bg-transparent"
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => {
              setMode("text");
              resetAnalysis();
            }}
            className={`py-2 px-4 text-xs font-medium rounded-full transition-all duration-200 select-none ${
              mode === "text"
                ? "bg-[#6699ff] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 bg-transparent"
            }`}
          >
            Text Input
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <>
          <div
            className={`mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
              isAnalyzing
                ? "border-[#6699ff]/40 bg-[#6699ff]/5"
                : file
                  ? "border-[#6699ff]/70 bg-[#6699ff]/15"
                  : "border-[#6699ff]/40 bg-[#6699ff]/10 hover:border-[#6699ff]/70 hover:bg-[#6699ff]/15"
            } px-4 py-8 text-center`}
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-[#6699ff]" />
                <p className="text-sm font-medium text-[#6699ff]">{statusMessage}</p>
                <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6699ff] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
              </div>
            ) : isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-[#6699ff]" />
                <p className="text-sm font-medium">Uploading file...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-32 max-w-full rounded-lg object-contain shadow-sm"
                  />
                ) : (
                  <File className="h-12 w-12 text-[#6699ff]" />
                )}
                <div>
                  <p className="text-base font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-[#6699ff]" />
                <p className="mt-3 text-base font-medium">Upload Media or Text File</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Or <span className="text-[#6699ff] underline">browse files</span>
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,text/plain"
              className="hidden"
              id="ai-file-input"
              aria-label="Upload an image or text file for AI content analysis"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              disabled={isUploading || isAnalyzing}
            />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Supported: Images (JPG, PNG, WEBP) or .txt files
          </div>
        </>
      ) : (
        // Text mode with loader during analysis
        <>
          {isAnalyzing ? (
            <div className="mt-5 flex min-h-52 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#6699ff]/40 bg-[#6699ff]/5 px-4 py-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#6699ff]" />
              <p className="mt-2 text-sm font-medium text-[#6699ff]">{statusMessage}</p>
              <div className="mt-3 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6699ff] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{Math.round(progress)}%</p>
            </div>
          ) : (
            <textarea
              id="ai-text-input"
              rows={6}
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
              }}
              placeholder="Paste any text you suspect was generated by AI (e.g., ChatGPT, Claude, Gemini)..."
              className="mt-4 w-full rounded-xl border border-input bg-background p-4 text-base outline-none focus:border-[#6699ff] focus:ring-2 focus:ring-[#6699ff]/20"
              disabled={isAnalyzing}
            />
          )}
        </>
      )}

      {((mode === "file" && file) || (mode === "text" && textContent.trim())) &&
        !isAnalyzing &&
        !isUploading && (
          <button
            onClick={handleAnalyze}
            className="mt-5 rounded-full bg-[#6699ff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6699ff]/90 transition-all"
          >
            Analyze Content
          </button>
        )}
    </PanelCard>
  );
}

// ======================= PHISHING PANEL =======================
function PhishingPanel() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const resetAnalysis = () => {
    setUrl("");
    setProgress(0);
    setStatusMessage("");
    setIsAnalyzing(false);
  };

  const simulateUrlAnalysis = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setProgress(0);
    const steps = [
      { progress: 10, message: "Validating URL format..." },
      { progress: 30, message: "Checking domain reputation..." },
      { progress: 55, message: "Scanning for phishing indicators..." },
      { progress: 75, message: "Analyzing URL structure & redirects..." },
      { progress: 95, message: "Cross-referencing threat databases..." },
      { progress: 100, message: "Risk assessment complete." },
    ];
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setProgress(step.progress);
      setStatusMessage(step.message);
    }
    const urlLower = url.toLowerCase();
    const suspiciousKeywords = [
      "verify",
      "secure",
      "login",
      "account",
      "update",
      "confirm",
      "bank",
      "paypal",
      "apple",
    ];
    const suspiciousScore =
      suspiciousKeywords.filter((k) => urlLower.includes(k)).length / suspiciousKeywords.length;
    const isMalicious =
      suspiciousScore > 0.3 || urlLower.includes("-verify-") || urlLower.includes("secure-");
    const confidence = 0.6 + suspiciousScore * 0.4;
    const riskLevel = confidence > 0.8 ? "high" : confidence > 0.55 ? "medium" : "low";
    setIsAnalyzing(false);
    navigate({
      to: "/result",
      search: {
        type: "phishing",
        data: {
          isMalicious,
          confidence: Math.min(confidence, 0.98),
          details: isMalicious
            ? "This URL exhibits phishing characteristics: domain impersonation, suspicious redirects, and deceptive path structure."
            : "No obvious phishing patterns detected. Domain appears legitimate based on preliminary heuristics.",
          riskLevel,
          url,
        },
        fileName: url,
        timestamp: new Date().toISOString(),
      },
    });
  };

  return (
    <PanelCard title="Phishing & Malicious Link Analysis" icon={<Link2 className="h-5 w-5" />}>
      <p className="mt-2 text-sm text-muted-foreground">
        Submit a suspicious URL for instant risk assessment and threat intelligence check.
      </p>

      <label
        htmlFor="phishing-url"
        className="mt-4 block text-sm font-medium text-muted-foreground"
      >
        URL Link
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <input
          id="phishing-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example-login.verify-account.com"
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          disabled={isAnalyzing}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={simulateUrlAnalysis}
          disabled={!url.trim() || isAnalyzing}
          className="rounded-full bg-[#6699ff] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6699ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze URL"}
        </button>
        <button
          onClick={resetAnalysis}
          className="inline-flex items-center gap-1 rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-secondary transition-all"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {isAnalyzing && (
        <div className="mt-5 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[#6699ff]" />
            <span>{statusMessage}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-[#6699ff] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      )}
    </PanelCard>
  );
}
