"use client";

import React from "react";
import {
  Calendar,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils/currency";
import { formatDateIndo } from "@/lib/utils/date";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { daysUntil } from "@/modules/tenant-portal/services/portalService";

interface ActiveBillCardProps {
  onPayClick: () => void;
  onReceiptClick?: () => void;
}

export const ActiveBillCard: React.FC<ActiveBillCardProps> = ({ onPayClick, onReceiptClick }) => {
  const { billing, tenant } = useTenantPortal();
  const { state, mainBill, total } = billing;

  if (!mainBill) {
    return (
      <div className="w-full bg-white rounded-[28px] p-6 border border-slate-100/90 shadow-[0_10px_35px_-10px_rgba(79,70,229,0.08)] mb-6 text-center">
        <span className="text-xs font-bold text-slate-700 tracking-wider uppercase block">TAGIHAN AKTIF</span>
        <p className="text-sm text-slate-500 mt-2">Belum ada tagihan untuk Kamar {tenant.room_number}.</p>
      </div>
    );
  }

  const daysLeft = daysUntil(mainBill.due_date);
  const dueLabel =
    state === "lunas"
      ? `${formatDateIndo(mainBill.paid_at || mainBill.updated_at)} (Lunas)`
      : state === "terlambat" && daysLeft !== null
      ? `${formatDateIndo(mainBill.due_date)} (Lewat ${Math.abs(daysLeft)} Hari)`
      : formatDateIndo(mainBill.due_date);
  const amountValue = state === "lunas" ? Number(mainBill.amount) + Number(mainBill.fine_amount || 0) : total;

  return (
    <div className="w-full bg-white rounded-[28px] p-4 sm:p-6 shadow-[0_10px_35px_-10px_rgba(79,70,229,0.08)] border border-slate-100/90 relative overflow-hidden mb-6 transition-all duration-300">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 rounded-full bg-indigo-50/50 pointer-events-none blur-2xl" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              state === "lunas"
                ? "bg-emerald-500"
                : state === "verifikasi"
                ? "bg-blue-500 animate-pulse"
                : state === "terlambat"
                ? "bg-rose-500"
                : "bg-amber-500"
            }`}
          />
          <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">TAGIHAN AKTIF</span>
        </div>

        {state === "belum_bayar" && (
          <div className="bg-[#fef9c3] text-[#d97706] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
            <span>Belum Bayar</span>
          </div>
        )}
        {state === "verifikasi" && (
          <div className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3 h-3 text-blue-600 animate-spin" />
            <span>Verifikasi</span>
          </div>
        )}
        {state === "lunas" && (
          <div className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Lunas</span>
          </div>
        )}
        {state === "terlambat" && (
          <div className="bg-rose-50 text-rose-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Terlambat</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">Periode Sewa</span>
        <span className="text-sm font-bold text-slate-900">{mainBill.period}</span>
      </div>

      <div className="mb-2">
        <div className="flex items-baseline">
          <span className="text-lg sm:text-xl font-bold text-[#4f46e5] mr-1.5">Rp</span>
          <span className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight leading-none">
            {formatRupiah(amountValue).replace(/^Rp\s?/, "")}
          </span>
        </div>
      </div>

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
        <span>
          {mainBill.title} • Kamar {tenant.room_number}
        </span>
      </div>

      <div className="bg-[#f4f7fd] border border-[#e8edf7] rounded-xl p-3 flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/70 flex items-center justify-center text-slate-400 shrink-0 shadow-2xs">
          <Calendar className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-none">
            {state === "lunas" ? "Tanggal Pembayaran" : "Jatuh Tempo"}
          </span>
          <span className="text-xs font-bold text-slate-800 leading-tight mt-1">{dueLabel}</span>
        </div>
      </div>

      {state === "belum_bayar" && (
        <button
          type="button"
          onClick={onPayClick}
          className="w-full py-3.5 px-4 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Bayar Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
      {state === "verifikasi" && (
        <button
          type="button"
          onClick={onReceiptClick || onPayClick}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          <span>Bukti Pembayaran Sedang Diverifikasi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
      {state === "lunas" && (
        <button
          type="button"
          onClick={onReceiptClick || onPayClick}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
          <span>Lihat Riwayat & Kuitansi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
      {state === "terlambat" && (
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
    </div>
  );
};
