"use client";

import React from "react";
import { Zap, Clock, Receipt } from "lucide-react";

interface ExtraBillsSectionProps {
  onBillItemClick?: (itemTitle: string) => void;
}

export const ExtraBillsSection: React.FC<ExtraBillsSectionProps> = ({
  onBillItemClick,
}) => {
  return (
    <div className="w-full mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Tagihan Tambahan
        </h3>
        <span className="text-xs font-semibold text-[#4f46e5] bg-[#eeeffe] px-2.5 py-0.5 rounded-full border border-indigo-100/60">
          2 Item
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-3 font-normal">
        Biaya fasilitas & penyesuaian bulan ini
      </p>

      {/* List of Extra Bills */}
      <div className="space-y-2.5">
        {/* Item 1: Listrik Kulkas */}
        <div
          onClick={() => onBillItemClick?.("Listrik Kulkas (Tambahan)")}
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100/90 shadow-2xs hover:shadow-xs transition flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {/* Amber Lightning Icon */}
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Listrik Kulkas (Tambahan)
              </span>
              <div className="flex items-center gap-1.5 text-[11px] mt-0.5 font-medium">
                <span className="text-slate-400">Setiap bulannya</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-500 font-semibold">Belum Bayar</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs sm:text-sm font-bold text-slate-800 block">
              Rp 50.000
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Subtotal
            </span>
          </div>
        </div>

        {/* Item 2: Denda Terlambat */}
        <div
          onClick={() => onBillItemClick?.("Denda Terlambat (Okt)")}
          className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100/90 shadow-2xs hover:shadow-xs transition flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {/* Rose Clock Icon */}
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-rose-500 stroke-[2.2]" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Denda Terlambat (Okt)
              </span>
              <div className="flex items-center gap-1.5 text-[11px] mt-0.5 font-medium">
                <span className="text-slate-400">Keterlambatan 7 hari</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">Kompensasi</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs sm:text-sm font-bold text-slate-800 block">
              Rp 25.000
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Subtotal
            </span>
          </div>
        </div>

        {/* Total Akumulasi Tagihan Container */}
        <div className="bg-[#eef2ff] border border-indigo-100/80 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between mt-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#4f46e5]" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Total Akumulasi Tagihan
            </span>
          </div>

          <span className="text-sm sm:text-base font-extrabold text-[#4f46e5] tracking-tight">
            Rp 1.575.000
          </span>
        </div>
      </div>
    </div>
  );
};
