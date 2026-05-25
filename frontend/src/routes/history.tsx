import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Image as ImageIcon, Video, Music, Loader2 } from "lucide-react";
import { requireAuth } from '@/utils/routeGuard';
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/axiosClient";

export const Route = createFileRoute("/history")({ 
  beforeLoad: ({ location }) => requireAuth(location),
  component: HistoryPage 
});

// Explicit structure match for your Node/MongoDB ScanHistory documents
interface MongoScanRecord {
  _id: string;
  userId: string;
  fileName: string;
  s3Url: string;
  s3Key: string;
  confidenceScore: number;
  status: "Authentic" | "Manipulated";
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

  // Helper utility to resolve file icon graphics from string structures
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) return Video;
    if (['mp3', 'wav', 'aac', 'ogg'].includes(ext || '')) return Music;
    return ImageIcon;
  };

  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
          <span>History</span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Scan <span className="gradient-text">History</span>
        </h1>
        <p className="text-gray-400 text-sm mb-6">Browse and revisit all your past detections.</p>

        <div className="glass-card mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#6699FF]/50"
              />
            </div>
            <select
              aria-label="Filter by status verdict"
              value={filter}
              onChange={(e) => { setFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#6699FF]/50"
            >
              <option value="all">All verdicts</option>
              <option value="Authentic">Authentic only</option>
              <option value="Manipulated">Manipulated only</option>
            </select>
            <select
              aria-label="Sort configuration settings"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#6699FF]/50"
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
              <p className="text-sm">Retrieving analysis history from server...</p>
            </div>
          ) : isError ? (
            <div className="text-center text-sm text-red-400 py-10 bg-red-500/5 border border-red-500/10 rounded-xl">
              Failed to connect to authentication services. Please verify session status.
            </div>
          ) : (
            slice.map((s) => {
              const Icon = getFileIcon(s.fileName);
              const formattedDate = new Date(s.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
              });
              
              return (
                <div key={s._id} className="glass-card flex items-center gap-4 py-4">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{s.fileName}</div>
                    <div className="text-xs text-gray-400">{formattedDate}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        s.status === "Manipulated"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {s.status === "Manipulated" ? "Fake" : "Real"}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">{s.confidenceScore}% confidence</div>
                  </div>
                </div>
              );
            })
          )}
          
          {!isLoading && !isError && slice.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-10">No results found.</div>
          )}
        </div>

        {!isLoading && !isError && slice.length > 0 && (
          <div className="flex items-center justify-between mt-6 text-sm">
            <div className="text-gray-400">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                aria-label="Previous page"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-black/40 border border-white/10 hover:border-[#6699FF]/30 disabled:opacity-40"
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                aria-label="Next page"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-black/40 border border-white/10 hover:border-[#6699FF]/30 disabled:opacity-40"
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