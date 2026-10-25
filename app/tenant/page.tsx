"use client";

import React, { useState } from "react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantGreeting } from "@/components/tenant/TenantGreeting";
import { TenantAnnouncement } from "@/components/tenant/TenantAnnouncement";
import { ActiveBillCard } from "@/components/tenant/ActiveBillCard";
import { ExtraBillsSection } from "@/components/tenant/ExtraBillsSection";
import { ServiceShortcutsGrid } from "@/components/tenant/ServiceShortcutsGrid";
import { TenantBottomNav, TenantTabType } from "@/components/tenant/TenantBottomNav";
import { PaymentModal } from "@/components/tenant/PaymentModal";
import { ServiceModals } from "@/components/tenant/ServiceModals";
import { ArrowLeft, Sparkles, Smartphone, Check, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function TenantDashboardPage() {
  const [activeTab, setActiveTab] = useState<TenantTabType>("beranda");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeServiceModal, setActiveServiceModal] = useState<
    "riwayat" | "rusak" | "barang" | "kulkas" | "kuitansi" | null
  >(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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
    setActiveServiceModal(shortcutId);
  };

  const handlePaymentSuccess = () => {
    showToast("Pembayaran berhasil diproses! Terima kasih, Azka.");
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
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden">
      {/* Ambient background soft glow effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-indigo-200/35 via-blue-100/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-36 w-80 h-80 bg-pink-100/30 rounded-full blur-3xl" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Demo Bar for paired navigation with Admin */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70 z-30 px-3 py-1.5 flex items-center justify-between text-xs">
        <a
          href="/"
          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Halaman Login</span>
        </a>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            Sisi Penghuni Aktif: <strong>Azka Andya (Kamar B-04)</strong>
          </span>
          <a
            href="/admin"
            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-semibold text-[11px] transition"
          >
            Buka Portal Pemilik (Admin) →
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-[11px] inline-flex items-center gap-1 transition cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Mobile Device Frame Container (max-w-[430px]) */}
      <div className="relative z-10 w-full max-w-[430px] min-h-screen px-4 sm:px-5 pt-3 pb-24 flex flex-col justify-between">
        {/* Main Content Area */}
        <div>
          {/* 1. Header (KOST YUSI - Beranda - Bell) */}
          <TenantHeader unreadCount={1} />

          {/* 2. User Greeting */}
          <TenantGreeting
            userName="Azka Andya"
            roomNumber="B-04"
            floor="Lt. 1"
            propertyName="Kost Yusi"
          />

          {/* 3. Pengumuman Kos Banner */}
          <TenantAnnouncement />

          {/* 4. Active Rent Hero Card ("TAGIHAN AKTIF") */}
          <ActiveBillCard
            onPayClick={() => {
              window.location.href = "/tenant/pay";
            }}
            onReceiptClick={() => {
              window.location.href = "/tenant/bills";
            }}
          />

          {/* 5. Tagihan Tambahan Section */}
          <ExtraBillsSection
            onBillItemClick={(title) => {
              window.location.href = "/tenant/pay";
            }}
          />

          {/* 6. Pintasan Layanan Kos Grid (2x2) */}
          <ServiceShortcutsGrid onShortcutClick={handleShortcutClick} />
        </div>
      </div>

      {/* 7. Bottom Navigation Bar */}
      <TenantBottomNav activeTab={activeTab} onChangeTab={handleTabChange} />

      {/* Payment Modal (VA, QRIS, Manual) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={1575000}
        invoiceNumber="INV-202611-B04"
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Service Modals (Riwayat Bayar, Lapor Rusak, Barang Luar, Kulkas Bersama, Kuitansi) */}
      <ServiceModals
        activeModal={activeServiceModal}
        onClose={() => setActiveServiceModal(null)}
      />
    </div>
  );
}
