"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Package,
  Plus,
  Lightbulb,
  Clock,
  MessageCircle,
  Check,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Camera,
  Shirt,
  Footprints,
  Coffee,
  HelpCircle,
  ArrowLeft,
  LogOut,
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { portalService } from "@/modules/tenant-portal/services/portalService";
import { areaItemMeta } from "@/modules/tenant-portal/areaItems";
import { toWaNumber } from "@/lib/utils/phone";

interface StorageItem {
  id: string;
  title: string;
  locationTag: string;
  locationCategory: "jemuran" | "sepatu" | "koridor" | "dapur" | "teras";
  locationColor: string;
  timeTag: string;
  isOverdue?: boolean;
  overdueTag?: string;
  userName: string;
  roomNumber: string;
  isMine: boolean;
  note: string;
  categoryIcon: "jemuran" | "sepatu" | "koridor" | "dapur";
  photoLabel?: string;
  imageBg: string;
  ownerPhone?: string;
  photoUrl?: string;
}

export default function TenantStoragePage() {
  const [activeCategory, setActiveCategory] = useState<
    "semua" | "milik_saya" | "jemuran" | "sepatu" | "koridor" | "dapur"
  >("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<StorageItem | null>(null);

  const portal = useTenantPortal();
  const { tenant, owner } = portal;

  const items: StorageItem[] = portal.areaItems.map((a) => {
    const meta = areaItemMeta(a);
    return {
      id: a.id,
      title: a.item_name,
      locationTag: a.zone_name,
      locationCategory: meta.category,
      locationColor: meta.locationColor,
      timeTag: meta.timeTag,
      isOverdue: meta.isOverdue,
      overdueTag: meta.isOverdue ? "Lewat Batas Waktu" : undefined,
      userName: a.tenant_name,
      roomNumber: `Kamar ${a.room_number}`,
      isMine: a.tenant_id === tenant.id,
      note: a.note || "",
      categoryIcon: meta.iconCategory,
      photoLabel: a.photo_url ? "1 Foto" : undefined,
      imageBg: meta.imageBg,
      ownerPhone: a.tenant_phone || undefined,
      photoUrl: a.photo_url || undefined,
    };
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleLogout = () => portal.logout();

  const handleCollectItem = async (id: string, title: string) => {
    try {
      await portalService.deleteAreaItem(id);
      await portal.refresh();
      showToast(`"${title}" berhasil ditandai sudah diambil.`);
    } catch (err: any) {
      showToast(err?.message || "Gagal memperbarui data barang.");
    }
  };

  const myItemsCount = items.filter((i) => i.isMine).length;
  const overdueCount = items.filter((i) => i.isOverdue).length;

  const filteredItems = items.filter((item) => {
    let matchCat = true;
    if (activeCategory === "milik_saya") matchCat = item.isMine;
    else if (activeCategory === "jemuran") matchCat = item.locationCategory === "jemuran";
    else if (activeCategory === "sepatu") matchCat = item.locationCategory === "sepatu";
    else if (activeCategory === "koridor")
      matchCat = item.locationCategory === "koridor" || item.locationCategory === "teras";
    else if (activeCategory === "dapur") matchCat = item.locationCategory === "dapur";

    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.title.toLowerCase().includes(q) ||
      item.locationTag.toLowerCase().includes(q) ||
      item.userName.toLowerCase().includes(q) ||
      item.roomNumber.toLowerCase().includes(q) ||
      item.note.toLowerCase().includes(q);

    return matchCat && matchSearch;
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
      <TenantHeader activeNav="penyimpanan" />

      {/* Kontainer Utama Responsif (Mobile, Tablet, Desktop PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                AREA BERSAMA KOS • LANTAI 1 &amp; 2
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Maks. 3x24 Jam</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Titipan Barang &amp; Area Jemuran
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau barang di luar kamar (jemuran, rak sepatu, teras, dapur) agar tertib dan saling terjaga.
            </p>
          </div>

          <Link
            href="/tenant/storage/new"
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Titipkan Barang Baru</span>
          </Link>
        </div>

        {/* Hero Card: Status Area Bersama & Quick Metrics */}
        <div className="w-full bg-gradient-to-br from-indigo-900 via-[#4f46e5] to-indigo-700 rounded-3xl p-4 sm:p-6 text-white shadow-xl shadow-indigo-600/20 mb-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-200 bg-white/15 px-2.5 py-0.5 rounded-md border border-white/15 uppercase tracking-wider">
                PAPAN MONITORING KOST YUSI
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 leading-snug">
                Papan Barang Bersama
              </h2>
              <p className="text-xs text-indigo-100/90 mt-1 max-w-lg leading-relaxed">
                Setiap barang wajib diberi keterangan durasi dan nama kamar. Segera simpan kembali ke kamar setelah kering atau selesai digunakan.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[68px] sm:min-w-[85px]">
                <span className="text-base sm:text-lg font-black block leading-none">
                  {items.length}
                </span>
                <span className="text-[10px] text-indigo-100 font-medium block mt-1">
                  Barang Aktif
                </span>
              </div>

              <div className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[68px] sm:min-w-[85px]">
                <span className="text-base sm:text-lg font-black block leading-none text-emerald-200">
                  {myItemsCount}
                </span>
                <span className="text-[10px] text-emerald-200 font-medium block mt-1">
                  Milik Anda
                </span>
              </div>

              <Link
                href="/tenant/storage/new"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-[#4f46e5] hover:bg-slate-50 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Titip Barang</span>
                <span className="sm:hidden">Titip</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tata Tertib Area Umum Alert Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 mb-5 flex items-start gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <strong className="text-amber-950 font-bold block">
                Aturan Kenyamanan Bersama (SOP Maksimal 3x24 Jam)
              </strong>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                Sortir Tiap Minggu
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">
              Barang di luar kamar yang melebihi batas 3 hari tanpa catatan izin akan dipindahkan sementara ke ruang pengurus pos keamanan oleh {owner.name} demi kerapian lorong.
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
            {/* Filter Pills & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
              {/* Category Pills Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: "semua", label: "Semua", count: items.length },
                  { id: "milik_saya", label: "Barang Saya", count: myItemsCount, dot: true },
                  { id: "jemuran", label: "Jemuran", count: items.filter((i) => i.locationCategory === "jemuran").length },
                  { id: "sepatu", label: "Rak Sepatu", count: items.filter((i) => i.locationCategory === "sepatu").length },
                  { id: "koridor", label: "Teras / Koridor", count: items.filter((i) => i.locationCategory === "koridor" || i.locationCategory === "teras").length },
                  { id: "dapur", label: "Dapur", count: items.filter((i) => i.locationCategory === "dapur").length },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setActiveCategory(pill.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      activeCategory === pill.id
                        ? "bg-[#4f46e5] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill.dot && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          activeCategory === pill.id ? "bg-white" : "bg-emerald-500"
                        }`}
                      />
                    )}
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        activeCategory === pill.id
                          ? "bg-white text-indigo-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative shrink-0 sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari barang, kamar, area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* List of Storage Items */}
            <div className="space-y-3.5">
              {filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center space-y-2 border border-slate-100">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Tidak ada barang titipan</h4>
                  <p className="text-xs text-slate-400">
                    Semua barang di area ini telah dirapikan atau cocokkan kata kunci pencarian Anda.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md ${
                      item.isOverdue
                        ? "border-rose-200 ring-2 ring-rose-500/10"
                        : item.isMine
                        ? "border-indigo-200 ring-2 ring-indigo-500/10"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-3.5">
                      {/* Photo Thumbnail */}
                      <div
                        style={item.photoUrl ? { backgroundImage: `url(${item.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                        className={`w-full sm:w-24 h-32 sm:h-24 rounded-2xl bg-gradient-to-br ${item.imageBg} border border-slate-200/90 overflow-hidden shrink-0 flex flex-col justify-between p-2 relative shadow-2xs`}
                      >
                        <div className="flex items-center justify-between">
                          {item.categoryIcon === "jemuran" && (
                            <div className="w-7 h-7 rounded-lg bg-white/90 text-[#4f46e5] flex items-center justify-center shadow-xs">
                              <Shirt className="w-4 h-4" />
                            </div>
                          )}
                          {item.categoryIcon === "sepatu" && (
                            <div className="w-7 h-7 rounded-lg bg-white/90 text-purple-700 flex items-center justify-center shadow-xs">
                              <Footprints className="w-4 h-4" />
                            </div>
                          )}
                          {item.categoryIcon === "dapur" && (
                            <div className="w-7 h-7 rounded-lg bg-white/90 text-emerald-700 flex items-center justify-center shadow-xs">
                              <Coffee className="w-4 h-4" />
                            </div>
                          )}
                          {item.categoryIcon === "koridor" && (
                            <div className="w-7 h-7 rounded-lg bg-white/90 text-amber-700 flex items-center justify-center shadow-xs">
                              <Package className="w-4 h-4" />
                            </div>
                          )}

                          {item.isOverdue && (
                            <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                              ⚠️ 3+ Hari
                            </span>
                          )}
                        </div>

                        {item.photoLabel && (
                          <span className="bg-slate-900/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md w-fit flex items-center gap-1 shadow-xs">
                            <Camera className="w-3 h-3" />
                            <span>{item.photoLabel}</span>
                          </span>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="flex-1 min-w-0 w-full">
                        {/* Tags Row */}
                        <div className="flex items-center justify-between gap-1 flex-wrap mb-1">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider uppercase border ${item.locationColor}`}
                          >
                            {item.locationTag}
                          </span>

                          <span
                            className={`text-[10px] font-semibold flex items-center gap-1 ${
                              item.isOverdue
                                ? "text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-bold"
                                : "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{item.timeTag}</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug mt-1">
                          {item.title}
                        </h3>

                        {/* User Identity */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                          <div
                            className={`w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${
                              item.isMine ? "bg-[#4f46e5]" : "bg-slate-600"
                            }`}
                          >
                            {item.userName[0]}
                          </div>
                          <span>
                            {item.userName} • <strong>{item.roomNumber}</strong>
                          </span>
                          {item.isMine && (
                            <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 px-2 py-0.2 rounded-md border border-indigo-200">
                              Milik Anda
                            </span>
                          )}
                        </div>

                        {/* Note Quote Box */}
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 mt-2 leading-relaxed">
                          <span className="italic">"{item.note}"</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {item.isMine ? "Barang terdaftar atas nama Anda" : `Kontak: ${item.userName}`}
                      </span>

                      {item.isMine ? (
                        <button
                          type="button"
                          onClick={() => handleCollectItem(item.id, item.title)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                          <span>Sudah Diambil &amp; Bersih</span>
                        </button>
                      ) : (
                        <a
                          href={`https://wa.me/${toWaNumber(item.ownerPhone)}?text=${encodeURIComponent(
                            `Halo Kak ${item.userName}, saya ${tenant.full_name} (Kamar ${tenant.room_number}). Ingin menanyakan perihal titipan "${item.title}" di area ${item.locationTag}. Terima kasih ya!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-indigo-200 transition active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat Pemilik via WA</span>
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
            {/* Widget 1: Kapasitas & Status Area Titipan */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Barang per Area
                  </h4>
                  <p className="text-[10px] text-slate-400">{owner.propertyName}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { label: "Jemuran", match: (c: string) => c === "jemuran" },
                  { label: "Rak Sepatu", match: (c: string) => c === "sepatu" },
                  { label: "Teras / Koridor", match: (c: string) => c === "teras" || c === "koridor" },
                  { label: "Dapur Bersama", match: (c: string) => c === "dapur" },
                ].map((zone) => (
                  <div key={zone.label} className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{zone.label}</span>
                    <span className="font-bold text-indigo-600">
                      {items.filter((i) => zone.match(i.locationCategory)).length} barang
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Ketentuan & Tata Tertib 3x24 Jam */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-slate-900">SOP Area Umum Kost</h5>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Aktif
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Batas Penjemuran:</strong> Pakaian yang sudah kering harap segera diangkat dalam waktu <strong>maksimal 1x24 jam</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Paket Belanja Online:</strong> Kurir meletakkan paket di meja teras. Harap segera diambil begitu tiba di kos.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Pembersihan Berkala:</strong> Petugas kos melakukan sterilisasi area bersama setiap <strong>Sabtu pagi pukul 09:00 WIB</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href={`https://wa.me/${toWaNumber(owner.phone)}?text=${encodeURIComponent(
                    `Halo Ibu ${owner.name}, saya ${tenant.full_name} (Kamar ${tenant.room_number}). Ingin bertanya perihal izin meletakkan barang sementara di area bersama.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-200/70"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Izin Khusus ke Pengelola</span>
                </a>
              </div>
            </div>

            {/* Widget 3: Layanan Cepat Kos Yusi */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl p-5 border border-indigo-100 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                INFO FASILITAS
              </span>
              <h5 className="font-bold text-slate-900 text-sm">
                Kehilangan atau Salah Ambil?
              </h5>
              <p className="text-slate-600 leading-relaxed">
                Area lorong, teras, dan jemuran telah dipantau kamera CCTV 24 jam. Jika terjadi kendala atau barang tertukar, Anda dapat meminta pemutaran rekaman CCTV kepada pengurus kos.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Navigasi Bawah Khusus Layar Ponsel (< 768px) */}
      <TenantBottomNav
        activeTab="penyimpanan"
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
