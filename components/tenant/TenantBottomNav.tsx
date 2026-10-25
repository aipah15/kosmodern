"use client";

import React from "react";
import { Home, Receipt, Wrench, Package, Refrigerator } from "lucide-react";

export type TenantTabType =
  | "beranda"
  | "tagihan"
  | "laporan"
  | "penyimpanan"
  | "makanan";

interface TenantBottomNavProps {
  activeTab: TenantTabType;
  onChangeTab: (tab: TenantTabType) => void;
}

export const TenantBottomNav: React.FC<TenantBottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.04)] py-2 sm:py-2.5">
      <div className="max-w-lg md:max-w-xl mx-auto px-4 flex items-center justify-around">
        {/* Tab 1: Beranda */}
        <button
          type="button"
          onClick={() => onChangeTab("beranda")}
          className={`flex flex-col items-center justify-center relative py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === "beranda"
              ? "text-[#4f46e5]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "beranda" ? "font-bold" : "font-medium"
            }`}
          >
            Beranda
          </span>
          {activeTab === "beranda" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] mt-0.5" />
          )}
        </button>

        {/* Tab 2: Tagihan */}
        <button
          type="button"
          onClick={() => onChangeTab("tagihan")}
          className={`flex flex-col items-center justify-center relative py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === "tagihan"
              ? "text-[#4f46e5]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Receipt className="w-5 h-5 stroke-[2]" />
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "tagihan" ? "font-bold" : "font-medium"
            }`}
          >
            Tagihan
          </span>
          {activeTab === "tagihan" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] mt-0.5" />
          )}
        </button>

        {/* Tab 3: Laporan */}
        <button
          type="button"
          onClick={() => onChangeTab("laporan")}
          className={`flex flex-col items-center justify-center relative py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === "laporan"
              ? "text-[#4f46e5]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Wrench className="w-5 h-5 stroke-[2]" />
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "laporan" ? "font-bold" : "font-medium"
            }`}
          >
            Lapor
          </span>
          {activeTab === "laporan" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] mt-0.5" />
          )}
        </button>

        {/* Tab 4: Penyimpanan */}
        <button
          type="button"
          onClick={() => onChangeTab("penyimpanan")}
          className={`flex flex-col items-center justify-center relative py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === "penyimpanan"
              ? "text-[#4f46e5]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Package className="w-5 h-5 stroke-[2]" />
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "penyimpanan" ? "font-bold" : "font-medium"
            }`}
          >
            Titipan
          </span>
          {activeTab === "penyimpanan" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] mt-0.5" />
          )}
        </button>

        {/* Tab 5: Makanan / Kulkas */}
        <button
          type="button"
          onClick={() => onChangeTab("makanan")}
          className={`flex flex-col items-center justify-center relative py-1 px-2.5 transition-all cursor-pointer ${
            activeTab === "makanan"
              ? "text-[#4f46e5]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Refrigerator className="w-5 h-5 stroke-[2]" />
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "makanan" ? "font-bold" : "font-medium"
            }`}
          >
            Kulkas
          </span>
          {activeTab === "makanan" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
