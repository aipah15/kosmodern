"use client";

import React from "react";
import { Zap, Clock, Receipt, Droplet, FileText } from "lucide-react";
import { formatRupiah } from "@/lib/utils/currency";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { billTotal } from "@/modules/tenant-portal/services/portalService";

interface ExtraBillsSectionProps {
  onBillItemClick?: (itemTitle: string) => void;
}

const CATEGORY_STYLE: Record<string, { bg: string; icon: React.ReactNode }> = {
  listrik: { bg: "bg-amber-50 text-amber-500", icon: <Zap className="w-5 h-5 fill-amber-400 text-amber-500" /> },
  air: { bg: "bg-sky-50 text-sky-500", icon: <Droplet className="w-5 h-5 text-sky-500" /> },
  denda: { bg: "bg-rose-50 text-rose-500", icon: <Clock className="w-5 h-5 text-rose-500 stroke-[2.2]" /> },
};

export const ExtraBillsSection: React.FC<ExtraBillsSectionProps> = ({ onBillItemClick }) => {
  const { billing } = useTenantPortal();
  const { extraBills, mainBill, total } = billing;

  if (extraBills.length === 0) return null;

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Tagihan Tambahan</h3>
        <span className="text-xs font-semibold text-[#4f46e5] bg-[#eeeffe] px-2.5 py-0.5 rounded-full border border-indigo-100/60">
          {extraBills.length} Item
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-3 font-normal">Biaya fasilitas & penyesuaian yang belum lunas</p>

      <div className="space-y-2.5">
        {extraBills.map((bill) => {
          const style = CATEGORY_STYLE[bill.bill_category] ?? {
            bg: "bg-indigo-50 text-indigo-500",
            icon: <FileText className="w-5 h-5 text-indigo-500" />,
          };
          const isPending = bill.status === "pending" || bill.status === "menunggu_verifikasi";
          return (
            <div
              key={bill.id}
              onClick={() => onBillItemClick?.(bill.title)}
              className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100/90 shadow-2xs hover:shadow-xs transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  {style.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{bill.title}</span>
                  <div className="flex items-center gap-1.5 text-[11px] mt-0.5 font-medium">
                    <span className="text-slate-400">{bill.period}</span>
                    <span className="text-slate-300">•</span>
                    <span className={isPending ? "text-blue-500 font-semibold" : "text-amber-500 font-semibold"}>
                      {isPending ? "Menunggu Verifikasi" : "Belum Bayar"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">{formatRupiah(billTotal(bill))}</span>
                <span className="text-[10px] text-slate-400 font-normal">Subtotal</span>
              </div>
            </div>
          );
        })}

        {mainBill && (
          <div className="bg-[#eef2ff] border border-indigo-100/80 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between mt-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#4f46e5]" />
              <span className="text-xs sm:text-sm font-bold text-slate-800">Total Akumulasi Tagihan</span>
            </div>
            <span className="text-sm sm:text-base font-extrabold text-[#4f46e5] tracking-tight">{formatRupiah(total)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
