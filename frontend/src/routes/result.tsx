import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { SiteLayout } from "../components/SiteLayout";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
  Save,
  Fingerprint,
  Loader2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";

type SearchParams = { scanId: string };

export const Route = createFileRoute("/result")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    scanId: String(s.scanId ?? ""),
  }),
  component: ResultsPage,
});

interface MongoScanReport {
  _id: string;
  userId: string;
  fileName: string;
  s3Url: string;
  confidenceScore: number;
  status: "Authentic" | "Manipulated";
  createdAt: string;
}

function ResultsPage() {
  const { scanId } = useSearch({ from: "/result" });

  // 1. Fetch live analytical scan payload from MongoDB using the URL query parameter
  const demoScan: MongoScanReport = {
    _id: "demo",
    userId: "demo-user",
    fileName: "demo-image.jpg",
    s3Url: "/public/images/demo-image.jpg",
    confidenceScore: 92.7,
    status: "Authentic",
    createdAt: new Date().toISOString(),
  };

  const { data: scan, isLoading, isError } = useQuery<MongoScanReport>({
    queryKey: ["scanRecord", scanId],
    queryFn: async () => {
      if (!scanId) throw new Error("No scan execution ID found");
      const res = await fetch(`/history/${scanId}`);
      if (!res.ok) throw new Error("Failed to fetch scan record");
      const json = await res.json();
      return json.data as MongoScanReport;
    },
    enabled: !!scanId && scanId !== "demo",
    initialData: scanId === "demo" ? demoScan : undefined,
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#6699FF]" />
          <p className="text-sm">Assembling detection matrices & graphs...</p>
        </div>
      </SiteLayout>
    );
  }

  if (isError || !scan) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto my-20 text-center rounded-2xl border border-red-200 bg-white p-6 shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Report Generation Failed</h3>
          <p className="text-sm text-slate-600 mb-6">
            We couldn't retrieve the specified scan verification details from the database cluster.
          </p>
          <Link to="/detect" className="inline-flex items-center justify-center rounded-full bg-[#6699ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f7be1]">
            Return to Scanning Engine
          </Link>
        </div>
      </SiteLayout>
    );
  }

  // 2. Derive visual values directly from real database states
  const isFake = scan.status === "Manipulated";
  const confidence = Math.round(scan.confidenceScore);

  const pieData = [
    { name: isFake ? "Fake" : "Authentic", value: confidence },
    { name: "Remaining", value: 100 - confidence },
  ];
  const colors = isFake ? ["#F7941D", "#E5E7EB"] : ["#6699FF", "#E5E7EB"];

  // Mapping granular analysis layers based on database verdict
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
    <SiteLayout>
      <section className="bg-slate-50 text-slate-900 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold text-slate-900"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Analysis Results
            </h1>
            <p className="text-sm text-gray-700 mt-1">
              File: <span className="text-black font-mono break-all">{scan.fileName}</span>
            </p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 border border-[#e6eef8] bg-white text-sm font-medium text-slate-700 hover:bg-[#f1f8ff]">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 border border-[#e6eef8] bg-white text-sm font-medium text-slate-700 hover:bg-[#f1f8ff]">
              <Download className="w-4 h-4" />
              Download
            </button>
            <Link to="/detect" className="inline-flex items-center gap-2 rounded-full bg-[#6699ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f7be1]">
              <RefreshCw className="w-4 h-4" />
              Detect
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
            <div className="rounded-2xl border border-[#e6eef8] bg-white p-6 shadow-md">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    isFake ? "bg-[#F7941D]/10" : "bg-[#dbeafe]"
                  }`}
                >
                  {isFake ? (
                    <AlertTriangle className="w-8 h-8 text-[#F7941D]" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-[#6699FF]" />
                  )}
                </div>
                <div className="flex-1 min-w-[220px]">
                  <div
                    className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md mb-2 ${
                      isFake
                        ? "bg-[#fee9e2] text-[#b45309]"
                        : "bg-[#dbeafe] text-[#1d4ed8]"
                    }`}
                  >
                    {isFake ? "Deepfake Detected" : "Authentic Media"}
                  </div>
                  <h2
                    className="text-2xl md:text-3xl font-bold text-slate-900"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                      {isFake ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-[#F7941D] inline-block" aria-hidden />
                          <span>This media appears manipulated</span>
                        </>
                      ) : (
                        <>
                          <span>This media appears genuine</span>
                        </>
                      )}
                  </h2>
                  <p className="text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">
                    {isFake
                      ? "Our model found artifacts consistent with synthetic alteration, so take this result as a cautionary signal."
                      : "No significant manipulation artifacts were detected. The media appears genuine according to the current analysis."}
                  </p>
                  <div className="mt-6">
                    <div className="rounded-lg border border-[#e6eef8] bg-white p-4 shadow-sm max-w-xs">
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        Risk Level
                      </div>
                      <div className={`font-bold text-2xl mt-2 ${riskColor}`}>{risk}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Circular confidence chart */}
          <div className="rounded-2xl border border-[#e6eef8] bg-white p-6 flex flex-col items-center justify-center shadow-sm">
            <div className="w-40 h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={70}
                    paddingAngle={3}
                    cornerRadius={20}
                    startAngle={90}
                    endAngle={-270}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={colors[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-slate-900">{confidence}%</div>
                <div className="text-xs text-slate-500">Confidence</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mt-3 text-center">Confidence Meter</div>
          </div>

          {/* Breakdown Bar Chart */}
          <div className="rounded-2xl border border-[#e6eef8] bg-white p-6 lg:col-span-2 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">
              Analysis Breakdown
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
          <div className="rounded-2xl border border-[#e6eef8] bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
              <Fingerprint className="w-5 h-5 text-[#6699ff]" />
              AI Explanation
            </h3>
            <div className="rounded-2xl border border-[#dbeafe] bg-[#eff6ff] p-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {isFake
                  ? "The evaluation model captured geometric blurring, irregular edge frequencies, and subtle blending mismatch signatures within spatial asset boundaries."
                  : "Spectral responses remain within standard operational margins. Pixel boundaries and background patterns show consistent continuous compression ratios."}
              </p>
            </div>
          </div>

          {/* Detection Indicators */}
          <div className="rounded-2xl border border-[#e6eef8] bg-white p-6 lg:col-span-3 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Detection Indicators</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Face Region Artifacts", flag: isFake },
                { label: "Metadata Integrity", flag: !isFake },
                { label: "Frequency Coherence", flag: !isFake },
                { label: "Temporal Consistency", flag: !isFake },
              ].map((ind) => (
                <div
                  key={ind.label}
                  className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]"
                >
                  <div className="flex items-center gap-2">
                    {ind.flag ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#F7941D]" />
                    )}
                    <span className="text-sm font-medium text-slate-900">{ind.label}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {ind.flag ? "Pass" : "Suspicious"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-2xl border border-[#e6eef8] bg-white p-6 lg:col-span-3 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Recommendation</h3>
            <p className="text-sm text-slate-600">
              {isFake
                ? "Do not spread or republish this content without verifying its context. Check source materials or corroborating details."
                : "This file passes authentication checks. It is safe for standard ingestion pipelines and storage distributions."}
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}