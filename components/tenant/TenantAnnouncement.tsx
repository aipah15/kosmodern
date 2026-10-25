"use client";

import React, { useState } from "react";
import { Megaphone, X, Calendar, UserCheck } from "lucide-react";

interface TenantAnnouncementProps {
  initialVisible?: boolean;
}

export const TenantAnnouncement: React.FC<TenantAnnouncementProps> = ({
  initialVisible = true,
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [showDetailModal, setShowDetailModal] = useState(false);

  if (!isVisible) return null;

  return (
    <>
      <div className="w-full mb-4 bg-white/95 rounded-2xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-indigo-100/70 flex items-start gap-3 transition-all">
        {/* Megaphone Icon */}
        <div className="w-9 h-9 rounded-xl bg-[#eeeffe] text-[#4f46e5] flex items-center justify-center shrink-0 mt-0.5">
          <Megaphone className="w-4 h-4 fill-current rotate-[-12deg]" />
        </div>

        {/* Content */}
        <div
          className="flex-1 cursor-pointer"
          onClick={() => setShowDetailModal(true)}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] tracking-wider uppercase">
              PENGUMUMAN KOS
            </span>
            <span className="text-[10px] text-slate-400 font-normal mr-1">
              Hari Ini
            </span>
          </div>

          <p className="text-xs text-slate-700 font-semibold leading-relaxed line-clamp-2">
            Ibu Hj. Ratna Juwita: Pembersihan toren air bersih hari Sabtu pk 09:00 WIB. Mohon...
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0 cursor-pointer"
          title="Tutup Pengumuman"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Full Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                  <Megaphone className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pengumuman Kos</h3>
                  <p className="text-[10px] text-slate-400">Kost Yusi Management</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-[#4f46e5]" />
                <span>Pengirim: <strong>Ibu Hj. Ratna Juwita (Pemilik)</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#4f46e5]" />
                <span>Jadwal: <strong>Sabtu, pk 09:00 - 12:00 WIB</strong></span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/60 text-xs text-slate-700 leading-relaxed font-normal">
                Selamat pagi adik-adik penghuni Kost Yusi. Diberitahukan bahwa pada hari Sabtu ini akan dilakukan pengurasan dan pembersihan toren air bersih berkala. Aliran air akan dihentikan sementara dari pukul 09:00 hingga 12:00 WIB. Mohon untuk menampung air bersih secukupnya di ember kamar masing-masing. Terima kasih atas pengertian dan kerjasamanya.
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="w-full py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
