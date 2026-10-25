"use client";

import React from "react";

interface ServiceShortcutsGridProps {
  onShortcutClick: (shortcutId: "riwayat" | "rusak" | "barang" | "kulkas") => void;
}

export const ServiceShortcutsGrid: React.FC<ServiceShortcutsGridProps> = ({
  onShortcutClick,
}) => {
  return (
    <div className="w-full mb-8">
      {/* Section Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-3">
        Pintasan Layanan Kos
      </h3>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Riwayat Bayar */}
        <div
          onClick={() => onShortcutClick("riwayat")}
          className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-2xs hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#eeeffe] text-[#4f46e5] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              {/* Receipt / Invoice Document Icon */}
              <svg
                className="w-5 h-5 text-[#4f46e5]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                <path d="M8 7h8" />
                <path d="M8 11h8" />
                <path d="M8 15h4" />
              </svg>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              Riwayat Bayar
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 font-normal">
              Riwayat pembayaran penghuni setiap bulan
            </p>
          </div>
        </div>

        {/* Card 2: Lapor Rusak */}
        <div
          onClick={() => onShortcutClick("rusak")}
          className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-2xs hover:shadow-md hover:border-rose-100 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              {/* Toolbox / Repair Icon */}
              <svg
                className="w-5 h-5 text-rose-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                <circle cx="12" cy="12" r="1.5" />
              </svg>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              Lapor Rusak
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 font-normal">
              AC, air bocor, lampu mati & WiFi
            </p>
          </div>
        </div>

        {/* Card 3: Barang Luar */}
        <div
          onClick={() => onShortcutClick("barang")}
          className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-2xs hover:shadow-md hover:border-purple-100 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              {/* Storage / Box Archive Icon */}
              <svg
                className="w-5 h-5 text-purple-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              Barang Luar
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 font-normal">
              Registrasi rak sepatu & gantungan jemuran
            </p>
          </div>
        </div>

        {/* Card 4: Kulkas Bersama */}
        <div
          onClick={() => onShortcutClick("kulkas")}
          className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-2xs hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              {/* Refrigerator Icon exact to screenshot */}
              <svg
                className="w-5 h-5 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <line x1="5" y1="10" x2="19" y2="10" />
                <line x1="8" y1="5" x2="8" y2="8" />
                <line x1="8" y1="13" x2="8" y2="16" />
              </svg>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              Kulkas Bersama
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 font-normal">
              Label stiker nama & cek masa simpan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
