"use client";

import React from "react";
import {
  Wallet,
  Receipt,
  Check,
  Hourglass,
  AlertTriangle,
} from "lucide-react";

export const KpiStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 sm:gap-5">
      
      {/* Card 1: Total Uang Masuk (Span 3 on xl) */}
      <div className="xl:col-span-3 bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06),0_5px_15px_-5px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL UANG MASUK
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Bulan Berjalan (Nov 2026)
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 leading-none">
            <span className="text-lg font-bold text-slate-800 mr-1.5">Rp</span>
            8.850.000
          </div>
        </div>
      </div>

      {/* Card 2: Total Tunggakan (Span 3 on xl) */}
      <div className="xl:col-span-3 bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06),0_5px_15px_-5px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL TUNGGAKAN
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Belum diselesaikan
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-rose-600 leading-none">
            <span className="text-lg font-bold text-rose-600 mr-1.5">Rp</span>
            2.700.000
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold">
            <AlertTriangle className="w-3 h-3" />
            <span>2 Kamar Belum Selesai</span>
          </div>
        </div>
      </div>

      {/* Card 3: Distribusi Pembayaran Penghuni (Span 6 on xl) */}
      <div className="xl:col-span-6 bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06),0_5px_15px_-5px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              STATUS PENAGIHAN KAMAR
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Distribusi Pembayaran Penghuni
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            24 Penghuni Aktif
          </span>
        </div>

        {/* 4 Status Mini-boxes matching Image */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Lunas */}
          <div className="bg-[#f0fdf4] rounded-2xl p-3 border border-emerald-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[10px] font-bold tracking-wide">LUNAS</span>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-emerald-700 block leading-tight">
                2
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                Penghuni
              </span>
            </div>
          </div>

          {/* Verifikasi */}
          <div className="bg-[#fffbeb] rounded-2xl p-3 border border-amber-200/80 flex flex-col justify-between relative">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[10px] font-bold tracking-wide">VERIFIKASI</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-amber-700 block leading-tight">
                4 Bukti
              </span>
              <span className="text-[10px] text-amber-600 font-medium">
                Perlu persetujuan
              </span>
            </div>
          </div>

          {/* Belum Bayar */}
          <div className="bg-[#f0f9ff] rounded-2xl p-3 border border-sky-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-sky-800">
              <span className="text-[10px] font-bold tracking-wide">BELUM BAYAR</span>
              <Hourglass className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-sky-700 block leading-tight">
                1
              </span>
              <span className="text-[10px] text-sky-600 font-medium">
                Jatuh tempo &gt;3 hari
              </span>
            </div>
          </div>

          {/* Terlambat */}
          <div className="bg-[#fff1f2] rounded-2xl p-3 border border-rose-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-[10px] font-bold tracking-wide">TERLAMBAT !</span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-rose-700 block leading-tight">
                1
              </span>
              <span className="text-[10px] text-rose-600 font-medium">
                Denda berjalan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
