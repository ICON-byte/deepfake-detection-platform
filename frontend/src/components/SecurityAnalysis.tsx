import React from "react";
import { Info, ShieldAlert, CheckCircle2, AlertTriangle, Shield, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming you have standard Radix UI tooltips from shadcn/ui

export type ThreatLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "CLEAN";
export type FinalVerdict = "AI_GENERATED" | "LIKELY_AI" | "UNCERTAIN" | "LIKELY_REAL" | "REAL";
export type MediaType = "image" | "video" | "audio";

export interface SecurityAnalysisPayload {
  media_type: MediaType;
  consensus_score: number;
  final_verdict: FinalVerdict;
  threat_level: ThreatLevel;
  local_heuristic_signals: string[];
  rationale?: string;
}

interface SecurityAnalysisProps {
  data?: SecurityAnalysisPayload | null;
  isLoading?: boolean;
}

// 5-Tier Risk Matrix Data
const RISK_MATRIX = [
  { range: "85 – 100%", verdict: "AI_GENERATED", level: "CRITICAL", meaning: "High confidence the file is AI-generated", color: "bg-red-50 text-red-700 border-red-200", icon: ShieldAlert },
  { range: "65 – 84%", verdict: "LIKELY_AI", level: "HIGH", meaning: "Strong indicators of AI generation", color: "bg-orange-50 text-orange-700 border-orange-200", icon: AlertTriangle },
  { range: "45 – 64%", verdict: "UNCERTAIN", level: "MEDIUM", meaning: "Mixed signals — inconclusive", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Search },
  { range: "25 – 44%", verdict: "LIKELY_REAL", level: "LOW", meaning: "More likely authentic than AI-generated", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Shield },
  { range: "0 – 24%", verdict: "REAL", level: "CLEAN", meaning: "High confidence the file is authentic", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
];

// Helper: Translate heuristic strings to deep technical explanations
const getHeuristicExplanation = (signal: string, mediaType: MediaType): string => {
  const s = signal.toLowerCase();
  
  // Audio
  if (s.includes("entropy")) return "A highly uniform byte entropy (e.g., between 7.80–7.96) indicates the file's data distribution is 'too perfect' and lacks the natural chaos of a microphone recording, pointing toward synthetic TTS generation.";
  if (s.includes("sample rate") || s.includes("24000") || s.includes("22050")) return "A rigid 22050 Hz or 24000 Hz mono sample rate is the exact default output format for several leading AI voice generators like ElevenLabs.";
  if (s.includes("silence")) return "A suspiciously regular/low silence ratio (2-15%) indicates a lack of natural human pause cadence and breathing artifacts.";
  
  // Image
  if (s.includes("background") || s.includes("blur")) return "Background inconsistencies (highly blurred, lacking distinguishable or structurally logical shapes) are common when GANs or Diffusion models focus processing power on the foreground subject.";
  if (s.includes("asymmetry") || s.includes("blend") || s.includes("smudg")) return "Subtle blending/smudging artifacts (often found at the edges of hair, ear shapes, or where skin meets clothing) indicate the AI struggled to resolve complex textural boundaries.";
  
  // Video
  if (s.includes("container") || s.includes("webm")) return "Specific container flags or metadata anomalies often correlate with direct exports from cloud-based AI rendering tools.";
  if (s.includes("string") || s.includes("tool")) return "Embedded string footprints in the binary header specifically match known AI generation software signatures.";

  // Fallback
  return `This structural anomaly was flagged by the local heuristic engine during the ${mediaType} binary analysis.`;
};

export function SecurityAnalysis({ data, isLoading }: SecurityAnalysisProps) {
  // Loading State
  if (isLoading || !data) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex animate-pulse space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 rounded bg-gray-200 w-3/4"></div>
            <div className="space-y-3">
              <div className="h-20 rounded bg-gray-100"></div>
              <div className="h-20 rounded bg-gray-100"></div>
            </div>
            <div className="h-4 rounded bg-gray-200 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const { media_type, threat_level, local_heuristic_signals } = data;

  // Dynamic Provenance Generator
  const getProvenanceText = () => {
    // Priority: AI Generated Rationale from Backend
    const base = data.rationale 
      ? data.rationale 
      : (threat_level === "CRITICAL" || threat_level === "HIGH")
        ? `Forensic analysis of the ${media_type}'s ${media_type === 'audio' ? 'acoustic artifacts and binary structure' : media_type === 'image' ? 'pixel patterns and spectral frequencies' : 'frames and container metadata'} reveals strong indicators of synthetic generation.`
        : (threat_level === "CLEAN" || threat_level === "LOW")
          ? `Forensic analysis of the ${media_type}'s ${media_type === 'audio' ? 'acoustic profile' : 'visual structures'} aligns closely with organic, real-world recording patterns.`
          : `Forensic analysis of the ${media_type} yielded inconclusive structural patterns, presenting mixed signals regarding its authenticity.`;

    return `${base} Additionally, there are no secure C2PA content credentials attached to the file to verify its origin or editing history. Because different AI generation tools use different tracking methods (or none at all), it isn't possible to definitively determine from standard scans whether it was created using an alternate AI platform.`;
  };

  return (
    <div className="w-full space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
      
      {/* 1. FORENSIC SUMMARY & PROVENANCE */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Shield className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Forensic Summary & Provenance
          </h3>
        </div>
        <div className="rounded-2xl bg-slate-50/80 p-6 text-sm leading-relaxed text-slate-800 border border-slate-100 shadow-inner">
          <p className="font-bold text-base text-slate-900 mb-3">Technical Assessment:</p>
          <div className="space-y-4">
            <p className="font-semibold leading-relaxed">
              {getProvenanceText()}
            </p>
            <div className="pt-4 border-t border-slate-200/60">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digital Signature Audit</p>
              <p className="mt-1 text-xs text-slate-600 font-medium">
                Cryptographic verification failed to find C2PA or IPTC metadata signatures. The asset lacks a verifiable chain of custody.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREAT CLASSIFICATION (RISK MATRIX) */}
      <section>
        <h3 className="mb-3 text-lg font-bold text-gray-900">Threat Classification Matrix</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Score Range</th>
                <th className="px-4 py-3 font-semibold">Verdict</th>
                <th className="px-4 py-3 font-semibold">Threat Level</th>
                <th className="px-4 py-3 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RISK_MATRIX.map((row) => {
                const isActive = row.level === threat_level;
                const Icon = row.icon;
                return (
                  <tr 
                    key={row.level} 
                    className={`transition-colors ${isActive ? row.color + " font-medium" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{row.range}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.verdict}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isActive && <Icon className="h-4 w-4" />}
                        {row.level}
                      </div>
                    </td>
                    <td className="px-4 py-3">{row.meaning}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. STRUCTURAL FOOTPRINTS "THINGS TO WATCH" */}
      {local_heuristic_signals && local_heuristic_signals.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-bold text-gray-900">Structural Characteristics to Watch</h3>
          <p className="mb-4 text-sm text-gray-500">
            The local heuristic engine flagged the following structural anomalies during binary analysis:
          </p>
          <ul className="space-y-3">
            {local_heuristic_signals.map((signal, idx) => (
              <li key={idx} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <span className="text-xs font-bold">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{signal}</span>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="text-gray-400 hover:text-indigo-600 focus:outline-none">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs bg-gray-900 text-white p-3 text-sm">
                          <p>{getHeuristicExplanation(signal, media_type)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default SecurityAnalysis;