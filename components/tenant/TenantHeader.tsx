"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  User,
  Building2,
  Home,
  Receipt,
  Wrench,
  Package,
  Refrigerator,
  Key,
} from "lucide-react";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { buildNotifications, useNotificationReadState } from "@/modules/tenant-portal/notifications";

interface TenantHeaderProps {
  activeNav?: "beranda" | "tagihan" | "laporan" | "penyimpanan" | "makanan";
}

export const TenantHeader: React.FC<TenantHeaderProps> = ({ activeNav = "beranda" }) => {
  const portal = useTenantPortal();
  const { tenant, owner } = portal;
  const { readIds } = useNotificationReadState(tenant.id);
  const unreadCount = buildNotifications(portal, portal.billing).filter((n) => !readIds.has(n.id)).length;
  const initials = tenant.full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  const navLinks = [
    { id: "beranda", label: "Beranda", href: "/tenant", icon: Home },
    { id: "tagihan", label: "Tagihan", href: "/tenant/bills", icon: Receipt },
    { id: "laporan", label: "Lapor Rusak", href: "/tenant/maintenance", icon: Wrench },
    { id: "penyimpanan", label: "Titipan Barang", href: "/tenant/storage", icon: Package },
    { id: "makanan", label: "Kulkas Bersama", href: "/tenant/food", icon: Refrigerator },
  ];

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Property Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[#4f46e5] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black tracking-wider text-[#4f46e5] uppercase leading-none">
                {owner.propertyName}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-bold">
                Penghuni
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight mt-0.5">
              Portal Penghuni
            </h1>
          </div>
        </div>

        {/* Desktop & Tablet Navigation Menu (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-[#4f46e5] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Profile Badge & Notification */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Notification Bell */}
          <Link
            href="/tenant/notifications"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs text-slate-700 hover:text-slate-900 transition cursor-pointer active:scale-95"
            aria-label="Lihat Notifikasi"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-white ring-1 ring-rose-500/20 animate-pulse" />
            )}
          </Link>

          {/* User Profile Pill (Tablet & Desktop) */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {tenant.full_name}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block leading-tight mt-0.5">
                Kamar {tenant.room_number} • {tenant.floor}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
