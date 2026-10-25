"use client";

import React from "react";
import { Home, Receipt, Wrench, Package } from "lucide-react";

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] py-2 sm:py-2.5">
      <div className="max-w-[430px] mx-auto px-4 flex items-center justify-around">
        {/* Tab 1: Beranda */}
        <button
          type="button"
          onClick={() => onChangeTab("beranda")}
          className={`flex flex-col items-center justify-center relative py-1 px-2 transition-all cursor-pointer ${
            activeTab === "beranda"
              ? "text-[#3b82f6]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "beranda" ? "font-bold" : "font-normal"
            }`}
          >
            Beranda
          </span>
          {activeTab === "beranda" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-0.5" />
          )}
        </button>

        {/* Tab 2: Tagihan */}
        <button
          type="button"
          onClick={() => onChangeTab("tagihan")}
          className={`flex flex-col items-center justify-center relative py-1 px-2 transition-all cursor-pointer ${
            activeTab === "tagihan"
              ? "text-[#3b82f6]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Receipt className="w-5 h-5 stroke-[2]" />
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "tagihan" ? "font-bold" : "font-normal"
            }`}
          >
            Tagihan
          </span>
          {activeTab === "tagihan" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-0.5" />
          )}
        </button>

        {/* Tab 3: Laporan */}
        <button
          type="button"
          onClick={() => onChangeTab("laporan")}
          className={`flex flex-col items-center justify-center relative py-1 px-2 transition-all cursor-pointer ${
            activeTab === "laporan"
              ? "text-[#3b82f6]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Wrench className="w-5 h-5 stroke-[2]" />
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "laporan" ? "font-bold" : "font-normal"
            }`}
          >
            Laporan
          </span>
          {activeTab === "laporan" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-0.5" />
          )}
        </button>

        {/* Tab 4: Penyimpanan */}
        <button
          type="button"
          onClick={() => onChangeTab("penyimpanan")}
          className={`flex flex-col items-center justify-center relative py-1 px-2 transition-all cursor-pointer ${
            activeTab === "penyimpanan"
              ? "text-[#3b82f6]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Package className="w-5 h-5 stroke-[2]" />
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "penyimpanan" ? "font-bold" : "font-normal"
            }`}
          >
            Penyimpanan
          </span>
          {activeTab === "penyimpanan" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-0.5" />
          )}
        </button>

        {/* Tab 5: Makanan */}
        <button
          type="button"
          onClick={() => onChangeTab("makanan")}
          className={`flex flex-col items-center justify-center relative py-1 px-2 transition-all cursor-pointer ${
            activeTab === "makanan"
              ? "text-[#3b82f6]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {/* Refrigerator Icon */}
          <svg
            className="w-5 h-5"
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
          <span
            className={`text-[10px] mt-1 tracking-tight ${
              activeTab === "makanan" ? "font-bold" : "font-normal"
            }`}
          >
            Makanan
          </span>
          {activeTab === "makanan" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
