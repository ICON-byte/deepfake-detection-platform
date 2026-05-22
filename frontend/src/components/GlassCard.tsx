import { ReactNode } from "react";
import { motion } from "framer-motion";

export function GlassCard({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const Comp: any = hover ? motion.div : "div";
  const motionProps = hover
    ? { whileHover: { y: -4, transition: { duration: 0.2 } } }
    : {};
  return (
    <Comp {...motionProps} className={`glass rounded-2xl p-6 ${className}`}>
      {children}
    </Comp>
  );
}
