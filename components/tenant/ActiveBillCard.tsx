"use client";

import React, { useState } from "react";
import {
  Calendar,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  FileCheck,
} from "lucide-react";

export type BillSimulationState =
  | "belum_bayar"
  | "verifikasi"
  | "lunas"
  | "terlambat";

interface ActiveBillCardProps {
  onPayClick: () => void;
  onReceiptClick?: () => void;
}

export const ActiveBillCard: React.FC<ActiveBillCardProps> = ({
  onPayClick,
  onReceiptClick,
}) => {
  const [simulationState, setSimulationState] =
    useState<BillSimulationState>("belum_bayar");

  return (
    <div className="w-full bg-white rounded-[28px] p-5 sm:p-6 shadow-[0_10px_35px_-10px_rgba(79,70,229,0.08)] border border-slate-100/90 relative overflow-hidden mb-6 transition-all duration-300">
      {/* Background subtle radial gradient accent */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 rounded-full bg-indigo-50/50 pointer-events-none blur-2xl" />

      {/* Top Header Row: TAGIHAN AKTIF + Status Pill */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Amber Dot */}
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              simulationState === "lunas"
                ? "bg-emerald-500"
                : simulationState === "verifikasi"
                ? "bg-blue-500 animate-pulse"
                : simulationState === "terlambat"
                ? "bg-rose-500"
                : "bg-amber-500"
            }`}
          />
          <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">
            TAGIHAN AKTIF
          </span>
        </div>

        {/* Status Pill matching the screenshot */}
        {simulationState === "belum_bayar" && (
          <div className="bg-[#fef9c3] text-[#d97706] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
            <span>Belum Bayar</span>
          </div>
        )}

        {simulationState === "verifikasi" && (
          <div className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" />
            <span>Verifikasi</span>
          </div>
        )}

        {simulationState === "lunas" && (
          <div className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Lunas</span>
          </div>
        )}

        {simulationState === "terlambat" && (
          <div className="bg-rose-50 text-rose-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Terlambat</span>
          </div>
        )}
      </div>

      {/* Periode Sewa Row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">Periode Sewa</span>
        <span className="text-sm font-bold text-slate-900">November 2026</span>
      </div>

      {/* Main Amount */}
      <div className="mb-2">
        <div className="flex items-baseline">
          <span className="text-lg sm:text-xl font-bold text-[#4f46e5] mr-1.5">
            Rp
          </span>
          <span className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight leading-none">
            {simulationState === "terlambat" ? "1.525.000" : "1.500.000"}
          </span>
        </div>
      </div>

      {/* Room Details Subtitle */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-4">
        <svg
          className="w-3.5 h-3.5 text-slate-400 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
        <span>Sewa Kamar B-04 (AC + KM Dalam + TV)</span>
      </div>

      {/* Jatuh Tempo Box */}
      <div className="bg-[#f4f7fd] border border-[#e8edf7] rounded-xl p-3 flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/70 flex items-center justify-center text-slate-400 shrink-0 shadow-2xs">
          <Calendar className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-none">
            {simulationState === "lunas" ? "Tanggal Pembayaran" : "Jatuh Tempo"}
          </span>
          <span className="text-xs font-bold text-slate-800 leading-tight mt-1">
            {simulationState === "lunas"
              ? "25 Oktober 2026 (Lunas)"
              : simulationState === "terlambat"
              ? "1 November 2026 (Lewat 7 Hari)"
              : "1 November 2026"}
          </span>
        </div>
      </div>

      {/* Main CTA Button */}
      {simulationState === "belum_bayar" && (
        <button
          type="button"
          onClick={onPayClick}
          className="w-full py-3.5 px-4 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Bayar Sekarang via VA / QRIS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {simulationState === "verifikasi" && (
        <button
          type="button"
          onClick={onPayClick}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          <span>Bukti Pembayaran Sedang Diverifikasi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {simulationState === "lunas" && (
        <button
          type="button"
          onClick={onReceiptClick || onPayClick}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
          <span>Lihat Kuitansi Resmi Kost</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {simulationState === "terlambat" && (
        <button
          type="button"
          onClick={onPayClick}
          className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Bayar Sekarang Termasuk Denda</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* Simulasi Pill Switcher below button */}
      <div className="flex items-center justify-center gap-1.5 mt-3.5 pt-2 text-[11px] text-slate-400">
        <span className="font-normal text-[11px] text-slate-400 mr-0.5">
          Simulasi:
        </span>
        <button
          type="button"
          onClick={() => setSimulationState("belum_bayar")}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer ${
            simulationState === "belum_bayar"
              ? "bg-slate-200/90 text-slate-800 font-semibold shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          Belum Bayar
        </button>

        <button
          type="button"
          onClick={() => setSimulationState("verifikasi")}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer ${
            simulationState === "verifikasi"
              ? "bg-blue-100 text-blue-800 font-semibold shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          Verifikasi
        </button>

        <button
          type="button"
          onClick={() => setSimulationState("lunas")}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer ${
            simulationState === "lunas"
              ? "bg-emerald-100 text-emerald-800 font-semibold shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          Lunas
        </button>

        <button
          type="button"
          onClick={() => setSimulationState("terlambat")}
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition cursor-pointer ${
            simulationState === "terlambat"
              ? "bg-rose-100 text-rose-800 font-semibold shadow-xs"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          }`}
        >
          Terlambat
        </button>
      </div>
    </div>
  );
};
