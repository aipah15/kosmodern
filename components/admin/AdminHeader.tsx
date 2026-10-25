"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Megaphone,
  Calendar,
  Download,
} from "lucide-react";

import { DEFAULT_PROPERTY } from "@/lib/constants";

interface AdminHeaderProps {
  ownerName?: string;
  roleTitle?: string;
  showDatePicker?: boolean;
  onOpenAnnouncement?: () => void;
  onDownloadReport?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  ownerName = DEFAULT_PROPERTY.ownerName,
  roleTitle = DEFAULT_PROPERTY.ownerRole,
  showDatePicker = true,
  onOpenAnnouncement,
  onDownloadReport,
}) => {
  const [currentMonthLabel, setCurrentMonthLabel] = useState("");
  useEffect(() => {
    setCurrentMonthLabel(
      new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    );
  }, []);
  return (
    <header className="w-full space-y-4">
      {/* Top Profile & Action Bar matching Image 1 */}
      <div className="w-full flex items-center justify-between">
        {/* Owner Profile */}
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              {ownerName}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block">
              {roleTitle}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#4f46e5] text-white flex items-center justify-center shadow-xs">
            <User className="w-4 h-4" />
          </div>
        </div>

        {/* Buat Pengumuman Button */}
        <button
          type="button"
          onClick={onOpenAnnouncement}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span>Buat Pengumuman</span>
        </button>
      </div>

      {/* Date Filter & Export Row (only when showDatePicker is true) */}
      {showDatePicker && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Month Selector Pill */}
          <div className="flex items-center bg-white border border-slate-200/80 rounded-2xl px-2 py-1 shadow-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-800 select-none">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{currentMonthLabel}</span>
            </div>
          </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={onDownloadReport}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-indigo-500" />
          <span>Unduh Rekap (CSV)</span>
        </button>
        </div>
      )}
    </header>
  );
};
