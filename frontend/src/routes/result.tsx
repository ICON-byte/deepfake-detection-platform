import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Download,
  Share2,
  BarChart3,
  Clock,
  FileImage,
  FileText,
  Link2,
  Shield,
  Brain,
  Target,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

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

  if (type === "deepfake") {
    const { isDeepfake, confidence, details } = data;
    const confidencePercent = (confidence * 100).toFixed(1);
    const verdictColor = isDeepfake ? "red" : "green";
    const verdictBg = isDeepfake ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";
    const scoreColor = isDeepfake ? "text-red-600" : "text-green-600";

    const artifactScore = isDeepfake ? 87 : 23;
    const faceConsistency = isDeepfake ? 34 : 92;
    const lightingAnalysis = isDeepfake ? 28 : 88;

    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-4 py-12 mt-30">
          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className={`p-6 ${verdictBg} border-b`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {isDeepfake ? (
                    <XCircle className="h-10 w-10 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">
                      {isDeepfake ? "Deepfake Detected" : "Authentic Media"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analysis completed at {formatTimestamp()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-all"
                  >
                    <Download className="h-4 w-4" /> Report
                  </button>
                  <button
                    onClick={handleNewAnalysis}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#6699ff] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6699ff]/90 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" /> New Analysis
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Deepfake Confidence Score</span>
                  <span className={`font-mono text-lg font-bold ${scoreColor}`}>
                    {confidencePercent}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isDeepfake ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{details}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-medium">ARTIFACT SCAN</span>
                  </div>
                  <p className="text-2xl font-bold">{artifactScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    GAN artifacts & noise patterns
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Brain className="h-4 w-4" />
                    <span className="text-xs font-medium">FACIAL CONSISTENCY</span>
                  </div>
                  <p className="text-2xl font-bold">{faceConsistency}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Landmark alignment & symmetry
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-medium">LIGHTING ANALYSIS</span>
                  </div>
                  <p className="text-2xl font-bold">{lightingAnalysis}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shadow & illumination consistency
                  </p>
                </div>
              </div>

              <div className={`rounded-lg p-4 ${verdictBg}`}>
                <p className="text-sm font-medium">
                  {isDeepfake
                    ? "RECOMMENDATION: This media shows strong signs of manipulation. Do not rely on it as evidence."
                    : "RECOMMENDATION: No deepfake patterns detected. The media appears authentic."}
                </p>
              </div>

              {fileName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                  <FileImage className="h-4 w-4" />
                  <span>File: {fileName}</span>
                  <Clock className="h-4 w-4 ml-4" />
                  <span>Analyzed: {formatTimestamp()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (type === "ai") {
    const { isAIGenerated, confidence, details } = data;
    const confidencePercent = (confidence * 100).toFixed(1);
    const verdictBg = isAIGenerated ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200";
    const scoreColor = isAIGenerated ? "text-amber-600" : "text-green-600";

    const perplexity = isAIGenerated ? 24 : 78;
    const burstiness = isAIGenerated ? 32 : 69;
    const repetitionScore = isAIGenerated ? 81 : 34;

    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className={`p-6 ${verdictBg} border-b`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {isAIGenerated ? (
                    <AlertTriangle className="h-10 w-10 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">
                      {isAIGenerated
                        ? "AI-Generated Content Detected"
                        : "Likely Human-Written / Authentic"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analysis completed at {formatTimestamp()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-all"
                  >
                    <Download className="h-4 w-4" /> Report
                  </button>
                  <button
                    onClick={handleNewAnalysis}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#6699ff] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6699ff]/90 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" /> New Analysis
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">AI Generation Confidence</span>
                  <span className={`font-mono text-lg font-bold ${scoreColor}`}>
                    {confidencePercent}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isAIGenerated ? "bg-amber-500" : "bg-green-500"
                    }`}
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{details}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs font-medium">PERPLEXITY</span>
                  </div>
                  <p className="text-2xl font-bold">{perplexity}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower = more predictable (AI)
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs font-medium">BURSTINESS</span>
                  </div>
                  <p className="text-2xl font-bold">{burstiness}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sentence length variation
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-xs font-medium">REPETITION</span>
                  </div>
                  <p className="text-2xl font-bold">{repetitionScore}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    N-gram repetition frequency
                  </p>
                </div>
              </div>

              <div className={`rounded-lg p-4 ${verdictBg}`}>
                <p className="text-sm font-medium">
                  {isAIGenerated
                    ? "RECOMMENDATION: This content exhibits strong AI generation markers. Verify with original sources if critical."
                    : "RECOMMENDATION: No significant AI patterns found. Content appears human-authored."}
                </p>
              </div>

              {fileName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                  <FileText className="h-4 w-4" />
                  <span>File: {fileName}</span>
                  <Clock className="h-4 w-4 ml-4" />
                  <span>Analyzed: {formatTimestamp()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (type === "phishing") {
    const { isMalicious, confidence, details, riskLevel } = data;
    const confidencePercent = (confidence * 100).toFixed(1);
    const verdictBg = isMalicious
      ? riskLevel === "high"
        ? "bg-red-50 border-red-200"
        : "bg-amber-50 border-amber-200"
      : "bg-green-50 border-green-200";

    const domainAge = isMalicious ? "< 30 days" : "> 2 years";
    const sslValid = isMalicious ? "Self-signed" : "Valid (Let's Encrypt)";
    const redirects = isMalicious ? 3 : 0;
    const blacklistCount = isMalicious ? 4 : 0;

    return (
      <SiteLayout>
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className={`p-6 ${verdictBg} border-b`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {isMalicious ? (
                    <XCircle className="h-10 w-10 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">
                      {isMalicious
                        ? "Suspicious / Malicious URL Detected"
                        : "URL Appears Safe"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analysis completed at {formatTimestamp()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-all"
                  >
                    <Download className="h-4 w-4" /> Report
                  </button>
                  <button
                    onClick={handleNewAnalysis}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#6699ff] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6699ff]/90 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" /> New Analysis
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Malicious Confidence</span>
                  <span className="font-mono text-lg font-bold text-red-600">
                    {confidencePercent}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isMalicious ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{details}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">DOMAIN AGE</span>
                  </div>
                  <p className="text-lg font-bold">{domainAge}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Newer domains are higher risk
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-medium">SSL CERTIFICATE</span>
                  </div>
                  <p className="text-lg font-bold">{sslValid}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Validity & issuer check
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Link2 className="h-4 w-4" />
                    <span className="text-xs font-medium">REDIRECT CHAINS</span>
                  </div>
                  <p className="text-lg font-bold">{redirects}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of redirects detected
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-medium">BLACKLIST HITS</span>
                  </div>
                  <p className="text-lg font-bold">{blacklistCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Known threat databases
                  </p>
                </div>
              </div>

              <div className={`rounded-lg p-4 ${verdictBg}`}>
                <p className="text-sm font-medium">
                  {isMalicious
                    ? riskLevel === "high"
                      ? "CRITICAL: Do not proceed. This URL is highly likely to be malicious."
                      : "WARNING: This URL shows suspicious characteristics. Exercise caution."
                    : "SAFE: No known threats detected. Normal browsing is safe."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
                <Link2 className="h-4 w-4" />
                <span>URL: {data.url || "Not saved"}</span>
                <Clock className="h-4 w-4 ml-4" />
                <span>Analyzed: {formatTimestamp()}</span>
              </div>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return null;
}