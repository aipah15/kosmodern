"use client";

import React from "react";
import { Receipt, Wrench, Package, Refrigerator, ChevronRight } from "lucide-react";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { areaItemMeta } from "@/modules/tenant-portal/areaItems";

interface ServiceShortcutsGridProps {
  onShortcutClick: (shortcutId: "riwayat" | "rusak" | "barang" | "kulkas") => void;
}

export const ServiceShortcutsGrid: React.FC<ServiceShortcutsGridProps> = ({
  onShortcutClick,
}) => {
  const { billing, tickets, areaItems, fridgeItems, tenant } = useTenantPortal();

  // Lencana dihitung dari data penghuni yang login
  const billBadge =
    billing.state === "lunas"
      ? { text: "Lunas", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" }
      : billing.state === "verifikasi"
      ? { text: "Verifikasi", cls: "text-blue-700 bg-blue-50 border-blue-200" }
      : billing.state === "terlambat"
      ? { text: "Terlambat", cls: "text-rose-700 bg-rose-50 border-rose-200" }
      : { text: "Belum Bayar", cls: "text-amber-700 bg-amber-50 border-amber-200" };
  const activeTickets = tickets.filter((t) => t.tenant_id === tenant.id && (t.status === "baru" || t.status === "diproses")).length;
  const myArea = areaItems.filter((a) => a.tenant_id === tenant.id);
  const overdueArea = myArea.filter((a) => areaItemMeta(a).isOverdue).length;
  const myFridge = fridgeItems.filter((f) => f.tenant_id === tenant.id).length;

  return (
    <div className="w-full mb-6">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Pintasan Layanan Kos
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">Akses Cepat</span>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: Riwayat Bayar */}
        <div
          onClick={() => onShortcutClick("riwayat")}
          className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${billBadge.cls}`}>
                {billBadge.text}
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
              Riwayat & Kwitansi
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 font-normal line-clamp-2">
              Bukti bayar sah & tagihan bulanan
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end text-indigo-600 font-medium text-[11px]">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Lapor Rusak */}
        <div
          onClick={() => onShortcutClick("rusak")}
          className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-2xs hover:shadow-md hover:border-rose-200 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              {activeTickets > 0 && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {activeTickets} Berjalan
                </span>
              )}
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition leading-snug">
              Lapor Kerusakan
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 font-normal line-clamp-2">
              AC, air bocor, lampu & Wi-Fi
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end text-rose-600 font-medium text-[11px]">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Barang Luar */}
        <div
          onClick={() => onShortcutClick("barang")}
          className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-2xs hover:shadow-md hover:border-purple-200 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              {myArea.length > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    overdueArea > 0
                      ? "text-rose-700 bg-rose-50 border-rose-200"
                      : "text-emerald-700 bg-emerald-50 border-emerald-200"
                  }`}
                >
                  {overdueArea > 0 ? `${overdueArea} Lewat Batas` : `${myArea.length} Barang`}
                </span>
              )}
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-600 transition leading-snug">
              Barang Luar Kamar
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 font-normal line-clamp-2">
              Jemuran, rak sepatu & teras
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end text-purple-600 font-medium text-[11px]">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Kulkas Bersama */}
        <div
          onClick={() => onShortcutClick("kulkas")}
          className="bg-white rounded-2xl p-4 border border-slate-100/90 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Refrigerator className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                {myFridge} Item
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition leading-snug">
              Kulkas Bersama
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-1 font-normal line-clamp-2">
              Cek batas simpan makanan
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end text-emerald-600 font-medium text-[11px]">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
