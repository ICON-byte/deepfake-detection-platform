import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
  X,
  Lock,
  Video,
  Mic,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

// Target backend API base configuration - Using relative path to leverage Vite proxy
const API_BASE_URL = "/api";

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
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [authHeaders, setAuthHeaders] = useState<Record<string, string>>({});
  const [usageStats, setUsageStats] = useState<{ usage: number; limit: number } | null>(null);

  // Initialize auth headers on mount (client-side only)
  useEffect(() => {
    const token = localStorage.getItem("truthlens_token");
    if (token) {
      setAuthHeaders({ Authorization: `Bearer ${token}` });
    }
    fetchUsage(token);
  }, []);

  const fetchUsage = async (token?: string | null) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/detection/usage`, { headers });
      if (res.data.success) {
        setUsageStats({ usage: res.data.usage, limit: res.data.limit });
      }
    } catch (err) {
      console.error("Failed to fetch usage stats:", err);
    }
  };

  // Helper hook to check authentication and manage session-based free local usage
  const checkGuestLimitReached = (): boolean => {
    const token = localStorage.getItem("truthlens_token");
    if (token) {
      if (usageStats && usageStats.usage >= usageStats.limit) {
        setShowLimitModal(true);
        return true;
      }
      return false;
    }; 

    const currentScans = parseInt(sessionStorage.getItem("truthlens_guest_scans") || "0", 10);
    if (currentScans >= 3) {
      setShowLimitModal(true);
      return true;
    }
    return false;
  };

  // Helper to increment scan counts for guests
  const incrementGuestScanCount = () => {
    const token = localStorage.getItem("truthlens_token");
    if (!token) {
      const currentScans = parseInt(sessionStorage.getItem("truthlens_guest_scans") || "0", 10);
      sessionStorage.setItem("truthlens_guest_scans", (currentScans + 1).toString());
    }
    fetchUsage(token);
  };

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-background">
        <GreyBlockBackground />
        <div className="relative mx-auto max-w-5xl px-3 pb-12 pt-28 sm:px-6 sm:pt-32 lg:px-8">
          <div className="text-center">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#6699ff]/30 bg-[#6699ff]/5 px-4 py-1.5 text-sm font-medium text-[#6699ff]">
              <ShieldCheck className="h-4 w-4" /> Multiple detection workflows for media and text.
            </span>
            <h1 className="mt-5 text-3xl font-bold sm:text-5xl">TruthLens Detect</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Select a workflow below, then upload files or paste content for real-time deepfake and AI analysis.
            </p>

            {/* 📈 DAILY LIMIT VISUALIZER */}
            {usageStats && (
              <div className="mx-auto mt-8 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <span>Daily Scan Limit</span>
                  <span>{usageStats.usage} / {usageStats.limit} Used</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      usageStats.usage >= usageStats.limit ? "bg-red-500" : "bg-[#6699ff]"
                    }`}
                    style={{ width: `${(usageStats.usage / usageStats.limit) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-400 font-medium">
                  {usageStats.usage >= usageStats.limit 
                    ? "Limit reached. Resets in 24 hours." 
                    : `${usageStats.limit - usageStats.usage} scans remaining today.`}
                </p>
              </div>
            )}
          </div>

          <div className="mx-auto mt-10 max-w-4xl bg-gray-100/60 border border-gray-200/60 p-1 rounded-3xl sm:rounded-full shadow-inner">
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 items-center">
              <TabBtn active={tab === "deepfake"} onClick={() => setTab("deepfake")}>
                Deepfake Detect
              </TabBtn>
              <TabBtn active={tab === "ai"} onClick={() => setTab("ai")}>
                Text AI Detection
              </TabBtn>
              <TabBtn active={tab === "phishing"} onClick={() => setTab("phishing")}>
                Phishing Detect
              </TabBtn>
            </div>
          </div>

          <div className="mt-8">
            {tab === "deepfake" && (
              <DeepfakePanel 
                onCheckLimit={checkGuestLimitReached} 
                onTrackScan={incrementGuestScanCount} 
                headers={authHeaders}
                onTriggerLimitModal={() => setShowLimitModal(true)}
              />
            )}
            {tab === "ai" && (
              <AiPanel 
                onCheckLimit={checkGuestLimitReached} 
                onTrackScan={incrementGuestScanCount} 
                headers={authHeaders}
                onTriggerLimitModal={() => setShowLimitModal(true)}
              />
            )}
            {tab === "phishing" && (
              <PhishingPanel 
                onCheckLimit={checkGuestLimitReached} 
                onTrackScan={incrementGuestScanCount} 
                headers={authHeaders}
                onTriggerLimitModal={() => setShowLimitModal(true)}
              />
            )}
          </div>
        </div>
      </section>


      {/* 🛑 RATE LIMIT REACHED OVERLAY MODAL */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowLimitModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Scan Limit Reached</h3>
              <p className="mt-2 text-sm text-gray-500">
                {localStorage.getItem("truthlens_token") 
                  ? "You've reached your daily limit of 8 scans! Maintain your security audit by reviewing your past detections in the history dashboard."
                  : "You've used your 3 free anonymous scans! Protect your data, unlock full breakdown parameters, and maintain an audit history by creating an account."
                }
              </p>
              
              <div className="mt-6 flex w-full flex-col gap-2">
                {localStorage.getItem("truthlens_token") ? (
                  <>
                    <Link
                      to="/history"
                      onClick={() => setShowLimitModal(false)}
                      className="flex w-full items-center justify-center rounded-xl bg-[#6699ff] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#6699ff]/90 transition-colors"
                    >
                      View My History
                    </Link>
                    <button
                      onClick={() => setShowLimitModal(false)}
                      className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Dismiss
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      onClick={() => setShowLimitModal(false)}
                      className="flex w-full items-center justify-center rounded-xl bg-[#6699ff] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#6699ff]/90 transition-colors"
                    >
                      Sign Up For Free
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setShowLimitModal(false)}
                      className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
      <div className="absolute left-[17%] top-108 h-28 w-36 bg-slate-100/55" />
      <div className="absolute left-[34%] top-108 h-56 w-28 bg-slate-100/45" />
      <div className="absolute right-[26%] top-80 h-56 w-28 bg-slate-100/60" />
      <div className="absolute right-[8%] top-108 h-28 w-28 bg-slate-100/60" />
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

interface PanelProps {
  onCheckLimit: () => boolean;
  onTrackScan: () => void;
  headers: any;
  onTriggerLimitModal: () => void;
}

// ======================= DEEPFAKE PANEL (PRODUCTION AWS PIPELINE) =======================
function DeepfakePanel({ onCheckLimit, onTrackScan, headers, onTriggerLimitModal }: PanelProps) {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = async (selectedFile: File | null) => {
    if (selectedFile) {
      const isImage = selectedFile.type.startsWith("image/");
      const isVideo = selectedFile.type.startsWith("video/");
      const isAudio = selectedFile.type.startsWith("audio/");

      if (isImage || isVideo || isAudio) {
        if (onCheckLimit()) return;
        setFile(selectedFile);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        
        if (isImage) {
          setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
          setPreviewUrl(null); // No preview for video/audio in this simple view
        }
      } else {
        toast.error("Please select a valid image, video, or audio file.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFileSelect(droppedFile);
  };

  const executePipeline = async () => {
    if (!file) return;
    if (onCheckLimit()) return;

    setIsProcessing(true);
    setProgress(5);

    try {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isAudio = file.type.startsWith("audio/");
      const mode = isAudio ? "audio" : (isVideo ? "video" : "image");

      let fileToUpload = file;

      // Optional: Client-side compression for images to boost speed
      if (isImage) {
        setStatusMessage("Optimizing image resolution for forensic analysis...");
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          fileToUpload = await imageCompression(file, options);
          console.log(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
        } catch (compressionError) {
          console.error("Compression failed, using original file:", compressionError);
        }
      }

      setStatusMessage("Requesting secure upload verification signature...");

      // Phase 1: Call gateway to acquire AWS Presigned Upload Target
      const presignResponse = await axios.post(
        `${API_BASE_URL}/detection/request-upload`,
        { fileName: file.name, fileType: fileToUpload.type, mode: mode },
        { headers }
      );

      const { presignedUrl, s3Key, fileUrl } = presignResponse.data;

      // Phase 2: Upload direct payload binary straight to the S3 bucket node
      setStatusMessage(`Uploading ${mode} securely to AWS S3 storage vault...`);
      setProgress(25);

      await axios.put(presignedUrl, fileToUpload, {
        headers: { "Content-Type": fileToUpload.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 45) / progressEvent.total);
            setProgress(25 + percentage);
          }
        },
      });

      // Phase 3: Submit asset mapping indexes down into Python architecture
      setStatusMessage(`Analyzing ${mode} biometrics & artifacts...`);
      setProgress(75);

      const analysisResponse = await axios.post(
        `${API_BASE_URL}/detection/analyze`,
        { fileUrl, s3Key, fileName: file.name, detectionMode: mode },
        { headers }
      );

      setProgress(100);
      onTrackScan();
      setIsProcessing(false);

      const report = analysisResponse.data.data;
      const duration = analysisResponse.data.analysis_duration || report.analysis_duration;

      navigate({
        to: "/result",
        search: {
          type: "deepfake",
          data: {
            isDeepfake: report.status === "Manipulated",
            confidence: report.confidenceScore / 100,
            analysisDuration: duration,
            details:
              analysisResponse.data.message ||
              (report.status === "Manipulated"
                ? "Multiple manipulation traces detected across the multi-modal neural scan."
                : "No significant deepfake patterns found. Media appears authentic."),
          },
          fileName: file.name,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);

      if (err?.response?.status === 429) {
        onTriggerLimitModal();
      } else {
        toast.error(err?.response?.data?.message || "An error hit the media storage pipeline.");
      }
    }
  };

  return (
    <PanelCard title="Deepfake Detection" icon={<ShieldCheck className="h-5 w-5" />}>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload image, video, or audio to detect AI-manipulated faces, voice cloning, and synthetic alterations.
      </p>

      <div
        className={`mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
          isProcessing
            ? "border-[#6699ff]/40 bg-[#6699ff]/5"
            : isDragging
            ? "border-[#6699ff] bg-[#6699ff]/20 scale-[0.99]"
            : file
              ? "border-[#6699ff]/70 bg-[#6699ff]/15"
              : "border-[#6699ff]/40 bg-[#6699ff]/10 hover:border-[#6699ff]/70 hover:bg-[#6699ff]/15"
        } px-4 py-8 text-center`}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
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
        ) : file ? (
          <div className="flex flex-col items-center gap-3">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded file preview"
                className="max-h-32 max-w-full rounded-lg object-contain shadow-sm"
              />
            ) : (
              <div className="p-4 rounded-full bg-[#6699ff]/10">
                {file.type.startsWith("video/") ? (
                  <Video className="h-10 w-10 text-[#6699ff]" />
                ) : (
                  <Mic className="h-10 w-10 text-[#6699ff]" />
                )}
              </div>
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
            <p className="mt-3 text-base font-medium">Drag & Drop Media to Scan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Or <span className="text-[#6699ff] underline">browse files</span>
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          className="hidden"
          id="deepfake-file-input"
          aria-label="Choose a media file to analyze for deepfakes"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          disabled={isProcessing}
        />
      </div>
      <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Supported: JPG, PNG, MP4, MOV, MP3, WAV</span>
        <span>Max file size: 100MB</span>
      </div>

      {file && !isProcessing && (
        <button
          onClick={executePipeline}
          className="mt-5 rounded-full bg-[#6699ff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6699ff]/90 transition-all"
        >
          Analyze Media
        </button>
      )}
    </PanelCard>
  );
}

// ======================= AI CONTENT PANEL (PRODUCTION AWS PIPELINE) =======================
function AiPanel({ onCheckLimit, onTrackScan, headers, onTriggerLimitModal }: PanelProps) {
  const navigate = useNavigate();
  const [textContent, setTextContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const executePipeline = async () => {
    if (!textContent.trim() || textContent.length < 50) {
      toast.warning("Please enter at least 50 characters for a meaningful linguistic audit.");
      return;
    }
    if (onCheckLimit()) return;

    setIsProcessing(true);
    setProgress(5);
    setStatusMessage("Initializing linguistic forensic environment...");

    try {
      // Phase 1: Request S3 Target for the text audit log
      const presignResponse = await axios.post(
        `${API_BASE_URL}/detection/request-upload`,
        { fileName: "audit_input.txt", fileType: "text/plain", mode: "text" },
        { headers }
      );

      const { presignedUrl, s3Key, fileUrl } = presignResponse.data;

      // Phase 2: Upload raw text to the secure vault
      setStatusMessage("Uploading text content to secure forensic vault...");
      setProgress(30);

      await axios.put(presignedUrl, textContent, {
        headers: { "Content-Type": "text/plain" }
      });

      // Phase 3: Execute the Text Council deliberation
      setStatusMessage("Executing deep linguistic pattern analysis...");
      setProgress(70);

      const analysisResponse = await axios.post(
        `${API_BASE_URL}/detection/analyze`,
        { 
          fileUrl, 
          s3Key, 
          fileName: "Linguistic Audit Log", 
          detectionMode: "text" 
        },
        { headers }
      );

      setProgress(100);
      onTrackScan();
      setIsProcessing(false);

      const report = analysisResponse.data.data;
      const duration = analysisResponse.data.analysis_duration || report.analysis_duration;

      navigate({
        to: "/result",
        search: { 
          type: "ai", 
          data: {
            isAIGenerated: report.status === "Manipulated",
            confidence: report.confidenceScore / 100,
            analysisDuration: duration,
            details: analysisResponse.data.message || (report.status === "Manipulated" 
              ? "Syntactic patterns and uniform perplexity consistent with LLM generation detected." 
              : "Linguistic variation and structural entropy match human authorship signatures."),
          }, 
          fileName: "Linguistic Audit", 
          timestamp: new Date().toISOString() 
        }
      });

    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);
      if (err?.response?.status === 429) {
        onTriggerLimitModal();
      } else {
        toast.error(err?.response?.data?.message || "Linguistic engine pipeline fault.");
      }
    }
  };

  return (
    <PanelCard title="Text AI Detection" icon={<FileText className="h-5 w-5" />}>
      <p className="mt-2 text-sm text-muted-foreground">
        Paste an essay, article, or message to detect signatures from ChatGPT, Claude, and Gemini using linguistic forensics.
      </p>

      {isProcessing ? (
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
        <div className="relative">
          <textarea
            id="ai-text-input"
            rows={8}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste suspect text content here (min 50 characters)..."
            className="mt-5 w-full rounded-xl border border-input bg-background p-5 text-base outline-none focus:border-[#6699ff] focus:ring-4 focus:ring-[#6699ff]/10 transition-all font-sans leading-relaxed resize-none shadow-inner"
            disabled={isProcessing}
            aria-label="Paste suspect text content here"
          />
          <div className="absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {textContent.length} Characters
          </div>
        </div>
      )}

      {textContent.trim().length >= 50 && !isProcessing && (
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#6699ff]" />
              <span className="text-[10px] font-black uppercase text-slate-500">Perplexity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#6699ff]" />
              <span className="text-[10px] font-black uppercase text-slate-500">Burstiness</span>
            </div>
          </div>
          <button
            onClick={executePipeline}
            className="rounded-full bg-[#6699ff] px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#5588ee] hover:shadow-[#6699ff]/25 transition-all cursor-pointer"
          >
            Run Linguistic Audit
          </button>
        </div>
      )}
    </PanelCard>
  );
}

// ======================= PHISHING PANEL (DIRECT API AUDIT) =======================
function PhishingPanel({ onCheckLimit, onTrackScan, headers, onTriggerLimitModal }: PanelProps) {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const executePipeline = async () => {
    if (!url.trim()) {
      toast.warning("Please enter a URL to audit for phishing.");
      return;
    }
    
    // Simple URL validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (e) {
      toast.error("Please enter a valid URL (e.g. google.com or https://secure-login.com)");
      return;
    }

    if (onCheckLimit()) return;

    setIsProcessing(true);
    setProgress(10);
    setStatusMessage("Connecting to phishing heuristic engine...");

    try {
      // Phishing is a direct POST to /analyze with the URL string
      const analysisResponse = await axios.post(
        `${API_BASE_URL}/detection/analyze`,
        { 
          url: url,
          fileName: `URL Audit: ${url.substring(0, 30)}`,
          detectionMode: "phishing" 
        },
        { headers }
      );

      setProgress(100);
      onTrackScan();
      setIsProcessing(false);

      const report = analysisResponse.data.data;
      const duration = analysisResponse.data.analysis_duration || report.analysis_duration;

      navigate({
        to: "/result",
        search: { 
          type: "phishing", 
          data: {
            isPhishing: report.status === "Manipulated",
            confidence: report.confidenceScore / 100,
            analysisDuration: duration,
            details: analysisResponse.data.message || (report.status === "Manipulated" 
              ? "This URL exhibits patterns consistent with credential harvesting and high-risk domain spoofing." 
              : "Domain reputation and structural heuristics suggest this URL is safe and authentic."),
            targetUrl: url
          }, 
          fileName: "URL Audit Log", 
          timestamp: new Date().toISOString() 
        }
      });

    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);
      if (err?.response?.status === 429) {
        onTriggerLimitModal();
      } else {
        toast.error(err?.response?.data?.message || "Phishing engine connection failure.");
      }
    }
  };

  return (
    <PanelCard title="Phishing Link Audit" icon={<Link2 className="h-5 w-5" />}>
      <p className="mt-2 text-sm text-muted-foreground">
        Scan suspicious links, SMS lures, and email redirects to detect domain spoofing and malicious intent.
      </p>

      {isProcessing ? (
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
        <div className="relative">
          <input
            type="text"
            id="phishing-url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste suspicious URL here (e.g. login-secure-bank.com)..."
            className="mt-5 w-full rounded-xl border border-input bg-background p-5 text-base outline-none focus:border-[#6699ff] focus:ring-4 focus:ring-[#6699ff]/10 transition-all font-sans leading-relaxed shadow-inner"
            disabled={isProcessing}
            aria-label="Paste suspicious URL here"
          />
        </div>
      )}

      {!isProcessing && (
        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#6699ff]" />
              <span className="text-[10px] font-black uppercase text-slate-500">Tld Extract</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#6699ff]" />
              <span className="text-[10px] font-black uppercase text-slate-500">Heuristics</span>
            </div>
          </div>
          <button
            onClick={executePipeline}
            className="rounded-full bg-[#6699ff] px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#5588ee] hover:shadow-[#6699ff]/25 transition-all cursor-pointer"
          >
            Audit Link
          </button>
        </div>
      )}
    </PanelCard>
  );
}



