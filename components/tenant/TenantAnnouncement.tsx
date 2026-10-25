"use client";

import React, { useState } from "react";
import { Megaphone, X, Calendar, UserCheck } from "lucide-react";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { formatDateIndo, getRelativeTimeIndo } from "@/lib/utils/date";

interface TenantAnnouncementProps {
  initialVisible?: boolean;
}

export const TenantAnnouncement: React.FC<TenantAnnouncementProps> = ({
  initialVisible = true,
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { announcements, owner } = useTenantPortal();

  // Pengumuman yang disematkan lebih dulu, lalu yang terbaru
  const latest =
    [...announcements].sort(
      (a, b) =>
        Number(!!b.is_pinned) - Number(!!a.is_pinned) ||
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    )[0] ?? null;

  if (!isVisible || !latest) return null;

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
              {getRelativeTimeIndo(latest.created_at)}
            </span>
          </div>

          <p className="text-xs text-slate-700 font-semibold leading-relaxed line-clamp-2">
            {latest.title}: {latest.content}
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
                  <p className="text-[10px] text-slate-400">{owner.propertyName} Management</p>
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
                <span>Pengirim: <strong>{latest.created_by || owner.name}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#4f46e5]" />
                <span>Diterbitkan: <strong>{formatDateIndo(latest.created_at)}</strong></span>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/60 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                {latest.content}
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
