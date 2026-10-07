import React from "react";
import { Zap } from "lucide-react";

interface ProBadgeProps {
  size?: "sm" | "md" | "lg";
  variant?: "crimson" | "amber" | "slate";
  label?: string;
  className?: string;
}

export default function ProBadge({
  size = "sm",
  variant = "crimson",
  label = "PRO",
  className = "",
}: ProBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 font-mono font-bold tracking-wider",
    md: "text-xs px-2.5 py-0.5 font-mono font-bold tracking-wider",
    lg: "text-sm px-3 py-1 font-mono font-black tracking-widest",
  };

  const variantClasses = {
    crimson: "bg-[#AF101A] text-white border border-red-400/40 shadow-sm",
    amber: "bg-amber-400 text-slate-950 border border-amber-300 shadow-sm font-black",
    slate: "bg-[#0d223a] text-[#DFE2EB] border border-[#213145]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full uppercase select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <Zap className={size === "sm" ? "w-2.5 h-2.5 fill-current" : "w-3 h-3 fill-current"} />
      {label}
    </span>
  );
}
