import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
  className?: string;
}

// Komponen notifikasi pop-up mengambang (Toast)
export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  onClose,
  className,
}) => {
  const typeConfig: Record<
    ToastType,
    { bg: string; border: string; text: string; icon: React.ReactNode }
  > = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-800",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  };

  const current = typeConfig[type];

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300",
        current.bg,
        current.border,
        className
      )}
    >
      {current.icon}
      <span className={cn("text-xs sm:text-sm font-medium", current.text)}>
        {message}
      </span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
