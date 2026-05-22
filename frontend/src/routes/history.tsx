import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Image as ImageIcon, Video, Music } from "lucide-react";
import { requireAuth } from '@/utils/routeGuard';

export const Route = createFileRoute("/history")({ 
  beforeLoad: ({ location }) => requireAuth(location),
  component: HistoryPage 
});

const TYPES = ["image", "video", "audio"] as const;
const RAW = Array.from({ length: 36 }, (_, i) => {
  const t = TYPES[i % 3];
  const fake = Math.random() > 0.6;
  return {
    id: i,
    name: `${t}-sample-${String(i + 1).padStart(3, "0")}.${t === "image" ? "jpg" : t === "video" ? "mp4" : "mp3"}`,
    type: t,
    verdict: fake ? "Fake" : "Real",
    confidence: 70 + Math.round(Math.random() * 29),
    date: `2025-05-${String(((i % 20) + 1)).padStart(2, "0")}`,
  };
});

function HistoryPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "Fake" | "Real">("all");
  const [sort, setSort] = useState<"date" | "confidence">("date");
  const [page, setPage] = useState(1);
  const PER = 8;

  const filtered = useMemo(() => {
    let r = RAW.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
    if (filter !== "all") r = r.filter((x) => x.verdict === filter);
    r = [...r].sort((a, b) => sort === "date" ? b.date.localeCompare(a.date) : b.confidence - a.confidence);
    return r;
  }, [q, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER));
  const slice = filtered.slice((page - 1) * PER, page * PER);

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
              aria-label="Filter by verdict"
              value={filter}
              onChange={(e) => { setFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-[#6699FF]/50"
            >
              <option value="all">All verdicts</option>
              <option value="Real">Real only</option>
              <option value="Fake">Fake only</option>
            </select>
            <select
              aria-label="Sort by"
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
          {slice.map((s) => {
            const Icon = s.type === "image" ? ImageIcon : s.type === "video" ? Video : Music;
            return (
              <div key={s.id} className="glass-card flex items-center gap-4 py-4">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{s.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{s.type} · {s.date}</div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      s.verdict === "Fake"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-green-500/20 text-green-300"
                    }`}
                  >
                    {s.verdict}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">{s.confidence}% confidence</div>
                </div>
              </div>
            );
          })}
          {slice.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-10">No results found.</div>
          )}
        </div>

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
      </section>
    </PageShell>
  );
}