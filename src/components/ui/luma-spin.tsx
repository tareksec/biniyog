import React from "react";
import { cn } from "@/lib/utils";

export interface LumaSpinProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

export function LumaSpin({ size = "lg", className, ...props }: LumaSpinProps) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <div
      className={cn("relative flex items-center justify-center", sizeMap[size], className)}
      role="status"
      aria-label="Loading..."
      {...props}
    >
      {/* Outer ambient radiant glow */}
      <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl animate-pulse pointer-events-none" />

      {/* Outer soft glow ring */}
      <div className="absolute inset-0 rounded-full bg-primary/10 blur-sm" />

      {/* Luma spinning conical / gradient ring */}
      <svg
        className="h-full w-full animate-spin text-primary"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animationDuration: "1.1s" }}
      >
        <defs>
          <linearGradient id="luma-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="60%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="currentColor"
          strokeWidth="6"
          strokeOpacity="0.12"
        />

        {/* Spinning gradient arc */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="url(#luma-gradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="210"
          strokeDashoffset="60"
        />
      </svg>

      {/* Center glowing dot */}
      <div className="absolute h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_rgba(20,108,67,0.8)] animate-ping opacity-60 pointer-events-none" />
      <div className="absolute h-2 w-2 rounded-full bg-primary shadow-sm pointer-events-none" />
    </div>
  );
}
