import React from "react";
import { cn } from "@/lib/utils/cn";

// Pilihan warna badge status
export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
}

// Komponen badge label penanda status
export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  ...props
}) => {
  // Gaya warna badge
  const variantStyles: Record<BadgeVariant, { bg: string; dotBg: string }> = {
    success: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotBg: "bg-emerald-500",
    },
    warning: {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      dotBg: "bg-amber-500",
    },
    danger: {
      bg: "bg-rose-50 text-rose-700 border-rose-200",
      dotBg: "bg-rose-500",
    },
    info: {
      bg: "bg-blue-50 text-blue-700 border-blue-200",
      dotBg: "bg-blue-500",
    },
    neutral: {
      bg: "bg-slate-100 text-slate-700 border-slate-200",
      dotBg: "bg-slate-500",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        variantStyles[variant].bg,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            variantStyles[variant].dotBg
          )}
        />
      )}
      {children}
    </span>
  );
};
