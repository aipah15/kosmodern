"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface TenantHeaderProps {
  unreadCount?: number;
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({ unreadCount = 3 }) => {
  const [hasUnread] = useState(unreadCount > 0);

  return (
    <>
      <header className="w-full flex items-center justify-between pt-2 pb-3">
        {/* Brand & Page Name */}
        <div className="flex items-center gap-3">
          {/* App Icon: Soft lavender-indigo rounded square */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#eeeffe] text-[#4f46e5] flex items-center justify-center shadow-xs">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 fill-current"
              viewBox="0 0 24 24"
            >
              {/* Modern Building Icon */}
              <path d="M19 2H9c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 8h2v2H5V8zm0 4h2v2H5v-2zm0 4h2v2H5v-2zm14 4H9v-2h2v-2H9v-2h2v-2H9V8h2V6H9V4h10v16zm-6-12h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-8h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wider text-[#4f46e5] uppercase leading-none mb-0.5">
              KOST YUSI
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">
              Beranda
            </h1>
          </div>
        </div>

        {/* Notification Bell linking directly to /tenant/notifications */}
        <Link
          href="/tenant/notifications"
          className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/90 hover:bg-white border border-slate-200/80 shadow-xs text-slate-700 hover:text-slate-900 transition cursor-pointer active:scale-95"
          aria-label="Lihat Notifikasi"
        >
          <Bell className="w-5 h-5 text-slate-600 stroke-[2]" />
          {hasUnread && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white ring-1 ring-rose-500/20 animate-pulse" />
          )}
        </Link>
      </header>
    </>
  );
};
