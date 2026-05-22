import { ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow-primary group-hover:scale-105 transition-transform">
        <ShieldCheck className="w-5 h-5 text-white" />
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-base tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            TruthLens<span className="gradient-text"> AI</span>
          </span>
          <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Deepfake Detection</span>
        </div>
      )}
    </Link>
  );
}
