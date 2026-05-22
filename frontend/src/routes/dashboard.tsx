import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Upload,
  History,
  User,
  Loader2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { requireAuth } from "@/utils/routeGuard";
import { useAuth } from "@/contexts/AuthContext";

// Mock data – replace with real API calls later
const chartData = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  scans: Math.round(20 + Math.random() * 80),
  fakes: Math.round(2 + Math.random() * 18),
}));

const recentScans = [
  { name: "press-photo-01.jpg", verdict: "Real", confidence: 96, date: "2m ago" },
  { name: "campaign-clip.mp4", verdict: "Fake", confidence: 89, date: "1h ago" },
  { name: "voicenote.mp3", verdict: "Real", confidence: 92, date: "3h ago" },
  { name: "leaked-img.webp", verdict: "Fake", confidence: 81, date: "Yesterday" },
];

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => requireAuth(location),
  component: Dashboard,
});

function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <PageShell>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6699FF]" />
        </div>
      </PageShell>
    );
  }

  // Calculate remaining scans (example: assume monthly quota = 100)
  const MAX_QUOTA = 100;
  const scansRemaining = user ? Math.max(0, MAX_QUOTA - user.quota_used) : 0;
  const isUnlimited = false; // change if user has unlimited plan

  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
              <span>Dashboard</span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Welcome back,{" "}
              <span className="gradient-text">
                {user?.username || "Analyst"}
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Here's your detection activity overview.
            </p>
            <div className="text-sm text-gray-400 mt-2">
              Scans remaining:{" "}
              {isUnlimited
                ? "∞"
                : scansRemaining}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/pricing" className="btn-outline">
              Upgrade Plan
            </Link>
            <Link to="/history" className="btn-outline">
              <History className="w-4 h-4" /> History
            </Link>
            <Link to="/detect" className="btn-primary">
              <Upload className="w-4 h-4" /> New Scan
            </Link>
          </div>
        </div>

        {/* Stats Cards – replace with real data from backend */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="glass-card">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <FileSearch className="w-4 h-4 text-[#6699FF]" />
              <span className="text-xs uppercase tracking-wider">Total Scans</span>
            </div>
            <div className="text-2xl font-bold text-white">1,284</div>
          </div>
          <div className="glass-card">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <AlertTriangle className="w-4 h-4 text-[#F7941D]" />
              <span className="text-xs uppercase tracking-wider">Fake Detections</span>
            </div>
            <div className="text-2xl font-bold text-white">217</div>
          </div>
          <div className="glass-card">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs uppercase tracking-wider">Authentic</span>
            </div>
            <div className="text-2xl font-bold text-white">1,067</div>
          </div>
          <div className="glass-card">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Activity className="w-4 h-4 text-[#6699FF]" />
              <span className="text-xs uppercase tracking-wider">Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-white">99.2%</div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Chart */}
          <div className="glass-card lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Detection Activity</h3>
              <span className="text-xs text-gray-400">Last 14 days</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6699FF" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#6699FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F7941D" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#F7941D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#000000",
                      border: "1px solid rgba(102, 153, 255, 0.3)",
                      borderRadius: 8,
                      color: "#ffffff",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#6699FF"
                    fill="url(#g1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="fakes"
                    stroke="#F7941D"
                    fill="url(#g2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/detect"
                className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#6699FF]/30 transition"
              >
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">New Detection</div>
                  <div className="text-xs text-gray-400">Scan a new file</div>
                </div>
              </Link>
              <Link
                to="/history"
                className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#6699FF]/30 transition"
              >
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">View History</div>
                  <div className="text-xs text-gray-400">Past detections</div>
                </div>
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#6699FF]/30 transition"
              >
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Account</div>
                  <div className="text-xs text-gray-400">Settings & profile</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Scans Table */}
          <div className="glass-card lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Recent Scans</h3>
              <Link
                to="/history"
                className="text-xs text-gray-400 hover:text-[#6699FF] transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-400 uppercase tracking-wider">
                  <tr className="text-left">
                    <th className="py-2 px-2">File</th>
                    <th className="py-2 px-2">Verdict</th>
                    <th className="py-2 px-2">Confidence</th>
                    <th className="py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map((r) => (
                    <tr key={r.name} className="border-t border-white/5">
                      <td className="py-3 px-2 font-medium text-white">{r.name}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            r.verdict === "Fake"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {r.verdict}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-white">{r.confidence}%</td>
                      <td className="py-3 px-2 text-gray-400">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}