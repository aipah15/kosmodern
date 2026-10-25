"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  AlertTriangle,
  Clock,
  MessageCircle,
  CheckCircle2,
  Check,
  ShieldCheck,
  Sparkles,
  Calendar,
  User,
  HelpCircle,
  ChevronRight,
  Flame,
  Info,
  Archive,
  ArrowLeft,
  LogOut,
  Search,
  Filter,
  Snowflake,
  Layers,
  Apple,
  Coffee,
  Refrigerator,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { portalService, daysUntil } from "@/modules/tenant-portal/services/portalService";
import { formatDateIndo } from "@/lib/utils/date";
import { toWaNumber } from "@/lib/utils/phone";

interface FoodItem {
  id: string;
  name: string;
  quantityNote: string;
  portionBadge?: string;
  locationTag: string;
  locationType: "pintu" | "tengah" | "bawah" | "atas" | "freezer";
  dateIn: string;
  dateExp: string;
  ownerName: string;
  ownerRoom: string;
  ownerPhone: string;
  isMine: boolean;
  status: "expired" | "urgent" | "safe";
  statusText: string;
  statusBadge: string;
  photoUrl: string;
  alertNote?: string;
}

export default function TenantFoodPage() {
  const [mainTab, setMainTab] = useState<"semua" | "milik_saya">("milik_saya");
  const [statusFilter, setStatusFilter] = useState<"all" | "safe" | "urgent" | "expired">("all");
  const [shelfFilter, setShelfFilter] = useState<"all" | "freezer" | "tengah" | "bawah" | "pintu">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const portal = useTenantPortal();
  const { tenant, owner } = portal;

  const items: FoodItem[] = portal.fridgeItems.map((f) => {
    const d = daysUntil(f.expiry_date);
    let status: FoodItem["status"];
    if (d !== null) status = d < 0 ? "expired" : d <= 1 ? "urgent" : "safe";
    else status = f.status === "expired" ? "expired" : f.status === "warning" ? "urgent" : "safe";
    const statusText =
      d === null
        ? f.status_label
        : d < 0
        ? "Sudah Kadaluarsa"
        : d === 0
        ? "Kadaluarsa Hari Ini"
        : d === 1
        ? "Besok Exp"
        : `Aman (${d} Hari)`;
    const statusBadge = d === null ? f.status_label : d < 0 ? `Lewat ${Math.abs(d)} Hari` : d === 0 ? "Hari Ini" : `${d} Hari Lagi`;
    const entry = f.entry_date && !isNaN(new Date(f.entry_date).getTime()) ? formatDateIndo(f.entry_date) : f.entry_date || "-";
    return {
      id: f.id,
      name: f.item_name,
      quantityNote: f.quantity_note || "",
      portionBadge: undefined,
      locationTag: f.storage_location,
      locationType: ((f.shelf_type as FoodItem["locationType"]) || "tengah"),
      dateIn: entry,
      dateExp: f.expiry_date ? formatDateIndo(f.expiry_date) : "-",
      ownerName: f.tenant_name,
      ownerRoom: `Kamar ${f.room_number}`,
      ownerPhone: f.tenant_phone || "",
      isMine: f.tenant_id === tenant.id,
      status,
      statusText,
      statusBadge,
      photoUrl: f.photo_url || "",
      alertNote: f.notes || undefined,
    };
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleLogout = () => portal.logout();

  const handleTakeItem = async (id: string, name: string) => {
    try {
      await portalService.deleteFridgeItem(id);
      await portal.refresh();
      showToast(`"${name}" berhasil ditandai sudah diambil & dikonsumsi.`);
    } catch (err: any) {
      showToast(err?.message || "Gagal memperbarui kulkas.");
    }
  };

  const myItemsCount = items.filter((i) => i.isMine).length;
  const urgentCount = items.filter((i) => i.status === "urgent").length;
  const expiredCount = items.filter((i) => i.status === "expired").length;

  // Filter items
  const displayedItems = items.filter((item) => {
    if (mainTab === "milik_saya" && !item.isMine) return false;

    if (statusFilter === "safe" && item.status !== "safe") return false;
    if (statusFilter === "urgent" && item.status !== "urgent") return false;
    if (statusFilter === "expired" && item.status !== "expired") return false;

    if (shelfFilter !== "all" && item.locationType !== shelfFilter) return false;

    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.name.toLowerCase().includes(q) ||
      item.locationTag.toLowerCase().includes(q) ||
      item.ownerName.toLowerCase().includes(q) ||
      item.ownerRoom.toLowerCase().includes(q) ||
      item.quantityNote.toLowerCase().includes(q);

    return matchSearch;
  });

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col justify-start relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-200/25 via-blue-100/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Floating Toast Notification */}
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
      <TenantHeader activeNav="makanan" />

      {/* Kontainer Utama Responsif (Mobile, Tablet, Desktop PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                DAPUR BERSAMA • KULKAS BERSAMA
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Steril Tiap Minggu</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Kulkas Bersama &amp; Makanan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau makanan simpanan, cegah kadaluarsa, dan jaga kebersihan unit pendingin dapur komunal.
            </p>
          </div>

          <Link
            href="/tenant/food/new"
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Simpan Makanan Baru</span>
          </Link>
        </div>

        {/* Hero Card: Status Kulkas Bersama & Quick Metrics */}
        <div className="w-full bg-gradient-to-br from-indigo-900 via-[#4f46e5] to-indigo-700 rounded-3xl p-4 sm:p-6 text-white shadow-xl shadow-indigo-600/20 mb-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-200 bg-white/15 px-2.5 py-0.5 rounded-md border border-white/15 uppercase tracking-wider">
                PAPAN INVENTARIS KULKAS
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 leading-snug">
                Unit Pendingin Dapur Komunal
              </h2>
              <p className="text-xs text-indigo-100/90 mt-1 max-w-lg leading-relaxed">
                Setiap makanan wajib diberi label nama penghuni &amp; nomor kamar. Makanan tanpa nama atau lewat kadaluarsa akan disortir rutin tiap Minggu.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[68px] sm:min-w-[85px]">
                <span className="text-base sm:text-lg font-black block leading-none">
                  {myItemsCount}
                </span>
                <span className="text-[10px] text-emerald-200 font-medium block mt-1">
                  Milik Anda
                </span>
              </div>

              <div className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[68px] sm:min-w-[85px]">
                <span className="text-base sm:text-lg font-black block leading-none text-amber-300">
                  {urgentCount}
                </span>
                <span className="text-[10px] text-amber-200 font-medium block mt-1">
                  ≤ 2 Hari Exp
                </span>
              </div>

              <Link
                href="/tenant/food/new"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-[#4f46e5] hover:bg-slate-50 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Simpan Makanan</span>
                <span className="sm:hidden">Simpan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Alert Banner SOP Pembersihan */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 mb-5 flex items-start gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <strong className="text-amber-950 font-bold block">
                Jadwal Sterilisasi Kulkas: Setiap Minggu Pukul 20:00 WIB
              </strong>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                Piket Rutin
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">
              Harap beri label nama &amp; tanggal masuk. Makanan yang sudah basi atau melewati tanggal kadaluarsa saat pembersihan akan dibuang oleh petugas demi kebersihan &amp; higienitas bersama.
            </p>
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
            {/* Segmented Tab: Milik Saya vs Semua Barang */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setMainTab("milik_saya")}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mainTab === "milik_saya"
                    ? "bg-[#4f46e5] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Makanan Saya</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    mainTab === "milik_saya" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {myItemsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMainTab("semua")}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mainTab === "semua"
                    ? "bg-[#4f46e5] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Semua Barang Kos</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    mainTab === "semua" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {items.length}
                </span>
              </button>
            </div>

            {/* Filter Pills: Rak & Status + Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              {/* Row 1: Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
                  STATUS:
                </span>
                {[
                  { id: "all", label: "Semua", dot: "bg-slate-400" },
                  { id: "safe", label: "Aman", dot: "bg-emerald-500" },
                  { id: "urgent", label: "≤ 2 Hari", dot: "bg-amber-500" },
                  { id: "expired", label: "Kadaluarsa", dot: "bg-rose-500" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusFilter(s.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      statusFilter === s.id
                        ? "bg-[#4f46e5] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        statusFilter === s.id ? "bg-white" : s.dot
                      }`}
                    />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>

              {/* Row 2: Shelf Filter + Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
                    RAK:
                  </span>
                  {[
                    { id: "all", label: "Semua Rak" },
                    { id: "tengah", label: "Tengah" },
                    { id: "freezer", label: "Freezer" },
                    { id: "bawah", label: "Bawah" },
                    { id: "pintu", label: "Pintu" },
                  ].map((sh) => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => setShelfFilter(sh.id as any)}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer shrink-0 ${
                        shelfFilter === sh.id
                          ? "bg-indigo-50 text-[#4f46e5] border border-indigo-200 font-bold"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>

                <div className="relative shrink-0 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari makanan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* List of Food Items */}
            <div className="space-y-3.5">
              {displayedItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center space-y-2 border border-slate-100">
                  <Refrigerator className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Tidak ada makanan ditemukan</h4>
                  <p className="text-xs text-slate-400">
                    Coba sesuaikan filter status, rak kulkas, atau kata kunci pencarian Anda.
                  </p>
                </div>
              ) : (
                displayedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md ${
                      item.status === "expired"
                        ? "border-rose-200 ring-2 ring-rose-500/10"
                        : item.status === "urgent"
                        ? "border-amber-200 ring-2 ring-amber-500/10"
                        : item.isMine
                        ? "border-indigo-200 ring-2 ring-indigo-500/10"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-3.5">
                      {/* Photo Thumbnail */}
                      <div className="relative w-full sm:w-24 h-36 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/90 shadow-2xs">
                        {item.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-semibold">
                            Tanpa foto
                          </div>
                        )}
                        {item.portionBadge && (
                          <span className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                            {item.portionBadge}
                          </span>
                        )}
                        <span
                          className={`absolute bottom-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs ${
                            item.status === "expired"
                              ? "bg-rose-600 text-white"
                              : item.status === "urgent"
                              ? "bg-amber-500 text-slate-900"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {item.statusBadge}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 min-w-0 w-full">
                        {/* Tags Row */}
                        <div className="flex items-center justify-between gap-1 flex-wrap mb-1">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider uppercase bg-indigo-50 text-[#4f46e5] border border-indigo-200 flex items-center gap-1">
                            <Refrigerator className="w-3 h-3" />
                            <span>{item.locationTag}</span>
                          </span>

                          <span
                            className={`text-[10px] font-semibold flex items-center gap-1 ${
                              item.status === "expired"
                                ? "text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-bold"
                                : item.status === "urgent"
                                ? "text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold"
                                : "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{item.statusText}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug mt-1">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.quantityNote}</p>

                        {/* User Identity & Dates */}
                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${
                                item.isMine ? "bg-[#4f46e5]" : "bg-slate-600"
                              }`}
                            >
                              {item.ownerName[0]}
                            </div>
                            <span>
                              {item.ownerName} ({item.ownerRoom})
                            </span>
                            {item.isMine && (
                              <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 px-1.5 py-0.2 rounded-md border border-indigo-200">
                                Anda
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400">
                            <span>Masuk: {item.dateIn}</span>
                            <span className="mx-1">•</span>
                            <span
                              className={`font-semibold ${
                                item.status === "expired"
                                  ? "text-rose-600"
                                  : item.status === "urgent"
                                  ? "text-amber-600"
                                  : "text-slate-600"
                              }`}
                            >
                              Exp: {item.dateExp}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {item.alertNote || (item.isMine ? "Tersimpan di kulkas Anda" : `Kontak: ${item.ownerName}`)}
                      </span>

                      {item.isMine ? (
                        <button
                          type="button"
                          onClick={() => handleTakeItem(item.id, item.name)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                          <span>Sudah Diambil / Habis</span>
                        </button>
                      ) : (
                        <a
                          href={`https://wa.me/${toWaNumber(item.ownerPhone)}?text=${encodeURIComponent(
                            `Halo Kak ${item.ownerName}, saya ${tenant.full_name} (Kamar ${tenant.room_number}). Ingin bertanya tentang makanan "${item.name}" di kulkas bersama (${item.locationTag}). Terima kasih ya!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-indigo-200 transition active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Hubungi via WA</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* KOLOM KANAN / SIDEBAR (Tablet: 1/2, Desktop: 4 kolom) */}
          <div className="md:col-span-1 lg:col-span-4 space-y-5">
            {/* Widget 1: Denah Pembagian Rak Kulkas */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
                  <Refrigerator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Denah Rak Kulkas Bersama
                  </h4>
                  <p className="text-[10px] text-slate-400">Unit Dapur Bersama Kost Yusi</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Freezer */}
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-4 h-4 text-sky-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Freezer Beku (-18°C)</span>
                      <span className="text-[11px] text-slate-500">Nugget, Daging, Es Batu</span>
                    </div>
                  </div>
                  <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 text-[10px]">
                    Atas
                  </span>
                </div>

                {/* Chiller Tengah */}
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Chiller Tengah (4°C)</span>
                      <span className="text-[11px] text-slate-500">Lauk Matang, Yogurt, Keju</span>
                    </div>
                  </div>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 text-[10px]">
                    Tengah
                  </span>
                </div>

                {/* Rak Bawah */}
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Apple className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Crisper Sayur &amp; Buah</span>
                      <span className="text-[11px] text-slate-500">Sayuran Segar, Buah, Telur</span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                    Bawah
                  </span>
                </div>

                {/* Pintu Kulkas */}
                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Rak Pintu Samping</span>
                      <span className="text-[11px] text-slate-500">Susu UHT, Saus, Selai</span>
                    </div>
                  </div>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                    Pintu
                  </span>
                </div>
              </div>
            </div>

            {/* Widget 2: Ketentuan & Tata Tertib Kulkas */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-slate-900">SOP Kulkas Bersama</h5>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Wajib
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Wadah Tertutup:</strong> Simpan makanan di kotak makan/Tupperware/Ziplock tertutup rapat agar aroma tidak bercampur.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Pelabelan Jelas:</strong> Tulis nama dan nomor kamar menggunakan spidol/selotip label yang telah disediakan di samping kulkas.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Dilarang Bau Menyengat:</strong> Makanan seperti durian atau terasi matang dilarang disimpan di kulkas bersama.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href={`https://wa.me/${toWaNumber(owner.phone)}?text=${encodeURIComponent(
                    `Halo Ibu ${owner.name}, saya ${tenant.full_name} (Kamar ${tenant.room_number}). Ingin mengabarkan perihal kondisi kulkas bersama.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-200/70"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lapor Kendala ke Pengelola</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navigasi Bawah Khusus Layar Ponsel (< 768px) */}
      <TenantBottomNav
        activeTab="makanan"
        onChangeTab={(tab) => {
          if (tab === "beranda") window.location.href = "/tenant";
          else if (tab === "tagihan") window.location.href = "/tenant/bills";
          else if (tab === "laporan") window.location.href = "/tenant/maintenance";
          else if (tab === "penyimpanan") window.location.href = "/tenant/storage";
          else if (tab === "makanan") window.location.href = "/tenant/food";
        }}
      />
    </div>
  );
}
