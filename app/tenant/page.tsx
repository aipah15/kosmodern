"use client";

import React, { useState } from "react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantGreeting } from "@/components/tenant/TenantGreeting";
import { TenantAnnouncement } from "@/components/tenant/TenantAnnouncement";
import { ActiveBillCard } from "@/components/tenant/ActiveBillCard";
import { ExtraBillsSection } from "@/components/tenant/ExtraBillsSection";
import { ServiceShortcutsGrid } from "@/components/tenant/ServiceShortcutsGrid";
import { TenantBottomNav, TenantTabType } from "@/components/tenant/TenantBottomNav";
import {
  ArrowLeft,
  Sparkles,
  LogOut,
  Clock,
  Shield,
  HelpCircle,
  FileText,
  Phone,
  CheckCircle2,
  Building,
  Wifi,
  MapPin,
  Calendar,
  Lock,
  MessageSquare,
} from "lucide-react";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { formatDateIndo } from "@/lib/utils/date";

export default function TenantDashboardPage() {
  const [activeTab, setActiveTab] = useState<TenantTabType>("beranda");
  const portal = useTenantPortal();
  const { tenant, owner } = portal;
  const policies = portal.propertySettings?.policies || {};

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type?: "info" | "error" | "success";
  } | null>(null);

  const showToast = (text: string, type: "info" | "error" | "success" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = () => portal.logout();

  const handleShortcutClick = (
    shortcutId: "riwayat" | "rusak" | "barang" | "kulkas"
  ) => {
    if (shortcutId === "riwayat") {
      window.location.href = "/tenant/bills";
      return;
    }
    if (shortcutId === "rusak") {
      window.location.href = "/tenant/maintenance";
      return;
    }
    if (shortcutId === "barang") {
      window.location.href = "/tenant/storage";
      return;
    }
    if (shortcutId === "kulkas") {
      window.location.href = "/tenant/food";
      return;
    }
  };

  const handleTabChange = (tab: TenantTabType) => {
    setActiveTab(tab);
    if (tab === "tagihan") {
      window.location.href = "/tenant/bills";
    } else if (tab === "laporan") {
      window.location.href = "/tenant/maintenance";
    } else if (tab === "penyimpanan") {
      window.location.href = "/tenant/storage";
    } else if (tab === "makanan") {
      window.location.href = "/tenant/food";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col justify-start relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-200/30 via-blue-100/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-36 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200 border border-white/10">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Demo Bar: Sisi Penghuni vs Portal Pemilik */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70 z-30 px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs gap-2">
        <a
          href="/"
          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Halaman Utama </span>Login</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden sm:inline-block text-[11px] text-slate-500">
            Penghuni Aktif: <strong>{tenant.full_name} (Kamar {tenant.room_number})</strong>
          </span>
          <a
            href="/admin"
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-bold text-[11px] transition border border-indigo-100 shrink-0"
          >
            <span className="hidden sm:inline">Portal Pemilik (Admin)</span>
            <span className="sm:hidden">Admin</span> →
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="px-2 sm:px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] inline-flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden xs:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Sticky Header Navigasi (Mobile compact, Tablet & Desktop Full Nav) */}
      <TenantHeader activeNav="beranda" />

      {/* Kontainer Utama yang Membedakan Mobile, Tablet, dan Desktop (PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-12">
        {/* Sapaan Personal Penghuni & Kartu Wi-Fi/Kontak */}
        <TenantGreeting onShowToast={showToast} />

        {/* =========================================================================
            TATA LETAK RESPONSIVE:
            - Mobile (< 768px): Kolom tunggal alami yang nyaman di ponsel
            - Tablet (768px - 1023px): 2 Kolom proporsional
            - PC / Desktop (>= 1024px): 12 Kolom lebar (8 Kolom Utama + 4 Kolom Widget)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start mt-3">
          {/* KOLOM UTAMA (Tablet: 1/2 kolom, Desktop PC: 8 kolom) */}
          <div className="md:col-span-1 lg:col-span-8 space-y-6">
            {/* 1. Hero Card: Tagihan Aktif */}
            <ActiveBillCard
              onPayClick={() => {
                window.location.href = "/tenant/pay";
              }}
              onReceiptClick={() => {
                window.location.href = "/tenant/bills";
              }}
            />

            {/* 2. Rincian Tagihan Tambahan */}
            <ExtraBillsSection
              onBillItemClick={() => {
                window.location.href = "/tenant/pay";
              }}
            />

            {/* 3. Pintasan Layanan Kos Grid (Tampil di kolom kiri pada Desktop PC) */}
            <div className="hidden lg:block">
              <ServiceShortcutsGrid onShortcutClick={handleShortcutClick} />
            </div>
          </div>

          {/* KOLOM KANAN / SIDEBAR (Tablet: 1/2 kolom, Desktop PC: 4 kolom) */}
          <div className="md:col-span-1 lg:col-span-4 space-y-6">
            {/* Pengumuman Resmi Pemilik Kos */}
            <TenantAnnouncement />

            {/* Pintasan Layanan (Tampil di sini pada Mobile & Tablet) */}
            <div className="lg:hidden">
              <ServiceShortcutsGrid onShortcutClick={handleShortcutClick} />
            </div>

            {/* Kartu: Tata Tertib & Fasilitas Bersama */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      Tata Tertib Fasilitas
                    </h4>
                    <p className="text-[10px] text-slate-400">{owner.propertyName}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  SOP Aktif
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                {policies.visitingHoursEnd && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <p className="leading-relaxed">
                      <strong>Batas Kunjungan Tamu:</strong> Maksimal pukul <strong>{policies.visitingHoursEnd}</strong>.
                    </p>
                  </div>
                )}
                {policies.petPolicy && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <p className="leading-relaxed">
                      <strong>Hewan Peliharaan:</strong> {policies.petPolicy}.
                    </p>
                  </div>
                )}
                {policies.smokingPolicy && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <p className="leading-relaxed">
                      <strong>Merokok:</strong> {policies.smokingPolicy}.
                    </p>
                  </div>
                )}
                {!policies.visitingHoursEnd && !policies.petPolicy && !policies.smokingPolicy && (
                  <p className="text-slate-400">Pengelola belum mengisi tata tertib.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Mulai Menghuni:</span>
                <span className="font-bold text-slate-900">{formatDateIndo(tenant.check_in_date)}</span>
              </div>
            </div>

            {/* Kartu: Informasi Kontak Pemilik & Keamanan */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                KONTAK PENGELOLA PROPERTI:
              </span>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs">
                <div>
                  <h5 className="font-bold text-slate-900">
                    {owner.name}
                  </h5>
                  <p className="text-[11px] text-slate-500">Pemilik & Pengelola {owner.propertyName}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const phone = owner.phone.replace(/\D/g, "");
                    const cleanPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
                    window.open(`https://wa.me/${cleanPhone}`, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat WA</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Alamat: {owner.address}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Navigasi Bawah Khusus Layar Ponsel (< 768px) */}
      <TenantBottomNav activeTab={activeTab} onChangeTab={handleTabChange} />

    </div>
  );
}
