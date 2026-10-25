"use client";

import React, { useState } from "react";
import {
  User,
  Megaphone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

interface AdminHeaderProps {
  ownerName?: string;
  roleTitle?: string;
  showDatePicker?: boolean;
  onOpenAnnouncement?: () => void;
  onDownloadReport?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  ownerName = "Ibu Hj. Ratna Juwita",
  roleTitle = "Pemilik Properti",
  showDatePicker = true,
  onOpenAnnouncement,
  onDownloadReport,
}) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(5); // Juni 2026
  const months = [
    "Januari 2026",
    "Februari 2026",
    "Maret 2026",
    "April 2026",
    "Mei 2026",
    "Juni 2026",
    "Juli 2026",
    "Agustus 2026",
    "September 2026",
    "Oktober 2026",
    "November 2026",
    "Desember 2026",
  ];

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0));
  };

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
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
            aria-label="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 text-xs font-semibold text-slate-800 select-none">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>{months[currentMonthIndex]}</span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
            aria-label="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={onDownloadReport}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-indigo-500" />
          <span>Unduh Rekap (PDF/Excel)</span>
        </button>
        </div>
      )}
    </header>
  );
};
