import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Video, Music, X, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { useAuth } from '@/contexts/AuthContext';
import { handleFullScanFlow } from "@/api/detectionService";

export const Route = createFileRoute("/detect")({
  component: DetectPage
});

const ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
};

const STATUSES = [
  "Securing upload clearance...",
  "Streaming media payload to S3 cloud storage...",
  "Invoking Deepfake analytics cluster...",
  "Evaluating neural network classification tensors...",
  "Finalizing evaluation data reports...",
];

function iconFor(type: string) {
  if (type.startsWith("image")) return ImageIcon;
  if (type.startsWith("video")) return Video;
  return Music;
}

function DetectPage() {
  const { token, user, scansRemaining, decrementScans } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const minDuration = 12000; // Expected timing threshold window for the cloud pipeline run

  const GUEST_SCAN_LIMIT = 5;

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setUploadProgress(0); // Clear progress when a new file lands
    if (f.type.startsWith("image") || f.type.startsWith("video")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPT, multiple: false, maxSize: 100 * 1024 * 1024,
  });

  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    if (isProcessingRef.current) return;

    // Check plan limits before starting the network processing pipeline
    const canScan = decrementScans();
    if (!canScan) {
      if (!user) {
        setError(`You have used all ${GUEST_SCAN_LIMIT} free scans. Please log in to continue.`);
      } else {
        setError("You have no scans left. Please upgrade your plan.");
      }
      return;
    }

    isProcessingRef.current = true;
    setError(null);
    setUploading(true);
    setAnalyzing(true);
    setCurrentStatusIndex(0);
    setAnalysisProgress(0);

    const startTime = Date.now();

    // 1. Kick off simulated visual timeline state shifts 
    let step = 0;
    if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    statusIntervalRef.current = setInterval(() => {
      step++;
      if (step < STATUSES.length) setCurrentStatusIndex(step);
      if (step >= STATUSES.length - 1 && statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    }, 2500);

    // 2. Animate progress meter elements smoothly to 95%
    let progress = 0;
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (progress < 95) {
        progress += Math.random() * 1.5;
        setAnalysisProgress(Math.min(Math.floor(progress), 95));
      }
    }, 150);

    try {
      // 3. Fire your optimized 3-Step S3 Cloud Pipeline hook
      const backendReport = await handleFullScanFlow(file, (computedProgress: number) => {
        // Exposes network progress hook straight to the UI state tracking
        setUploadProgress(computedProgress);
        if (computedProgress === 100) {
          setUploading(false);
        }
      });

      // 4. Force synchronization delay blocks if backend processes run instantly
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, minDuration - elapsed);

      setTimeout(() => {
        if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        
        setAnalysisProgress(100);
        setCurrentStatusIndex(STATUSES.length - 1);

        // 5. Navigate to the results screen using the new MongoDB scan record ID
        setTimeout(() => {
          navigate({
            to: '/results',
            search: { scanId: backendReport._id } as any,
          });
          isProcessingRef.current = false;
        }, 500);
      }, remainingDelay);

    } catch (err: any) {
      console.error("🔴 AI Network Analysis Route Crash:", err);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      
      setError(err.response?.data?.message || err.message || 'Detection flow execution halted.');
      setAnalyzing(false);
      setUploading(false);
      isProcessingRef.current = false;
    }
  };

  return (
    <PageShell>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
            <span>AI Detection Engine · Cloud Architecture</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Analyze your <span className="gradient-text">media</span>
          </h1>
          <p className="mt-3 text-gray-400">Drop an image, video, or audio file to begin.</p>

          {!user && (
            <div className="mt-2 text-xs">
              {scansRemaining > 0 ? (
                <p className="text-[#F7941D]">
                  Guest: {scansRemaining} free scan{scansRemaining !== 1 ? 's' : ''} remaining.{" "}
                  <Link to="/login" className="underline">Login</Link> for higher limits.
                </p>
              ) : (
                <p className="text-red-400">
                  You have used all {GUEST_SCAN_LIMIT} free scans. Please log in to continue.
                </p>
              )}
            </div>
          )}

          {user && scansRemaining !== undefined && scansRemaining === 0 && (
            <p className="mt-2 text-xs text-red-400">
              You have used all your scans. <Link to="/pricing" className="underline">Upgrade</Link> to continue.
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card text-center py-12">
                <div className="max-w-md mx-auto mb-8">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>
                      {uploading 
                        ? `Cloud streaming data... (${uploadProgress}%)` 
                        : "AI Engine Processing..."}
                    </span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary transition-all duration-300 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>
                <div className="h-10 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStatusIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="text-gray-300 text-base font-medium px-4"
                    >
                      {STATUSES[currentStatusIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : !file ? (
            <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                {...getRootProps()}
                className={`glass-card border-2 border-dashed transition-all cursor-pointer p-12 text-center
                  ${
                    isDragActive
                      ? "border-[#F7941D] bg-[#F7941D]/5 scale-[1.01]"
                      : "border-white/15 hover:border-white/30"
                  }`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={{ y: isDragActive ? -6 : 0 }}
                  className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6"
                >
                  <UploadCloud className="w-9 h-9 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? "Drop your file here" : "Drag & drop media to scan"}
                </h3>
                <p className="text-sm text-gray-400 mb-6">or click to browse from your device</p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  {[
                    { Icon: ImageIcon, label: "JPG · PNG · WEBP" },
                    { Icon: Video, label: "MP4 · MOV" },
                    { Icon: Music, label: "MP3 · WAV" },
                  ].map(({ Icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/20">
                      <Icon className="w-3.5 h-3.5 text-[#6699FF]" />
                      <span className="text-gray-300">{label}</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-6">Max file size: 100 MB</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="file" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass-card">
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                    {!user && error.includes("free scans") && (
                      <div className="mt-2">
                        <Link to="/login" className="text-[#6699FF] underline">Go to login</Link>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  {preview && file.type.startsWith("image") ? (
                    <img src={preview} alt="" className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                  ) : preview && file.type.startsWith("video") ? (
                    <video src={preview} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const Icon = iconFor(file.type);
                        return <Icon className="w-10 h-10 text-white" />;
                      })()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-white truncate">{file.name}</h3>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "unknown"}
                        </p>
                      </div>
                      <button
                        aria-label="Remove file"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                          setUploadProgress(0);
                          setError(null);
                        }}
                        className="p-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition"
                      >
                        <X className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setError(null);
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={uploading || isProcessingRef.current}
                    className="btn-primary"
                  >
                    {isProcessingRef.current ? <Loader2 className="animate-spin inline mr-2 w-4 h-4" /> : null}
                    Analyze Media
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </PageShell>
  );
}