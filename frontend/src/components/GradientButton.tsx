import { ReactNode, ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function GradientButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: Props) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  const styles =
    variant === "primary"
      ? "gradient-primary text-white glow-primary hover:opacity-90"
      : "glass text-foreground hover:bg-white/10";
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 ${sizes[size]} ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
