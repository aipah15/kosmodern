"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Building,
  Receipt,
  ShieldCheck,
  Users,
  Settings,
  LogOut,
  Home,
  Clock,
  Wrench,
  Eye,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onLogout?: () => void;
  verificationBadge?: number;
  propertyName?: string;
  roomCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab = "pengaturan",
  onTabChange,
  onLogout,
  verificationBadge = 0,
  propertyName = "Kost",
  roomCount = 0,
}) => {
  const menuItems = [
    { id: "dasbor", label: "Dasbor", icon: LayoutGrid },
    { id: "properti", label: "Properti & Kamar", icon: Building },
    { id: "tagihan", label: "Tagihan & Pembayaran", icon: Receipt },
    { id: "verifikasi", label: "Verifikasi Bukti", icon: ShieldCheck, badge: verificationBadge },
    { id: "penghuni", label: "Penghuni", icon: Users },
    { id: "pengaturan", label: "Pengaturan", icon: Settings },
    { id: "tagihan_otomatis", label: "Tagihan Otomatis", icon: Clock },
    { id: "laporan_kerusakan", label: "Laporan Kerusakan", icon: Wrench },
    { id: "pemantauan", label: "Pemantauan Area Bersama", icon: Eye },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-full overflow-y-auto p-5 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="w-10 h-10 rounded-[12px] bg-[#4f46e5] flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-8 4h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-8h2v2H7V6zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm10 4h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              Kost Yusi
            </h1>
            <span className="text-[10px] font-semibold text-indigo-600 tracking-wider uppercase block">
              OWNER PORTAL
            </span>
          </div>
        </div>

        {/* Property Switcher Pill Card */}
        <div className="bg-[#f8faff] border border-indigo-100/80 rounded-2xl p-3 flex items-center gap-3 mb-6 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-[#4f46e5]">
            <Home className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">
              {propertyName}
            </h4>
            <p className="text-[10px] text-slate-400 font-normal">
              {roomCount} Kamar
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange?.(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white text-[#4f46e5]"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout / Switch back button */}
      <div className="pt-4 border-t border-slate-100">
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Ke Halaman Masuk</span>
        </Link>
      </div>
    </aside>
  );
};
