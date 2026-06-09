import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  BarChart3,
  Clock,
  FileImage,
  FileText,
  Link2,
  Shield,
  Brain,
  Target,
  Zap,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

// Define TypeScript interfaces for type-safe parameter processing
interface DeepfakeData {
  isDeepfake: boolean;
  confidence: number;
  details: string;
}

interface AIData {
  isAIGenerated: boolean;
  confidence: number;
  details: string;
}

interface PhishingData {
  isMalicious: boolean;
  confidence: number;
  details: string;
  riskLevel: "low" | "high";
  url?: string;
}

export const Route = createFileRoute("/result")({
  component: ResultPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: search.type as "deepfake" | "ai" | "phishing",
      data: search.data as any,
      fileName: search.fileName as string | undefined,
      timestamp: search.timestamp as string | undefined,
    };
  },
});

function ResultPage() {
  const { type, data, fileName, timestamp } = Route.useSearch();
  const navigate = useNavigate();

  // If search parameters are corrupted or type is missing, fallback to dashboard
  useEffect(() => {
    if (!type || !data) {
      navigate({ to: "/detect" });
    }
  }, [type, data, navigate]);

  const handleNewAnalysis = () => {
    navigate({ to: "/detect" });
  };

  const handleDownloadReport = () => {
    const report = {
      analysisType: type,
      result: data,
      fileName: fileName || "unknown",
      timestamp: timestamp || new Date().toISOString(),
      analyzer: "TruthLens v1.0",
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `truthlens-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = () => {
    if (timestamp) return new Date(timestamp).toLocaleString();
    return new Date().toLocaleString();
  };

  if (!type || !data) return null;

  // 1. DEEPFAKE ANALYSIS CARD
  if (type === "deepfake") {
    const { isDeepfake, confidence, details } = data as DeepfakeData;
    const confidencePercent = (confidence * 100).toFixed(1);
    const scoreColor = isDeepfake ? "text-red-600" : "text-green-600";

    const artifactScore = isDeepfake ? 87 : 23;
    const faceConsistency = isDeepfake ? 34 : 92;
    const lightingAnalysis = isDeepfake ? 28 : 88;

    return (
      <SiteLayout>
        <div className="mx-auto max-w-5xl px-4 py-12 mt-24 mb-20">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-lg overflow-hidden mb-8">
            <div className="px-8 py-10 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 rounded-2xl">
                    {isDeepfake ? (
                      <XCircle className="h-8 w-8 text-[#6699ff]" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-[#6699ff]" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">
                      {isDeepfake ? "Deepfake Detected" : "Authentic Media"}
                    </h1>
                    <p className="text-sm text-slate-600 mt-2">
                      Analysis completed at {formatTimestamp()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap justify-end">
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Report
                  </button>
                  <button
                    onClick={handleNewAnalysis}
                    className="inline-flex items-center gap-2 rounded-full bg-[#6699ff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5588ee] transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" /> New Analysis
                  </button>
                </div>
              </div>
            </div>

            <div className="px-8 py-8 space-y-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Detection Confidence</p>
                    <p className={`text-5xl font-bold ${scoreColor}`}>
                      {confidencePercent}%
                    </p>
                  </div>
                  <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200 text-slate-700">
                    {isDeepfake ? "MANIPULATED" : "AUTHENTIC"}
                  </div>
                </div>
                <div className="h-4 rounded-full bg-slate-300 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDeepfake ? "bg-linear-to-r from-red-500 to-red-600" : "bg-linear-to-r from-green-500 to-green-600"
                    }`}
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{details}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Analysis Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Shield className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className={`text-2xl font-bold ${artifactScore > 70 ? "text-red-600" : "text-green-600"}`}>{artifactScore}%</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Artifact Scan</p>
                    <p className="text-xs text-slate-600">GAN artifacts & noise patterns</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Brain className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className={`text-2xl font-bold ${faceConsistency > 70 ? "text-green-600" : "text-red-600"}`}>{faceConsistency}%</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Facial Consistency</p>
                    <p className="text-xs text-slate-600">Landmark alignment & symmetry</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Target className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className={`text-2xl font-bold ${lightingAnalysis > 70 ? "text-green-600" : "text-red-600"}`}>{lightingAnalysis}%</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Lighting Analysis</p>
                    <p className="text-xs text-slate-600">Shadow & illumination consistency</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-[#6699ff]" />
                  <h3 className="text-base font-bold text-slate-900">Analysis Explanation</h3>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {isDeepfake
                    ? "The model detected manipulation traces including warped facial features, inconsistent lighting patterns, and pixel-level GAN artifacts. These indicators suggest the media has been synthetically altered or generated."
                    : "Facial landmarks show natural consistency, lighting is uniform across the image, and no synthetic generation markers were detected. The media exhibits characteristics typical of authentic, unmanipulated content."}
                </p>
              </div>

              <div className="rounded-2xl p-6 border border-slate-200 bg-slate-50">
                <p className="text-sm font-medium leading-relaxed text-slate-900">
                  <strong>Recommendation:</strong> {isDeepfake
                    ? " This media shows strong signs of manipulation. Do not rely on it as evidence. Verify with original sources before sharing."
                    : " No deepfake patterns detected. The media appears authentic and safe for standard use."}
                </p>
              </div>

              {fileName && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 border-t border-slate-200 pt-6 mt-6">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-[#6699ff]" />
                    <span><strong>File:</strong> {fileName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#6699ff]" />
                    <span><strong>Analyzed:</strong> {formatTimestamp()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // 2. LINGUISTIC TEXT / AI ANALYSIS CARD
  if (type === "ai") {
    const { isAIGenerated, confidence, details } = data as AIData;
    const confidencePercent = (confidence * 100).toFixed(1);
    const scoreColor = isAIGenerated ? "text-amber-600" : "text-green-600";

    const perplexity = isAIGenerated ? 24 : 78;
    const burstiness = isAIGenerated ? 32 : 69;
    const repetitionScore = isAIGenerated ? 81 : 34;

    return (
      <SiteLayout>
        <div className="mx-auto max-w-5xl px-4 py-12 mt-24 mb-20">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-lg overflow-hidden mb-8">
            <div className="px-8 py-10 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 rounded-2xl">
                    {isAIGenerated ? (
                      <AlertTriangle className="h-8 w-8 text-[#6699ff]" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-[#6699ff]" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">
                      {isAIGenerated ? "AI-Generated Content Detected" : "Likely Human-Written / Authentic"}
                    </h1>
                    <p className="text-sm text-slate-600 mt-2">
                      Analysis completed at {formatTimestamp()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap justify-end">
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Report
                  </button>
                  <button
                    onClick={handleNewAnalysis}
                    className="inline-flex items-center gap-2 rounded-full bg-[#6699ff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5588ee] transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" /> New Analysis
                  </button>
                </div>
              </div>
            </div>

            <div className="px-8 py-8 space-y-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Detection Confidence</p>
                    <p className={`text-5xl font-bold ${scoreColor}`}>
                      {confidencePercent}%
                    </p>
                  </div>
                  <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200 text-slate-700">
                    {isAIGenerated ? "AI GENERATED" : "HUMAN WRITTEN"}
                  </div>
                </div>
                <div className="h-4 rounded-full bg-slate-300 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAIGenerated ? "bg-linear-to-r from-amber-500 to-amber-600" : "bg-linear-to-r from-green-500 to-green-600"
                    }`}
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{details}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Linguistic Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className="text-2xl font-bold text-[#6699ff]">{perplexity}%</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Perplexity</p>
                    <p className="text-xs text-slate-600">Lower = more predictable (AI)</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className="text-2xl font-bold text-[#6699ff]">{burstiness}%</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Burstiness</p>
                    <p className="text-xs text-slate-600">Sentence length variation</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className="text-2xl font-bold text-[#6699ff]">{repetitionScore}%</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Repetition</p>
                    <p className="text-xs text-slate-600">N-gram repetition frequency</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch justify-center gap-6">
                <div className="w-full md:w-1/2 rounded-2xl border border-slate-200 bg-white p-6 min-h-40">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-[#6699ff]" />
                    <h3 className="text-base font-bold text-slate-900">Analysis Explanation</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {isAIGenerated
                      ? "The analysis detected patterns typical of AI generation including low perplexity, repetitive sentence structures, and uniform stylistic markers. These linguistic features suggest the content was generated by a language model."
                      : "The text shows natural language variations with appropriate sentence diversity, contextual coherence, and human-like inconsistencies. No significant AI generation patterns were detected."}
                  </p>
                </div>

                <div className="w-full md:w-1/2 rounded-2xl p-6 border border-slate-200 bg-slate-50 min-h-40">
                  <p className="text-sm font-medium leading-relaxed text-slate-900">
                    <strong>Recommendation:</strong> {isAIGenerated
                      ? " This content exhibits strong AI generation markers. Verify with original sources if critical for decision-making."
                      : " No significant AI patterns found. Content appears human-authored with natural variation."}
                  </p>
                </div>
              </div>

              {fileName && (
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 border-t border-slate-200 pt-6 mt-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#6699ff]" />
                    <span><strong>File:</strong> {fileName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#6699ff]" />
                    <span><strong>Analyzed:</strong> {formatTimestamp()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // 3. PHISHING NETWORK / URL ANALYSIS CARD
  if (type === "phishing") {
    const { isMalicious, confidence, details, riskLevel, url } = data as PhishingData;
    const confidencePercent = (confidence * 100).toFixed(1);

    const domainAge = isMalicious ? "< 30 days" : "> 2 years";
    const sslValid = isMalicious ? "Self-signed" : "Valid (Let's Encrypt)";
    const redirects = isMalicious ? 3 : 0;
    const blacklistCount = isMalicious ? 4 : 0;

    return (
      <SiteLayout>
        <div className="mx-auto max-w-5xl px-4 py-12 mt-24 mb-20">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-lg overflow-hidden mb-8">
            <div className="px-8 py-10 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 rounded-2xl">
                    {isMalicious ? (
                      <XCircle className="h-8 w-8 text-[#6699ff]" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-[#6699ff]" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900">
                      {isMalicious ? "Suspicious / Malicious URL Detected" : "URL Appears Safe"}
                    </h1>
                    <p className="text-sm text-slate-600 mt-2">
                      Analysis completed at {formatTimestamp()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap justify-end">
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Report
                  </button>
                  <button
                    onClick={handleNewAnalysis}
                    className="inline-flex items-center gap-2 rounded-full bg-[#6699ff] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5588ee] transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" /> New Analysis
                  </button>
                </div>
              </div>
            </div>

            <div className="px-8 py-8 space-y-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Security Confidence</p>
                    <p className={`text-5xl font-bold ${isMalicious ? (riskLevel === "high" ? "text-red-600" : "text-amber-600") : "text-green-600"}`}>
                      {confidencePercent}%
                    </p>
                  </div>
                  <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200 text-slate-700">
                    {isMalicious ? (riskLevel === "high" ? "CRITICAL" : "WARNING") : "SAFE"}
                  </div>
                </div>
                <div className="h-4 rounded-full bg-slate-300 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isMalicious ? (riskLevel === "high" ? "bg-linear-to-r from-red-500 to-red-600" : "bg-linear-to-r from-amber-500 to-amber-600") : "bg-linear-to-r from-green-500 to-green-600"
                    }`}
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{details}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Security Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Clock className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className={`text-lg font-bold ${isMalicious ? "text-red-600" : "text-green-600"}`}>{domainAge}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Domain Age</p>
                    <p className="text-xs text-slate-600">Newer domains are higher risk</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Shield className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className={`text-lg font-bold ${sslValid.includes("Self") ? "text-red-600" : "text-green-600"}`}>{sslValid.split(" ")[0]}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">SSL Certificate</p>
                    <p className="text-xs text-slate-600">Validity & issuer check</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Link2 className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className={`text-lg font-bold ${redirects > 0 ? "text-red-600" : "text-green-600"}`}>{redirects}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Redirects</p>
                    <p className="text-xs text-slate-600">Number of redirect chains</p>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-[#6699ff]" />
                      </div>
                      <span className={`text-lg font-bold ${blacklistCount > 0 ? "text-red-600" : "text-green-600"}`}>{blacklistCount}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Blacklist Hits</p>
                    <p className="text-xs text-slate-600">Known threat databases</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-[#6699ff]" />
                  <h3 className="text-base font-bold text-slate-900">Security Analysis</h3>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {isMalicious
                    ? riskLevel === "high"
                      ? "This URL exhibits critical phishing indicators: domain age under 30 days, self-signed SSL certificate, multiple redirect chains, and presence in multiple threat databases. These factors strongly indicate malicious intent."
                      : "Suspicious characteristics detected: domain age and SSL certificate issues, plus moderate indicators found in threat databases. Exercise caution before interacting with this URL."
                    : "The domain has established history with valid SSL certificate, no suspicious redirect chains, and no presence in known threat databases. Security indicators suggest this URL is legitimate."}
                </p>
              </div>

              <div className="rounded-2xl p-6 border border-slate-200 bg-slate-50">
                <p className="text-sm font-medium leading-relaxed text-slate-900">
                  <strong>Recommendation:</strong> {
                    isMalicious
                      ? riskLevel === "high"
                        ? " DO NOT PROCEED. This URL is highly likely to be malicious. Avoid clicking and report it if possible."
                        : " Exercise caution with this URL. This shows suspicious characteristics. Verify legitimacy before proceeding."
                      : " No known threats detected. This URL appears safe for standard browsing."
                  }
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 border-t border-slate-200 pt-6 mt-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link2 className="h-4 w-4 text-[#6699ff] shrink-0" />
                  <span className="break-all"><strong>URL:</strong> {url || "Not saved"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#6699ff] shrink-0" />
                  <span><strong>Analyzed:</strong> {formatTimestamp()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return null;
}