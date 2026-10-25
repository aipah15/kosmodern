"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

interface AuthHeaderProps {
  onBack?: () => void;
  brandTitle?: string;
  stepIndicator?: string;
  className?: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  onBack,
  brandTitle = "Kost Yusi",
  stepIndicator,
  className = "",
}) => {
  return (
    <div
      className={`w-full flex items-center justify-between pb-3 sm:pb-4 pt-1 ${className}`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white/90 active:scale-95 transition-all shadow-xs border border-slate-200/80 bg-white/70 cursor-pointer"
            aria-label="Kembali ke langkah sebelumnya"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          {/* Logo Squircle with building/box icon */}
          <div className="w-8 h-8 rounded-[11px] bg-[#4f46e5] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 transform transition-transform hover:scale-105">
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-8 4h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-8h2v2H7V6zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm10 4h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-800 tracking-tight">
            {brandTitle}
          </span>
        </div>
      </div>

      {stepIndicator && (
        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/80">
          {stepIndicator}
        </span>
      )}
    </div>
  );
};
