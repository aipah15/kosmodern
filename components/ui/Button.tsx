import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Pilihan gaya tampilan tombol
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Komponen tombol standar dengan varian warna dan ukuran
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    // Definisi gaya berdasarkan variant
    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-[0.98]",
      secondary:
        "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-[0.98]",
      outline:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98]",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 active:scale-[0.98]",
      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20 active:scale-[0.98]",
    };

    // Definisi gaya berdasarkan ukuran
    const sizeStyles: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-4 py-2.5 text-sm rounded-xl gap-2",
      lg: "px-5 py-3 text-base rounded-2xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
