"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { KpiStats } from "@/components/admin/KpiStats";
import { PaymentVerificationSection, PaymentProof } from "@/components/admin/PaymentVerificationSection";
import { RoomAvailabilitySection } from "@/components/admin/RoomAvailabilitySection";
import { OverdueResidentsSection } from "@/components/admin/OverdueResidentsSection";
import { AnnouncementModal } from "@/components/admin/AnnouncementModal";
import { createClient } from "@/lib/supabase/client";

import { RoomManagementSection } from "@/components/admin/RoomManagementSection";
import { PenghuniManagementSection } from "@/components/admin/PenghuniManagementSection";
import { TagihanManagementWrapper } from "@/components/admin/TagihanManagementWrapper";
import { ProofVerificationPage } from "@/components/admin/ProofVerificationPage";
import { PaymentSettingsSection } from "@/components/admin/PaymentSettingsSection";
import { MaintenanceManagementSection } from "@/components/admin/MaintenanceManagementSection";
import { AutoBillingReminderSection } from "@/components/admin/AutoBillingReminderSection";
import { CommunalAreaMonitoringSection } from "@/components/admin/CommunalAreaMonitoringSection";
import { CreateAnnouncementSection } from "@/components/admin/CreateAnnouncementSection";

export default function AdminDashboardPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("buat_pengumuman"); // Default to buat_pengumuman matching newest image
  const [previousTab, setPreviousTab] = useState("dasbor");
  const [selectedTenantName, setSelectedTenantName] = useState<string | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "info" | "error" | "success";
  } | null>(null);

  const supabase = createClient();

  const showToast = (text: string, type: "info" | "error" | "success" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Client-Side Auth Guard: Ensure only logged-in owners can view this page
  useEffect(() => {
    async function verifyAuth() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.replace("/?error=unauthorized");
          return;
        }

        // Check if user is owner
        const role = user.user_metadata?.role;
        const isOwner = role === "owner" || user.email === "owner@kostyusi.com";

        if (!isOwner) {
          window.location.replace("/?error=forbidden");
          return;
        }

        setIsAuthenticated(true);

        // Check query param for tab if any
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const tabParam = params.get("tab");
          if (tabParam) {
            setActiveTab(tabParam);
          }
        }
      } catch {
        window.location.replace("/?error=unauthorized");
      } finally {
        setIsCheckingAuth(false);
      }
    }

    verifyAuth();
  }, [supabase]);

  // 2. Fetch payment proofs from Supabase
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadProofs() {
      try {
        const { data, error } = await supabase
          .from("payment_proofs")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setProofs(data as PaymentProof[]);
        }
      } catch {
        // Fallback default sample proofs are provided in component
      }
    }
    loadProofs();
  }, [isAuthenticated, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleApproveProof = async (id: string) => {
    try {
      await supabase
        .from("payment_proofs")
        .update({ status: "approved" })
        .eq("id", id);
      showToast("Bukti transfer disetujui & kwitansi resmi berhasil diterbitkan!");
    } catch {
      showToast("Bukti pembayaran telah disetujui.", "success");
    }
  };

  const handleRejectProof = async (id: string) => {
    try {
      await supabase
        .from("payment_proofs")
        .update({ status: "rejected" })
        .eq("id", id);
      showToast("Bukti pembayaran ditolak. Notifikasi dikirim ke penghuni.", "info");
    } catch {
      showToast("Bukti pembayaran ditolak.", "info");
    }
  };

  const handleSendAnnouncement = (title: string, message: string, target: string) => {
    showToast(`Pengumuman "${title}" berhasil disiarkan ke ${target === "all" ? "semua penghuni" : target}!`);
  };

  const handleDownloadReport = () => {
    showToast("Mengunduh laporan rekap keuangan Juni 2026 (Excel/PDF)...");
  };

  // Loading screen while verifying authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8faff] text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4f46e5] flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 animate-bounce">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M19 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-8 4h2v2h-2V6zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-8h2v2H7V6zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm10 4h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V6h2v2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700">
            Memverifikasi Hak Akses Pemilik...
          </span>
          <span className="text-xs text-slate-400">
            Kost Yusi Owner Portal
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex bg-[#f8faff] text-slate-800 antialiased overflow-x-hidden">
      {/* Toast Notification */}
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

      {/* Left Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== "dasbor" && tab !== "properti" && tab !== "penghuni") {
              showToast(`Navigasi ke menu ${tab.toUpperCase()} aktif.`);
            }
          }}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {activeTab === "buat_pengumuman" ? (
          <CreateAnnouncementSection
            onBack={() => setActiveTab(previousTab || "dasbor")}
            onShowToast={showToast}
          />
        ) : activeTab === "pemantauan" ? (
          <>
            {/* Top Header matching Pemantauan Area Bersama & Ketertiban Kos */}
            <AdminHeader
              ownerName="Ibu Hj. Ratna Juwita"
              roleTitle="Pemilik Kos"
              showDatePicker={false}
              onOpenAnnouncement={() => {
                setPreviousTab(activeTab);
                setActiveTab("buat_pengumuman");
              }}
            />

            {/* Pemantauan Area Bersama & Ketertiban Kos */}
            <CommunalAreaMonitoringSection onShowToast={showToast} />
          </>
        ) : activeTab === "laporan_kerusakan" ? (
          <>
            {/* Top Header matching Kelola Laporan Kerusakan & Fasilitas */}
            <AdminHeader
              ownerName="Ibu Hj. Ratna Juwita"
              roleTitle="Pemilik Kos"
              showDatePicker={false}
              onOpenAnnouncement={() => {
                setPreviousTab(activeTab);
                setActiveTab("buat_pengumuman");
              }}
            />

            {/* Kelola Laporan Kerusakan & Fasilitas */}
            <MaintenanceManagementSection onShowToast={showToast} />
          </>
        ) : activeTab === "tagihan_otomatis" ? (
          <>
            {/* Top Header matching Pengaturan Pengingat Tagihan Otomatis */}
            <AdminHeader
              ownerName="Ibu Hj. Ratna Juwita"
              roleTitle="Pemilik Properti"
              showDatePicker={false}
              onOpenAnnouncement={() => {
                setPreviousTab(activeTab);
                setActiveTab("buat_pengumuman");
              }}
            />

            {/* Pengaturan Pengingat Tagihan Otomatis */}
            <AutoBillingReminderSection onShowToast={showToast} />
          </>
        ) : activeTab === "pengaturan" ? (
          <>
            {/* Top Header matching Pengaturan Rekening & Saluran Pembayaran */}
            <AdminHeader
              ownerName="Ibu Hj. Ratna Juwita"
              roleTitle="Pemilik Properti"
              showDatePicker={false}
              onOpenAnnouncement={() => {
                setPreviousTab(activeTab);
                setActiveTab("buat_pengumuman");
              }}
            />

            {/* Pengaturan Rekening & Saluran Pembayaran */}
            <PaymentSettingsSection onShowToast={showToast} />
          </>
        ) : activeTab === "verifikasi" ? (
          <>
            {/* Top Header matching Verifikasi Bukti Penghuni */}
            <AdminHeader
              ownerName="Ibu Hj. Ratna Juwita"
              roleTitle="Pemilik Properti"
              showDatePicker={false}
              onOpenAnnouncement={() => {
                setPreviousTab(activeTab);
                setActiveTab("buat_pengumuman");
              }}
            />

            {/* Verifikasi Bukti Pembayaran Section */}
            <ProofVerificationPage
              onShowToast={showToast}
              onNavigateToBills={() => setActiveTab("tagihan")}
            />
          </>
        ) : activeTab === "tagihan" ? (
          <>
            {/* Top Header matching Images 1 & 2 */}
            <AdminHeader
              ownerName="Ibu Hj. Ratna Juwita"
              roleTitle="Pemilik Properti"
              showDatePicker={false}
              onOpenAnnouncement={() => {
                setPreviousTab(activeTab);
                setActiveTab("buat_pengumuman");
              }}
            />

            {/* Tagihan & Pembayaran Management */}
            <TagihanManagementWrapper
              onShowToast={showToast}
              onNavigateToProof={() => setActiveTab("verifikasi")}
            />
          </>
        ) : activeTab === "penghuni" ? (
          <>
            {/* Top Header matching Images 1, 2, 3, 4 */}
            <AdminHeader
              ownerName="Ibu Hj. Ratna Juwita"
              roleTitle="Pemilik Properti"
              showDatePicker={false}
              onOpenAnnouncement={() => {
                setPreviousTab(activeTab);
                setActiveTab("buat_pengumuman");
              }}
            />

            {/* Penghuni Section matching Images 1, 2, 3, 4 */}
            <PenghuniManagementSection
              onShowToast={showToast}
              onNavigateToVerification={() => setActiveTab("verifikasi")}
              initialSelectedTenantName={selectedTenantName}
            />
          </>
        ) : activeTab === "properti" ? (
          <>
            {/* Top Header without Date Picker */}
            <AdminHeader
              ownerName="Ibu Hj. Ratna Juwita"
              roleTitle="Pemilik Properti"
              showDatePicker={false}
              onOpenAnnouncement={() => {
                setPreviousTab(activeTab);
                setActiveTab("buat_pengumuman");
              }}
            />

            {/* Room Management Section */}
            <RoomManagementSection
              onShowToast={showToast}
              onViewTenantProfile={(tenantName) => {
                setSelectedTenantName(tenantName);
                setActiveTab("penghuni");
              }}
            />
          </>
        ) : (
          <>
            {/* Dasbor View */}
            <AdminHeader
              ownerName="Ibu Hj. Ratna Juwita"
              roleTitle="Pemilik Properti"
              showDatePicker={true}
              onOpenAnnouncement={() => setIsAnnouncementOpen(true)}
              onDownloadReport={handleDownloadReport}
            />

            {/* Top KPI Cards Row */}
            <KpiStats />

            {/* Two Columns Grid: Verifikasi Bukti (Left) & Kondisi Kamar (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
              <div className="xl:col-span-8">
                <PaymentVerificationSection
                  initialProofs={proofs.length > 0 ? proofs : undefined}
                  onApproveProof={handleApproveProof}
                  onRejectProof={handleRejectProof}
                />
              </div>

              <div className="xl:col-span-4">
                <RoomAvailabilitySection onManageRooms={() => setActiveTab("properti")} />
              </div>
            </div>

            {/* Bottom Section: Overdue Residents */}
            <OverdueResidentsSection />
          </>
        )}
      </div>

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        onSend={handleSendAnnouncement}
      />
    </div>
  );
}
