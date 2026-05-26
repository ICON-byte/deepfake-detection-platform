import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ScanFace, Image as ImageIcon, Music, Loader2 } from "lucide-react";
import { requireAuth } from '@/utils/routeGuard';
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/axiosClient";

export const Route = createFileRoute("/history")({ 
  beforeLoad: ({ location }) => requireAuth(location),
  component: HistoryPage 
});

// Explicit structure match for your updated Node/MongoDB ScanHistory documents
interface MongoScanRecord {
  _id: string;
  userId: string;
  fileName: string;
  s3Url: string;
  s3Key: string;
  confidenceScore: number;
  status: "Authentic" | "Manipulated";
  detectionMode: "face" | "media" | "audio"; // Updated pipeline mode field
  createdAt: string;
}

function HistoryPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "Manipulated" | "Authentic">("all");
  const [sort, setSort] = useState<"date" | "confidence">("date");
  const [page, setPage] = useState(1);
  const PER = 8;

  // 1. Fetch live historical assets from your running Node/Mongoose server instance
  const { data: rawScans = [], isLoading, isError } = useQuery<MongoScanRecord[]>({
    queryKey: ["scanHistory"],
    queryFn: async () => {
      const response = await api.get("/history");
      return response.data.data;
    },
  });

  // 2. Perform dynamic filtering/sorting computations on your database state payload
  const filtered = useMemo(() => {
    let r = rawScans.filter((x) => x.fileName.toLowerCase().includes(q.toLowerCase()));
    
    if (filter !== "all") {
      r = r.filter((x) => x.status === filter);
    }
    
    r = [...r].sort((a, b) => {
      if (sort === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.confidenceScore - a.confidenceScore;
      }
    });
    
    return r;
  }, [rawScans, q, filter, sort]);

  // 3. Calculate local component split pagination states
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));
  const slice = filtered.slice((page - 1) * PER, page * PER);

  // Helper utility to resolve contextual icons and branding colors from detection pipeline settings
  const getModeBranding = (mode: "face" | "media" | "audio") => {
    switch (mode) {
      case "face":
        return {
          Icon: ScanFace,
          colorClass: "bg-[#6699FF]/10 text-[#6699FF] border-[#6699FF]/20",
          label: "Face Detection"
        };
      case "audio":
        return {
          Icon: Music,
          colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          label: "Audio Forensic"
        };
      default:
        return {
          Icon: ImageIcon,
          colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          label: "Media Alteration"
        };
    }
  };

  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
          <span>History Portal</span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Scan <span className="gradient-text">History</span>
        </h1>
        <p className="text-gray-400 text-sm mb-6">Browse and revisit all your past deepfake analysis logs.</p>

        <div className="glass-card mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search historical files..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#6699FF]/50"
              />
            </div>
            <select
              aria-label="Filter by status verdict"
              value={filter}
              onChange={(e) => { setFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#6699FF]/50 select-custom"
            >
              <option value="all">All verdicts</option>
              <option value="Authentic">Authentic only</option>
              <option value="Manipulated">Manipulated only</option>
            </select>
            <select
              aria-label="Sort configuration settings"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#6699FF]/50 select-custom"
            >
              <option value="date">Sort: Date</option>
              <option value="confidence">Sort: Confidence</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#6699FF]" />
              <p className="text-sm">Retrieving analysis history from database cluster...</p>
            </div>
          ) : isError ? (
            <div className="text-center text-sm text-red-400 py-10 bg-red-500/5 border border-red-500/10 rounded-xl">
              Failed to connect to verification services. Please check your system network session status.
            </div>
          ) : (
            slice.map((s) => {
              const branding = getModeBranding(s.detectionMode || "media");
              const IconComponent = branding.Icon;
              
              const formattedDate = new Date(s.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
              });
              
              return (
                <div key={s._id} className="glass-card flex items-center gap-4 py-4 hover:bg-white/[0.01] transition-colors">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${branding.colorClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-white truncate font-mono">{s.fileName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                        {branding.label}
                      </span>
                      <span className="text-gray-600 text-xs">•</span>
                      <span className="text-xs text-gray-400">{formattedDate}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end flex-shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${
                        s.status === "Manipulated"
                          ? "bg-red-500/10 border border-red-500/20 text-red-400"
                          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {s.status === "Manipulated" ? "FAKE" : "REAL"}
                    </span>
                    <div className="text-[11px] text-gray-500 mt-1 font-mono">{s.confidenceScore}% index</div>
                  </div>
                </div>
              );
            })
          )}
          
          {!isLoading && !isError && slice.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-12 border border-dashed border-white/5 rounded-2xl bg-black/10">
              No previous analytical data traces found matching the current filters.
            </div>
          )}
        </div>

        {!isLoading && !isError && slice.length > 0 && (
          <div className="flex items-center justify-between mt-6 text-xs text-gray-400">
            <div>
              Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                aria-label="Previous page"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-black/40 border border-white/10 hover:border-[#6699FF]/30 transition disabled:opacity-30 disabled:pointer-events-none"
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                aria-label="Next page"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-black/40 border border-white/10 hover:border-[#6699FF]/30 transition disabled:opacity-30 disabled:pointer-events-none"
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}