"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  Plus,
  Wifi,
  Sparkles,
  Bed,
  Building2,
  Check,
  ChevronRight,
  Droplets,
  Zap,
  ArrowLeft,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  HelpCircle,
  Eye,
  Camera,
  ExternalLink,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { portalService } from "@/modules/tenant-portal/services/portalService";
import { formatDateIndo } from "@/lib/utils/date";

interface TenantMaintenanceTicket {
  id: string;
  ticketCode: string;
  title: string;
  location: string;
  locationType: "pribadi" | "umum";
  urgency: "urgent" | "medium" | "low";
  urgencyLabel: string;
  status: "baru" | "diproses" | "selesai";
  statusLabel: string;
  createdTime: string;
  estimatedArrival?: string;
  technicianName?: string;
  technicianPhone?: string;
  managerNote?: string;
  categoryIcon: "ac" | "wifi" | "air" | "listrik";
}

export default function TenantMaintenancePage() {
  const [activeTab, setActiveTab] = useState<"saya" | "area_umum">("saya");
  const [statusFilter, setStatusFilter] = useState<"semua" | "diproses" | "selesai">("semua");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const portal = useTenantPortal();
  const { tenant, owner } = portal;
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmFinish = async (ticketId: string, ticketCode: string) => {
    setConfirmingId(ticketId);
    try {
      await portalService.confirmTicketDone(ticketId, null, "");
      await portal.refresh();
      showToast(`Tiket ${ticketCode} berhasil dikonfirmasi selesai! Terima kasih, ${tenant.full_name.split(" ")[0]}.`);
    } catch (err: any) {
      showToast(err?.message || "Gagal mengonfirmasi tiket.");
    } finally {
      setConfirmingId(null);
    }
  };

  const iconFor = (title: string): TenantMaintenanceTicket["categoryIcon"] => {
    const t = title.toLowerCase();
    if (/(ac|pendingin|freon)/.test(t)) return "ac";
    if (/(wifi|wi-fi|internet|router|jaringan)/.test(t)) return "wifi";
    if (/(air|kran|pipa|bocor|wastafel|shower|toren|pompa)/.test(t)) return "air";
    return "listrik";
  };

  // Tiket diambil dari tabel maintenance_tickets (milik penghuni + laporan area umum)
  const tickets: TenantMaintenanceTicket[] = portal.tickets.map((t) => ({
    id: t.id,
    ticketCode: t.ticket_code,
    title: t.title,
    location: t.area_location || (t.location_type === "umum" ? "Area Umum" : `Kamar ${t.room_number}`),
    locationType: t.location_type === "umum" ? "umum" : "pribadi",
    urgency: t.urgency,
    urgencyLabel: t.urgency_label || (t.urgency === "urgent" ? "Urgensi Tinggi" : t.urgency === "medium" ? "Sedang" : "Ringan"),
    status: t.status === "ditolak" || t.status === "selesai" ? "selesai" : t.status,
    statusLabel:
      t.status_label ||
      (t.status === "selesai" ? "Selesai Dikerjakan" : t.status === "diproses" ? "Diproses Teknisi" : t.status === "ditolak" ? "Ditolak" : "Menunggu Respon"),
    createdTime: [t.created_date_str, t.created_time].filter(Boolean).join(", ") || formatDateIndo(t.created_at),
    estimatedArrival: t.estimated_arrival || undefined,
    technicianName: t.assigned_technician || undefined,
    managerNote: t.completion_note || undefined,
    categoryIcon: iconFor(t.title),
  }));

  const myTickets = tickets.filter((t) => t.locationType === "pribadi");
  const focusTicket = myTickets.find((t) => t.status === "diproses" || t.status === "baru") ?? null;
  const focusRaw = focusTicket ? portal.tickets.find((t) => t.id === focusTicket.id) : null;
  const inProgressCount = myTickets.filter((t) => t.status !== "selesai").length;
  const doneCount = myTickets.filter((t) => t.status === "selesai").length;

  const filteredTickets = tickets.filter((t) => {
    if (focusTicket && t.id === focusTicket.id && activeTab === "saya") return false;
    const matchTab = activeTab === "saya" ? t.locationType === "pribadi" : t.locationType === "umum";
    const matchStatus =
      statusFilter === "semua" ||
      (statusFilter === "diproses" && t.status === "diproses") ||
      (statusFilter === "selesai" && t.status === "selesai");
    return matchTab && matchStatus;
  });

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col justify-start relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-200/25 via-blue-100/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in duration-200 border border-white/10">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Demo Bar */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70 z-30 px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs gap-2">
        <Link
          href="/tenant"
          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Kembali ke </span>Beranda</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="hidden sm:inline-block text-[11px] text-slate-500">
            Penghuni: <strong>{tenant.full_name} (Kamar {tenant.room_number})</strong>
          </span>
          <Link
            href="/admin"
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-bold text-[11px] transition border border-indigo-100 shrink-0"
          >
            <span className="hidden sm:inline">Portal Pemilik</span>
            <span className="sm:hidden">Admin</span> →
          </Link>
        </div>
      </div>

      {/* Sticky Header Navigasi (Mobile compact, Tablet & Desktop Full Nav) */}
      <TenantHeader activeNav="laporan" />

      {/* Kontainer Utama yang Membedakan Mobile, Tablet, dan Desktop (PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                LAYANAN PERBAIKAN
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Respon Cepat SLA &lt; 3 Jam</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Lapor Kerusakan & Fasilitas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Laporkan kendala AC, air bocor, listrik, atau Wi-Fi untuk langsung dijadwalkan teknisi.
            </p>
          </div>

          <Link
            href="/tenant/maintenance/new"
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Buat Laporan Kendala</span>
          </Link>
        </div>

        {/* Hero Card: Status Penanganan & Quick CTA */}
        <div className="w-full bg-gradient-to-br from-indigo-900 via-[#4f46e5] to-indigo-700 rounded-3xl p-4 sm:p-6 text-white shadow-xl shadow-indigo-600/20 mb-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-200 bg-white/15 px-2.5 py-0.5 rounded-md border border-white/15 uppercase tracking-wider">
                KAMAR {tenant.room_number.toUpperCase()} • {tenant.floor.toUpperCase()}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 leading-snug">
                Pusat Bantuan & Perbaikan Kamar
              </h2>
              <p className="text-xs text-indigo-100/90 mt-1 max-w-lg leading-relaxed">
                Teknisi servis standby setiap hari pkl 08:00 - 18:00 WIB untuk menangani kerusakan fasilitas kos Anda.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[68px] sm:min-w-[85px]">
                <span className="text-base sm:text-lg font-black block leading-none">
                  {inProgressCount}
                </span>
                <span className="text-[10px] text-amber-200 font-medium block mt-1">
                  Diproses
                </span>
              </div>

              <div className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[68px] sm:min-w-[85px]">
                <span className="text-base sm:text-lg font-black block leading-none">
                  {doneCount}
                </span>
                <span className="text-[10px] text-emerald-200 font-medium block mt-1">
                  Selesai
                </span>
              </div>

              <Link
                href="/tenant/maintenance/new"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-[#4f46e5] hover:bg-slate-50 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Lapor Baru</span>
                <span className="sm:hidden">Lapor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TATA LETAK RESPONSIVE:
            - Mobile (< 768px): Alur linier ramah sentuhan, padding pas, tidak tertutup bottom nav
            - Tablet (768px - 1023px): 2 Kolom seimbang
            - PC / Desktop (>= 1024px): 12 Kolom lebar (8 Kolom Daftar + 4 Kolom Sidebar)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM UTAMA (Tablet: 1/2, Desktop: 8 kolom) */}
          <div className="md:col-span-1 lg:col-span-8 space-y-4">
            {/* Tabs: Laporan Kamar Saya vs Area Umum */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveTab("saya")}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "saya"
                    ? "bg-white text-[#4f46e5] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Kamar Saya ({tenant.room_number})</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "saya" ? "bg-indigo-50 text-[#4f46e5]" : "bg-slate-200 text-slate-700"
                }`}>
                  {myTickets.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("area_umum")}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "area_umum"
                    ? "bg-white text-[#4f46e5] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Fasilitas Bersama</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "area_umum" ? "bg-indigo-50 text-[#4f46e5]" : "bg-slate-200 text-slate-700"
                }`}>
                  {tickets.filter((t) => t.locationType === "umum").length}
                </span>
              </button>
            </div>

            {/* Filter Status Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
                Status:
              </span>
              {[
                { id: "semua", label: "Semua" },
                { id: "diproses", label: "Sedang Diproses" },
                { id: "selesai", label: "Selesai" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    statusFilter === pill.id
                      ? "bg-[#4f46e5] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* FOKUS TIKET: laporan terbaru yang masih berjalan */}
            {activeTab === "saya" && focusTicket && focusRaw && (statusFilter === "semua" || statusFilter === "diproses") && (
              <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-indigo-100 shadow-md shadow-indigo-600/5 space-y-3.5 relative">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-indigo-50 text-[#4f46e5] border border-indigo-200 uppercase tracking-wider">
                      FOKUS TIKET
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {focusTicket.ticketCode} • {focusTicket.createdTime}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border bg-amber-50 text-amber-700 border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>{focusTicket.statusLabel}</span>
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{focusTicket.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <span>{focusTicket.location}</span>
                      </span>
                      <span>•</span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 uppercase">
                        {focusTicket.urgencyLabel}
                      </span>
                    </div>
                  </div>
                  {focusRaw.photo_url && (
                    <a href={focusRaw.photo_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-2xl border border-slate-200 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={focusRaw.photo_url} alt="Foto laporan" className="w-full h-full object-cover" />
                    </a>
                  )}
                </div>

                <div className="p-3 sm:p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#4f46e5] flex items-center justify-center shrink-0 shadow-2xs border border-indigo-100">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block leading-tight">
                      Jadwal Kedatangan Teknisi:
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 block leading-tight mt-0.5">
                      {focusTicket.estimatedArrival || "Belum dijadwalkan"}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {focusTicket.technicianName || "Teknisi belum ditugaskan"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`https://wa.me/${
                      owner.phone.replace(/\D/g, "").startsWith("0")
                        ? "62" + owner.phone.replace(/\D/g, "").slice(1)
                        : owner.phone.replace(/\D/g, "")
                    }?text=${encodeURIComponent(
                      `Halo Ibu ${owner.name}, saya ${tenant.full_name} (Kamar ${tenant.room_number}) ingin menanyakan perkembangan laporan ${focusTicket.ticketCode}: ${focusTicket.title}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-99 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chat Ibu Kos</span>
                  </a>

                  <button
                    type="button"
                    disabled={confirmingId === focusTicket.id}
                    onClick={() => handleConfirmFinish(focusTicket.id, focusTicket.ticketCode)}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-99 cursor-pointer bg-[#4f46e5] hover:bg-indigo-700 text-white shadow-xs disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{confirmingId === focusTicket.id ? "Menyimpan..." : "Konfirmasi Selesai"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Riwayat Tiket Lainnya */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                Daftar Riwayat Perbaikan:
              </h3>

              {filteredTickets.length === 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 text-center text-xs text-slate-400">
                  Belum ada laporan pada kategori ini.
                </div>
              )}
              {filteredTickets.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.status === "selesai"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.categoryIcon === "ac" ? (
                        <Wind className="w-5 h-5" />
                      ) : item.categoryIcon === "wifi" ? (
                        <Wifi className="w-5 h-5" />
                      ) : item.categoryIcon === "air" ? (
                        <Droplets className="w-5 h-5" />
                      ) : (
                        <Zap className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {item.ticketCode}
                        </span>
                        <span className="text-[10px] text-slate-400">• {item.createdTime}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {item.location} • Teknisi: {item.technicianName || "-"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 border ${
                      item.status === "selesai"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {item.statusLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* KOLOM KANAN / SIDEBAR (Tablet: 1/2, Desktop: 4 kolom) */}
          <div className="md:col-span-1 lg:col-span-4 space-y-5">
            {/* Widget 1: Kontak Pengelola */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Kontak Pengelola</h4>
                  <p className="text-[10px] text-slate-400">{owner.propertyName}</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{owner.name}</span>
                  <span className="text-[11px] text-slate-500">Pemilik & Pengelola</span>
                </div>
                <a
                  href={`tel:${owner.phone.replace(/\D/g, "")}`}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100 transition flex items-center gap-1 border border-emerald-200"
                >
                  <Phone className="w-3 h-3" />
                  <span>Hubungi</span>
                </a>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
                Teknisi ditugaskan oleh pengelola; nama dan jadwalnya tampil pada tiket Anda.
              </div>
            </div>

            {/* Widget 2: Kebijakan Standar Respon (SLA) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Standar Waktu Penanganan (SLA)
                </h4>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <p>
                    <strong>Urgensi Tinggi (&lt; 3 Jam):</strong> AC bocor deras ke kasur, pipa air jebol, korsleting listrik.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <p>
                    <strong>Sedang (&lt; 24 Jam):</strong> Wi-Fi sering putus, kran wastafel menetes, lampu kamar redup.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <p>
                    <strong>Ringan (&lt; 48 Jam):</strong> Engsel lemari longgar, perbaikan gantungan baju.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navigasi Bawah Khusus Layar Ponsel (< 768px) */}
      <TenantBottomNav
        activeTab="laporan"
        onChangeTab={(tab) => {
          if (tab === "beranda") window.location.href = "/tenant";
          else if (tab === "tagihan") window.location.href = "/tenant/bills";
          else if (tab === "penyimpanan") window.location.href = "/tenant/storage";
          else if (tab === "makanan") window.location.href = "/tenant/food";
        }}
      />
    </div>
  );
}

function Wind(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}
