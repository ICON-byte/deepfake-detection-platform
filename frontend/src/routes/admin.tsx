import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import {
  LayoutDashboard, Users, Upload, FileBarChart, BarChart3, Settings, ShieldCheck,
  Activity, AlertTriangle, CheckCircle2
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { requireAuth } from '@/utils/routeGuard';

export const Route = createFileRoute("/admin")({ 
  beforeLoad: ({ location }) => requireAuth(location),
  component: Admin 
});

const sidebar = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview" },
  { to: "/admin", icon: Users, label: "Users" },
  { to: "/admin", icon: Upload, label: "Uploads" },
  { to: "/admin", icon: FileBarChart, label: "Reports" },
  { to: "/admin", icon: BarChart3, label: "Analytics" },
  { to: "/admin", icon: Settings, label: "Settings" },
];

const chart = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  users: Math.round(50 + Math.random() * 200),
  scans: Math.round(200 + Math.random() * 600),
}));

const reports = Array.from({ length: 6 }, (_, i) => ({
  id: 1000 + i,
  user: ["ada@ncs.org", "tunde@gov.ng", "amaka@neocloud.io", "yusuf@press.com"][i % 4],
  file: `evidence-${i + 12}.mp4`,
  verdict: i % 3 === 0 ? "Fake" : "Real",
  conf: 75 + Math.round(Math.random() * 24),
  date: `2025-05-${10 + i}`,
}));

function Admin() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="glass-card sticky top-20">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Admin Panel</div>
                <div className="text-xs text-gray-400">TruthLens AI</div>
              </div>
            </div>
            <nav className="space-y-1">
              {sidebar.map((s, i) => (
                <a
                  key={i}
                  href="#"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                    i === 0
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-6 min-w-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-[#6699FF]/30 text-xs font-medium text-gray-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
              <span>Administration</span>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
          </div>

          {/* Stat Cards - simplified, no trend indicators */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="glass-card">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Users className="w-4 h-4 text-[#6699FF]" />
                <span className="text-xs uppercase tracking-wider">Active Users</span>
              </div>
              <div className="text-2xl font-bold text-white">3,482</div>
            </div>
            <div className="glass-card">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Upload className="w-4 h-4 text-[#6699FF]" />
                <span className="text-xs uppercase tracking-wider">Uploads Today</span>
              </div>
              <div className="text-2xl font-bold text-white">912</div>
            </div>
            <div className="glass-card">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#F7941D]" />
                <span className="text-xs uppercase tracking-wider">Fakes Flagged</span>
              </div>
              <div className="text-2xl font-bold text-white">148</div>
            </div>
            <div className="glass-card">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs uppercase tracking-wider">Authentic</span>
              </div>
              <div className="text-2xl font-bold text-white">764</div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#6699FF]" /> Platform Activity
              </h3>
              <span className="text-xs text-gray-400">Year-to-date</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="m" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#000000",
                      border: "1px solid rgba(102, 153, 255, 0.3)",
                      borderRadius: 8,
                      color: "#ffffff",
                    }}
                  />
                  <Bar dataKey="users" fill="#6699FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="scans" fill="#F7941D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Reports Table */}
          <div className="glass-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Recent Reports</h3>
              <a href="#" className="text-xs text-gray-400 hover:text-[#6699FF] transition-colors">
                Export →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-400 uppercase tracking-wider text-left">
                  <tr>
                    <th className="py-2 px-2">ID</th>
                    <th className="py-2 px-2">User</th>
                    <th className="py-2 px-2">File</th>
                    <th className="py-2 px-2">Verdict</th>
                    <th className="py-2 px-2">Confidence</th>
                    <th className="py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="py-3 px-2 text-gray-400">#{r.id}</td>
                      <td className="py-3 px-2 text-white">{r.user}</td>
                      <td className="py-3 px-2 text-white">{r.file}</td>
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
                      <td className="py-3 px-2 text-white">{r.conf}%</td>
                      <td className="py-3 px-2 text-gray-400">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}