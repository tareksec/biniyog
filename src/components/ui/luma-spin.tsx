import React from "react";
import { cn } from "@/lib/utils";

export interface LumaSpinProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

export function LumaSpin({ size = "md", className, ...props }: LumaSpinProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  return (
    <div
      className={cn("relative flex items-center justify-center text-primary", sizeMap[size], className)}
      role="status"
      aria-label="Loading..."
      {...props}
    >
      {/* First rotating square shadow-inset box */}
      <div className="absolute inset-0 shadow-[inset_0_0_0_2px_currentColor] animate-[luma-spin_2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />

      {/* Second rotating square shadow-inset box with animation-delay offset */}
      <div className="absolute inset-0 shadow-[inset_0_0_0_2px_currentColor] animate-[luma-spin_2s_cubic-bezier(0.65,0,0.35,1)_infinite] [animation-delay:-1s]" />
    </div>
  );
}
