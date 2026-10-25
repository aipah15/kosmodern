"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { KpiStats } from "@/components/admin/KpiStats";
import { PaymentVerificationSection } from "@/components/admin/PaymentVerificationSection";
import { RoomAvailabilitySection } from "@/components/admin/RoomAvailabilitySection";
import { OverdueResidentsSection } from "@/components/admin/OverdueResidentsSection";

// Import komponen modular per domain
import { RoomManagement } from "@/modules/rooms/components/RoomManagement";
import { PenghuniManagementSection } from "@/components/admin/PenghuniManagementSection";
import { TagihanManagementWrapper } from "@/components/admin/TagihanManagementWrapper";
import { ProofVerificationPage } from "@/components/admin/ProofVerificationPage";
import { PaymentSettingsSection } from "@/components/admin/PaymentSettingsSection";
import { MaintenanceManagementSection } from "@/components/admin/MaintenanceManagementSection";
import { AutoBillingReminderSection } from "@/components/admin/AutoBillingReminderSection";
import { CommunalAreaMonitoringSection } from "@/components/admin/CommunalAreaMonitoringSection";
import { CreateAnnouncementSection } from "@/components/admin/CreateAnnouncementSection";

// Import hook autentikasi & service modular
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { proofService } from "@/modules/billing/services/proofService";
import { billingService } from "@/modules/billing/services/billingService";
import { PaymentProofItem } from "@/types/proof";
import { DEFAULT_PROPERTY } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { roomService } from "@/modules/rooms/services/roomService";

// Daftar tab menu admin untuk navigasi mobile & desktop
const ADMIN_TABS = [
  { id: "dasbor", label: "Dasbor" },
  { id: "properti", label: "Properti & Kamar" },
  { id: "tagihan", label: "Tagihan" },
  { id: "verifikasi", label: "Verifikasi" },
  { id: "penghuni", label: "Penghuni" },
  { id: "pengaturan", label: "Pengaturan" },
  { id: "tagihan_otomatis", label: "Tagihan Otomatis" },
  { id: "laporan_kerusakan", label: "Laporan Kerusakan" },
  { id: "pemantauan", label: "Area Bersama" },
];

// Halaman utama Dasbor Pemilik Kos (Admin Portal)
export default function AdminDashboardPage() {
  // 1. Guard Autentikasi Modular: Hanya pemilik (owner) yang diizinkan masuk
  const { isLoading: isCheckingAuth, isAuthenticated, logout } = useAuth({
    requireAuth: true,
    requireOwner: true,
    redirectTo: "/?error=unauthorized",
  });

  const [activeTab, setActiveTab] = useState("dasbor");
  const [previousTab, setPreviousTab] = useState("dasbor");
  const [selectedTenantName, setSelectedTenantName] = useState<string | null>(null);
  const [proofs, setProofs] = useState<PaymentProofItem[]>([]);
  const [ownerName, setOwnerName] = useState<string>(DEFAULT_PROPERTY.ownerName);
  const [propertyName, setPropertyName] = useState<string>(DEFAULT_PROPERTY.name);
  const [roomCount, setRoomCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "info" | "error" | "success";
  } | null>(null);

  const showToast = (text: string, type: "info" | "error" | "success" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Baca parameter rute tab jika diberikan di URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // 2. Memuat data bukti pembayaran via proofService modular
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadProofs() {
      try {
        const data = await proofService.getPaymentProofs("all");
        setProofs(data);
      } catch (err: any) {
        showToast(`Gagal memuat bukti pembayaran: ${err?.message || "kesalahan jaringan"}`, "error");
      }
    }

    loadProofs();
  }, [isAuthenticated]);

  // Nama pemilik/properti dari Pengaturan, jumlah kamar dari tabel rooms
  useEffect(() => {
    if (!isAuthenticated) return;
    const supabase = createClient();
    supabase
      .from("property_settings")
      .select("profile")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.profile?.ownerName) setOwnerName(data.profile.ownerName);
        if (data?.profile?.propertyName) setPropertyName(data.profile.propertyName);
      });
    roomService
      .getRooms("all")
      .then((rooms) => setRoomCount(rooms.length))
      .catch(() => undefined);
  }, [isAuthenticated]);

  // Persetujuan bukti transfer pembayaran
  const handleApproveProof = async (id: string): Promise<boolean> => {
    try {
      const target = proofs.find((p) => p.id === id);
      await proofService.approveProof(id, target?.invoice_number);
      showToast("Bukti transfer disetujui & status tagihan berhasil diperbarui!");
      setProofs(await proofService.getPaymentProofs("all"));
      return true;
    } catch (err: any) {
      showToast(`Gagal memperbarui status bukti transfer: ${err?.message || "kesalahan jaringan"}`, "error");
      return false;
    }
  };

  // Penolakan bukti transfer pembayaran
  const handleRejectProof = async (id: string): Promise<boolean> => {
    try {
      await proofService.rejectProof(id, "Bukti transfer tidak valid atau tidak terbaca.");
      showToast("Bukti pembayaran ditolak.", "info");
      setProofs(await proofService.getPaymentProofs("all"));
      return true;
    } catch (err: any) {
      showToast(`Gagal menolak bukti transfer: ${err?.message || "kesalahan jaringan"}`, "error");
      return false;
    }
  };

  // Unduh rekap seluruh tagihan sebagai CSV dari data DB
  const handleDownloadReport = async () => {
    try {
      const bills = await billingService.getBills("all");
      if (bills.length === 0) {
        showToast("Belum ada data tagihan untuk diunduh.", "info");
        return;
      }
      const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      const rows = [
        "No. Invoice,Penghuni,Kamar,Jenis Tagihan,Periode,Nominal,Denda,Status,Jatuh Tempo,Dibayar Pada",
        ...bills.map((b) =>
          [b.invoice_number, b.tenant_name, b.room_number, b.title, b.period, b.amount, b.fine_amount, b.status, b.due_date, b.paid_at].map(esc).join(",")
        ),
      ];
      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap_tagihan_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Laporan rekap tagihan berhasil diunduh.");
    } catch (err: any) {
      showToast(`Gagal mengunduh laporan: ${err?.message || "kesalahan jaringan"}`, "error");
    }
  };

  // Tampilan loading saat memverifikasi sesi login
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8faff] text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            Memverifikasi Hak Akses Pemilik...
          </span>
          <span className="text-xs text-slate-400">
            {propertyName} Owner Portal
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 antialiased">
      {/* Notifikasi Toast Mengambang */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/90 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Sidebar Navigasi Admin (Fixed Permanen di Kiri Layar Mengikuti Scroll) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30 bg-white">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== "dasbor" && tab !== "properti" && tab !== "penghuni") {
              showToast(`Navigasi ke menu ${tab.toUpperCase()} aktif.`);
            }
          }}
          onLogout={logout}
          verificationBadge={proofs.filter((p) => p.status === "pending").length}
          propertyName={propertyName}
          roomCount={roomCount}
        />
      </div>

      {/* Kontainer Utama */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Header terpusat untuk semua tab (dihindari duplikasi per tab) */}
        {activeTab !== "buat_pengumuman" && (
          <AdminHeader
            ownerName={ownerName}
            roleTitle={DEFAULT_PROPERTY.ownerRole}
            showDatePicker={activeTab === "dasbor"}
            onOpenAnnouncement={() => {
              setPreviousTab(activeTab);
              setActiveTab("buat_pengumuman");
            }}
            onDownloadReport={handleDownloadReport}
          />
        )}
        {/* Menu Navigasi Mobile Sticky (Mengikuti Scroll Layar Kecil) */}
        <div className="lg:hidden sticky top-3 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-white/90 backdrop-blur-md border-y border-slate-200/80 flex items-center gap-2 overflow-x-auto shadow-xs">
          {ADMIN_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "dasbor" && tab.id !== "properti" && tab.id !== "penghuni") {
                    showToast(`Navigasi ke menu ${tab.label} aktif.`);
                  }
                }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[#4f46e5] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Pergantian Konten Berdasarkan Tab Aktif */}
        {activeTab === "buat_pengumuman" ? (
          <CreateAnnouncementSection
            onBack={() => setActiveTab(previousTab || "dasbor")}
            onShowToast={showToast}
          />
        ) : activeTab === "pemantauan" ? (
          <CommunalAreaMonitoringSection onShowToast={showToast} />
        ) : activeTab === "laporan_kerusakan" ? (
          <MaintenanceManagementSection onShowToast={showToast} />
        ) : activeTab === "tagihan_otomatis" ? (
          <AutoBillingReminderSection onShowToast={showToast} />
        ) : activeTab === "pengaturan" ? (
          <PaymentSettingsSection onShowToast={showToast} />
        ) : activeTab === "verifikasi" ? (
          <ProofVerificationPage
            onShowToast={showToast}
            onNavigateToBills={() => setActiveTab("tagihan")}
          />
        ) : activeTab === "tagihan" ? (
          <TagihanManagementWrapper
            onShowToast={showToast}
            onNavigateToProof={() => setActiveTab("verifikasi")}
          />
        ) : activeTab === "penghuni" ? (
          <PenghuniManagementSection
            onShowToast={showToast}
            onNavigateToVerification={() => setActiveTab("verifikasi")}
            initialSelectedTenantName={selectedTenantName}
          />
        ) : activeTab === "properti" ? (
          <RoomManagement
            onShowToast={showToast}
            onViewTenantProfile={(tenantName) => {
              setSelectedTenantName(tenantName);
              setActiveTab("penghuni");
            }}
          />
        ) : (
          <>
            {/* Tampilan Utama Dasbor */}
            <KpiStats />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
              <div className="xl:col-span-8">
                <PaymentVerificationSection
                  initialProofs={proofs}
                  onApproveProof={handleApproveProof}
                  onRejectProof={handleRejectProof}
                  onRefresh={async () => {
                    const data = await proofService.getPaymentProofs("all");
                    setProofs(data);
                    showToast("Data bukti pembayaran diperbarui");
                  }}
                />
              </div>

              <div className="xl:col-span-4">
                <RoomAvailabilitySection onManageRooms={() => setActiveTab("properti")} />
              </div>
            </div>

            <OverdueResidentsSection />
          </>
        )}
        </div>
      </div>

    </div>
  );
}
