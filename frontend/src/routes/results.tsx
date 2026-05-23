import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, Download, RefreshCw, Save, Brain, Eye, Fingerprint, Activity
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

type Search = { verdict?: "fake" | "real"; confidence?: number; name?: string; type?: string };

export const Route = createFileRoute("/results")({
  // Remove this line: beforeLoad: ({ location }) => requireAuth(location),
  validateSearch: (s: Record<string, unknown>): Search => ({
    verdict: s.verdict === "fake" ? "fake" : "real",
    confidence: Number(s.confidence ?? 87),
    name: String(s.name ?? "media-file"),
    type: String(s.type ?? ""),
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { verdict = "real", confidence = 87, name } = useSearch({ from: "/results" });
  const isFake = verdict === "fake";

  const pieData = [
    { name: isFake ? "Fake" : "Authentic", value: confidence },
    { name: "Uncertainty", value: 100 - confidence },
  ];
  const colors = isFake ? ["#F7941D", "#1f2937"] : ["#6699FF", "#1f2937"];

  const breakdown = [
    { name: "Pixel Analysis", score: isFake ? 82 : 94 },
    { name: "Metadata", score: isFake ? 71 : 96 },
    { name: "Frequency", score: isFake ? 88 : 92 },
    { name: "Compression", score: isFake ? 64 : 89 },
    { name: "Semantic", score: isFake ? 79 : 95 },
  ];

  const risk = isFake ? (confidence > 85 ? "High" : "Medium") : "Low";
  const riskColor = isFake ? (confidence > 85 ? "text-[#F7941D]" : "text-amber-400") : "text-green-400";

  return (
    <PageShell>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
              <span>Detection Report</span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Analysis Results
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              File: <span className="text-white">{name}</span>
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn-outline">
              <Save className="w-4 h-4" /> Save
            </button>
            <button className="btn-outline">
              <Download className="w-4 h-4" /> Download Report
            </button>
            <Link to="/detect" className="btn-primary">
              <RefreshCw className="w-4 h-4" /> Analyze Another
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Verdict Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="glass-card relative overflow-hidden">
              <div
                className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 ${
                  isFake ? "bg-[#F7941D]" : "bg-[#6699FF]"
                }`}
              />
              <div className="relative flex items-start gap-6 flex-wrap">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                    isFake ? "bg-[#F7941D]/20" : "bg-[#6699FF]/20"
                  }`}
                >
                  {isFake ? (
                    <AlertTriangle className="w-10 h-10 text-[#F7941D]" />
                  ) : (
                    <CheckCircle2 className="w-10 h-10 text-[#6699FF]" />
                  )}
                </div>
                <div className="flex-1 min-w-[220px]">
                  <div
                    className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md mb-2 ${
                      isFake
                        ? "bg-[#F7941D]/20 text-[#F7941D]"
                        : "bg-[#6699FF]/20 text-[#6699FF]"
                    }`}
                  >
                    {isFake ? "Deepfake Detected" : "Authentic Media"}
                  </div>
                  <h2
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {isFake
                      ? "This media appears manipulated"
                      : "This media appears genuine"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-2 max-w-xl">
                    {isFake
                      ? "Our ensemble detected significant artifacts consistent with AI-generated or manipulated content. Treat with caution."
                      : "No significant signs of manipulation were found. Pixel patterns, metadata, and frequency signals are consistent with authentic capture."}
                  </p>
                  <div className="mt-4 flex gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        Confidence
                      </div>
                      <div className="font-bold text-lg text-white">{confidence}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">
                        Risk Level
                      </div>
                      <div className={`font-bold text-lg ${riskColor}`}>{risk}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Circular confidence */}
          <div className="glass-card flex flex-col items-center justify-center">
            <div className="w-40 h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={70}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={colors[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-white">{confidence}%</div>
                <div className="text-xs text-gray-400">{isFake ? "Fake" : "Real"}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-3 text-center">Confidence Meter</div>
          </div>

          {/* Breakdown Bar Chart */}
          <div className="glass-card lg:col-span-2">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6699FF]" /> Analysis Breakdown
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} layout="vertical" margin={{ left: 20 }}>
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#000000",
                      border: "1px solid rgba(102, 153, 255, 0.3)",
                      borderRadius: 8,
                      color: "#ffffff",
                    }}
                  />
                  <Bar
                    dataKey="score"
                    radius={[0, 6, 6, 0]}
                    fill={isFake ? "#F7941D" : "#6699FF"}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Explanation */}
          <div className="glass-card">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#6699FF]" /> AI Explanation
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {isFake
                ? "The detector observed inconsistent lighting gradients, irregular frequency-domain residuals around facial regions, and metadata signatures consistent with synthetic generation pipelines."
                : "Spectral, pixel and metadata signals show coherent capture characteristics. No GAN artifacts or temporal inconsistencies were identified."}
            </p>
          </div>

          {/* Detection Indicators */}
          <div className="glass-card lg:col-span-3">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#6699FF]" /> Detection Indicators
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Face Region Artifacts", flag: isFake },
                { label: "Metadata Integrity", flag: !isFake },
                { label: "Frequency Coherence", flag: !isFake },
                { label: "Temporal Consistency", flag: !isFake },
              ].map((ind) => (
                <div
                  key={ind.label}
                  className="bg-black/40 border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2">
                    {ind.flag ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#F7941D]" />
                    )}
                    <span className="text-sm font-medium text-white">{ind.label}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {ind.flag ? "Pass" : "Suspicious"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="glass-card lg:col-span-3">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#6699FF]" /> Recommendation
            </h3>
            <p className="text-sm text-gray-400">
              {isFake
                ? "Do not redistribute this media as authentic. Consult additional forensic tools and verify the source before publication."
                : "This media meets our authenticity threshold. For high-stakes use (legal, journalism), pair with source verification."}
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}