import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  accent = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  accent?: "primary" | "secondary" | "success" | "danger";
}) {
  const accentMap = {
    primary: "from-blue-500/20 to-blue-500/0 text-blue-400",
    secondary: "from-violet-500/20 to-violet-500/0 text-violet-400",
    success: "from-green-500/20 to-green-500/0 text-green-400",
    danger: "from-red-500/20 to-red-500/0 text-red-400",
  };
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-5 relative overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-60 pointer-events-none`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
          <Icon className={`w-4 h-4 ${accentMap[accent].split(" ").pop()}`} />
        </div>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {trend && <div className="text-xs text-muted-foreground mt-1">{trend}</div>}
      </div>
    </motion.div>
  );
}
