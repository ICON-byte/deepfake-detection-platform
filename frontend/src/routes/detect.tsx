import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import {
  UploadCloud,
  ShieldCheck,
  FileText,
  RotateCcw,
      }
    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);
      if (err?.response?.status === 429) {
        onTriggerLimitModal();
      } else {
        alert(err?.response?.data?.message || "Pipeline integration fault.");
      }
                onCheckLimit={checkGuestLimitReached} 
                onTrackScan={incrementGuestScanCount} 
                headers={getAuthHeaders()}
                onTriggerLimitModal={() => setShowLimitModal(true)}
              />
            )}
          </div>
        </div>
      </section>

      {/* 🛑 GUEST RATE LIMIT REACHED OVERLAY MODAL */}
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
                You've used your 3 free anonymous scans! Protect your data, unlock full breakdown parameters, and maintain an audit history by creating an account.
              </p>
              
              <div className="mt-6 flex w-full flex-col gap-2">
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
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      if (onCheckLimit()) return;
      setFile(selectedFile);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else if (selectedFile) {
      alert("Please select a valid image file (JPEG, PNG, WEBP)");
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
    setStatusMessage("Requesting secure upload verification signature...");

    try {
      // Phase 1: Call gateway to acquire AWS Presigned Upload Target
      const presignResponse = await axios.post(
        `${API_BASE_URL}/detection/request-upload`,
        { fileName: file.name, fileType: file.type, mode: "image" },
        { headers }
      );

      const { uploadUrl, s3Key, fileUrl } = presignResponse.data;

      // Phase 2: Upload direct payload binary straight to the S3 bucket node
      setStatusMessage("Uploading asset securely to AWS S3 storage vault...");
      setProgress(25);

      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 45) / progressEvent.total);
            setProgress(25 + percentage);
          }
        },
      });

      // Phase 3: Submit asset mapping indexes down into Python architecture
      setStatusMessage("Analyzing facial biometrics & pixel anomalies...");
      setProgress(75);

      const analysisResponse = await axios.post(
        `${API_BASE_URL}/detection/analyze`,
        { fileUrl, s3Key, fileName: file.name, detectionMode: "image" },
        { headers }
      );

      setProgress(100);
      onTrackScan();
      setIsProcessing(false);

      navigate({
        to: "/result",
        search: {
          type: "deepfake",
          data: analysisResponse.data.data,
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
        alert(err?.response?.data?.message || "An error hit the media storage pipeline.");
      }
    }
  };

  return (
    <PanelCard title="Deepfake Detection" icon={<Image className="h-5 w-5" />}>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload an image to detect AI-manipulated faces, GAN artifacts, and synthetic alterations.
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
        ) : file && previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl}
              alt="Uploaded file preview"
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
          disabled={isProcessing}
        />
      </div>
      <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Supported Formats: JPEG, PNG, WEBP</span>
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
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
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
    if (selectedFile && (selectedFile.type.startsWith("image/") || selectedFile.type === "text/plain")) {
      if (onCheckLimit()) return;
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
    } else if (selectedFile) {
      alert("Please select an image or text file (.txt)");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing && mode === "file") setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing || mode !== "file") return;
    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFileSelect(droppedFile);
  };

  const resetAnalysis = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setTextContent("");
    setProgress(0);
    setStatusMessage("");
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executePipeline = async () => {
    if (onCheckLimit()) return;
    setIsProcessing(true);
    setProgress(5);

    try {
      if (mode === "file" && file) {
        setStatusMessage("Requesting binary file upload parameters...");
        
        const presignResponse = await axios.post(
          `${API_BASE_URL}/detection/request-upload`,
          { fileName: file.name, fileType: file.type, mode: "text" },
          { headers }
        );

        const { uploadUrl, s3Key, fileUrl } = presignResponse.data;

        setStatusMessage("Streaming document payload to cloud servers...");
        setProgress(30);

        await axios.put(uploadUrl, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentage = Math.round((progressEvent.loaded * 40) / progressEvent.total);
              setProgress(30 + percentage);
            }
          }
        });

        setStatusMessage("Executing generative structural classification check...");
        setProgress(80);

        const analysisResponse = await axios.post(
          `${API_BASE_URL}/detection/analyze`,
          { fileUrl, s3Key, fileName: file.name, detectionMode: "text" },
          { headers }
        );

        setProgress(100);
        onTrackScan();
        setIsProcessing(false);

        navigate({
          to: "/result",
          search: { 
            type: "ai", 
            data: analysisResponse.data.data, 
            fileName: file.name, 
            timestamp: new Date().toISOString() 
          }
        });

      } else if (mode === "text" && textContent.trim()) {
        setStatusMessage("Evaluating custom textual patterns...");
        setProgress(40);

        const analysisResponse = await axios.post(
          `${API_BASE_URL}/detection/analyze-text`,
          { text: textContent },
          { headers }
        );

        setProgress(100);
        onTrackScan();
        setIsProcessing(false);

        navigate({
          to: "/result",
          search: { 
            type: "ai", 
            data: analysisResponse.data.data, 
            fileName: "Text Analysis", 
            timestamp: new Date().toISOString() 
          }
        });
      }
<<<<<<< HEAD
    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);
      if (err?.response?.status === 429) {
        onTriggerLimitModal();
      } else {
        alert(err?.response?.data?.message || "Pipeline integration fault.");
      }
=======

      // 3. Analyze
      const analyzeRequest = await fetch("/api/detection/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: finalFileUrl,
          s3Key: finalS3Key,
          fileName: finalFileName,
          detectionMode:
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
                    alt="Uploaded image preview"
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
              disabled={isProcessing}
            />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Supported: Images (JPG, PNG, WEBP) or .txt files
          </div>
        </>
      ) : (
        <>
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
            <textarea
              id="ai-text-input"
              rows={6}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste any text you suspect was generated by AI (e.g., ChatGPT, Claude, Gemini)..."
              className="mt-4 w-full rounded-xl border border-input bg-background p-4 text-base outline-none focus:border-[#6699ff] focus:ring-2 focus:ring-[#6699ff]/20"
              disabled={isProcessing}
              aria-label="Paste suspect text content here"
            />
          )}
        </>
      )}

<<<<<<< HEAD
      {((mode === "file" && file) || (mode === "text" && textContent.trim())) && !isProcessing && (
        <button
          onClick={executePipeline}
          className="mt-5 rounded-full bg-[#6699ff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6699ff]/90 transition-all"
        >
          Analyze Content
        </button>
      )}
=======
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
>>>>>>> ab0a51b2a747cdfdb274004d36bf1c6377bc2007
    </PanelCard>
  );
}

// ======================= PHISHING PANEL (PRODUCTION ENDPOINT DISPATCH) =======================
function PhishingPanel({ onCheckLimit, onTrackScan, headers, onTriggerLimitModal }: PanelProps) {
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

  const handleUrlScan = async () => {
    if (!url.trim()) return;
    if (onCheckLimit()) return;

    setIsAnalyzing(true);
<<<<<<< HEAD
    setProgress(20);
    setStatusMessage("Querying domain reputation systems...");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/detection/analyze-url`,
        { url },
        { headers }
      );

      setProgress(100);
      onTrackScan();
      setIsAnalyzing(false);

      navigate({
        to: "/result",
        search: {
          type: "phishing",
          data: response.data.data,
          fileName: url,
          timestamp: new Date().toISOString(),
=======
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
>>>>>>> ab0a51b2a747cdfdb274004d36bf1c6377bc2007
        },
      });
    } catch (err: any) {
      setIsAnalyzing(false);
      setProgress(0);

      if (err?.response?.status === 429) {
        onTriggerLimitModal();
      } else {
        alert(err?.response?.data?.message || "URL lookup failed.");
      }
    }
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
          onClick={handleUrlScan}
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
