import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import {
  History as HistoryIcon,
  CalendarDays,
  FileText,
  Video,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  RotateCcw,
  Search,
  UploadCloud,
  ChevronRight,
  AlertCircle,
  Volume2
} from "lucide-react";
import React, { useState } from "react";

type DetectionType = "deepfake" | "aigen" | "phishing";
type ResultStatus = "real" | "manipulated" | "suspicious" | "phishing";

interface HistoryItem {
  id: string;
  type: DetectionType;
  mediaName: string;
  date: string; // ISO string from MongoDB
  status: ResultStatus;
  confidence: number; 
  details: string;
  thumbnail?: string; 
}

// 1. Define the Route with a loader to fetch data from MongoDB via your API gateway
export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History · TruthLens" },
      {
        name: "description",
        content: "Review past deepfake, AI-generated content, and phishing analyses.",
      },
      { property: "og:title", content: "TruthLens History" },
      {
        property: "og:description",
        content: "Access your complete analysis history with detailed results.",
      },
    ],
  }),
  loader: async (): Promise<HistoryItem[]> => {
    try {
      // Use absolute URL for SSR compatibility
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      // Pointing directly to your clean history API entrypoint
      const response = await fetch(`${apiUrl}/history`);
      if (!response.ok) {
        throw new Error("Failed to fetch history from database");
      }
      return await response.json();
    } catch (error) {
      console.error("Database connection error:", error);
      return []; // Return empty fallback array on error
    }
  },
  component: HistoryPage,
});

function HistoryPage() {
  // 2. Consume the synchronized server-side data from TanStack router loader
  const initialData = Route.useLoaderData();
  const router = useRouter();

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(initialData);
  const [filterType, setFilterType] = useState<DetectionType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 3. Sync deletions back to the MongoDB collections via API
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this analysis from history?")) {
      try {
        const response = await fetch(`/api/history/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setHistoryItems((prev) => prev.filter((item) => item.id !== id));
          router.invalidate(); // Tell router to refresh data cache
        } else {
          alert("Failed to delete the record from database.");
        }
      } catch (err) {
        console.error("Error communicating with server:", err);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Permanently delete all analysis history from the database? This action cannot be undone.")) {
      try {
        const response = await fetch("/api/history/clear", {
          method: "DELETE",
        });

        if (response.ok) {
          setHistoryItems([]);
          router.invalidate();
        } else {
          alert("Failed to clear database logs.");
        }
      } catch (err) {
        console.error("Error communicating with server:", err);
      }
    }
  };

  const filteredItems = historyItems.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch = item.mediaName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: DetectionType, filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    
    if (type === "deepfake") {
      if (ext && ["mp3", "wav", "m4a", "ogg", "flac"].includes(ext)) {
        return <Volume2 className="h-4 w-4" />;
      }
      if (ext && ["png", "jpg", "jpeg", "webp"].includes(ext)) {
        return <ImageIcon className="h-4 w-4" />;
      }
      return <Video className="h-4 w-4" />;
    }
    
    switch (type) {
      case "aigen":
        return <Sparkles className="h-4 w-4" />;
      case "phishing":
        return <ShieldAlert className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: ResultStatus) => {
    switch (status) {
      case "real":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" /> Authentic
          </span>
        );
      case "manipulated":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
            <XCircle className="h-3 w-3" /> Manipulated
          </span>
        );
      case "suspicious":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
            <AlertTriangle className="h-3 w-3" /> Suspicious
          </span>
        );
      case "phishing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
            <AlertCircle className="h-3 w-3" /> Phishing
          </span>
        );
    }
  };

  const getConfidenceColor = (_confidence: number) => {
    return "text-black dark:text-white";
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateStr));
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <HistoryIcon className="h-3 w-3" /> Complete analysis archive
          </span>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            Analysis <span className="bg-linear-to-r from-[#B23200] to-[#251FBA] bg-clip-text text-transparent">History</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Review past deepfake, AI-generated content, and phishing analyses with detailed results and confidence scores.
          </p>
        </div>

        {/* Filters and actions */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 rounded-full border border-border/70 bg-card p-1">
            <FilterBtn active={filterType === "all"} onClick={() => setFilterType("all")}>All</FilterBtn>
            <FilterBtn active={filterType === "deepfake"} onClick={() => setFilterType("deepfake")}>Deepfake</FilterBtn>
            <FilterBtn active={filterType === "aigen"} onClick={() => setFilterType("aigen")}>AI Content</FilterBtn>
            <FilterBtn active={filterType === "phishing"} onClick={() => setFilterType("phishing")}>Phishing</FilterBtn>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files & URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-full border border-border/70 bg-background pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {historyItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* History list */}
        {filteredItems.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card py-16 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <HistoryIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No analysis history found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {historyItems.length === 0
                ? "Your past analyses will appear here once you start detecting."
                : "No matches for your current filters."}
            </p>
            <Link
              to="/detect"
              className="mt-6 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Start New Analysis <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                        {getTypeIcon(item.type, item.mediaName)}
                      </div>
                      <span className="text-xs font-medium capitalize text-muted-foreground">
                        {item.type === "aigen" ? "AI Content" : item.type}
                      </span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="mt-3 flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="break-all text-sm font-medium">{item.mediaName}</p>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.details}</p>
                </div>

                <div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                    <div className={`font-semibold ${getConfidenceColor(item.confidence)}`}>
                      {item.confidence}% confidence
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/50 pt-3">
                    <button
                      onClick={() => {
                        alert(`Full report for: ${item.mediaName}\n\nType: ${item.type}\nStatus: ${item.status}\nConfidence: ${item.confidence}%\nDetails: ${item.details}`);
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium transition hover:bg-secondary/80"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <Link
                      to="/detect"
                      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-secondary"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Re-analyze
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {historyItems.length > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row">
            <div className="text-sm text-muted-foreground">
              Total analyses: <span className="font-semibold text-foreground">{historyItems.length}</span> | 
              Showing: <span className="font-semibold text-foreground">{filteredItems.length}</span>
            </div>
            <Link
              to="/detect"
              className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <UploadCloud className="h-4 w-4" /> New Analysis
            </Link>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function FilterBtn({
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
      type="button"
      className={`rounded-full px-4 py-1.5 text-xs font-medium transition sm:text-sm ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground/70 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
