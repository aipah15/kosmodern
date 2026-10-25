"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutGrid,
  Shirt,
  Footprints,
  Home as HomeIcon,
  Clock,
  AlertTriangle,
  Info,
  Check,
  CheckCircle2,
  MoreVertical,
  Bed,
  Plus,
  ShieldCheck,
  Package,
  MessageCircle,
  Layers,
  Search,
  LogOut,
  Sparkles,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { portalService } from "@/modules/tenant-portal/services/portalService";
import { AREA_ZONES, AREA_ITEM_LIMIT_DAYS, areaItemMeta } from "@/modules/tenant-portal/areaItems";
import { toWaNumber } from "@/lib/utils/phone";

interface MyStorageItem {
  id: string;
  title: string;
  locationTag: string;
  locationColor: string;
  description: string;
  category: "all" | "jemuran" | "sepatu" | "teras";
  photoLabel: string;
  imageBg: string;
  statusType: "overdue" | "on_time" | "temp";
  statusTitle: string;
  statusSubtitle: string;
  daysActive: number;
}

export default function TenantMyStorageItemsPage() {
  const [filterCategory, setFilterCategory] = useState<"all" | "jemuran" | "sepatu" | "teras">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const portal = useTenantPortal();
  const { tenant, owner } = portal;

  const myItems: MyStorageItem[] = portal.areaItems
    .filter((a) => a.tenant_id === tenant.id)
    .map((a) => {
      const meta = areaItemMeta(a);
      const category: MyStorageItem["category"] =
        meta.category === "jemuran" ? "jemuran" : meta.category === "sepatu" ? "sepatu" : "teras";
      const statusType: MyStorageItem["statusType"] = meta.isOverdue ? "overdue" : meta.daysActive === 0 ? "on_time" : "temp";
      return {
        id: a.id,
        title: a.item_name,
        locationTag: a.zone_name,
        locationColor: meta.locationColor,
        description: a.note || "",
        category,
        photoLabel: a.photo_url ? "Foto" : a.zone_name,
        imageBg: meta.imageBg,
        statusType,
        statusTitle: meta.isOverdue
          ? "Melewati batas waktu"
          : meta.daysActive === 0
          ? "Tepat waktu"
          : "Dititipkan sementara",
        statusSubtitle: meta.isOverdue
          ? `Diletakkan ${meta.timeTag.toLowerCase()} • Harap segera diambil (batas ${AREA_ITEM_LIMIT_DAYS} hari)`
          : `Diletakkan ${meta.timeTag.toLowerCase()}`,
        daysActive: meta.daysActive,
      };
    });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => portal.logout();

  const handleCollect = async (id: string, title: string) => {
    try {
      await portalService.deleteAreaItem(id);
      await portal.refresh();
      showToast(`"${title}" berhasil ditandai sudah diambil & area telah bersih!`);
    } catch (err: any) {
      showToast(err?.message || "Gagal memperbarui data barang.");
    }
  };

  const filtered = myItems.filter((item) => {
    const matchCategory = filterCategory === "all" || item.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.title.toLowerCase().includes(q) ||
      item.locationTag.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  const overdueCount = myItems.filter((item) => item.statusType === "overdue").length;
  const onTimeCount = myItems.filter((item) => item.statusType === "on_time" || item.statusType === "temp").length;

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col justify-start relative overflow-x-hidden">
      {/* Ambient Top Glow */}
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
          href="/tenant/storage"
          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Kembali ke </span>Titipan Barang</span>
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

      {/* Sticky Header Navigasi */}
      <TenantHeader activeNav="penyimpanan" />

      {/* Kontainer Utama Responsif (Mobile, Tablet, Desktop PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                BARANG PRIBADI • KAMAR {tenant.room_number.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Area Bersama Kost Yusi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Barang Saya di Luar Kamar
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau seluruh barang milik Anda yang sedang ditaruh di jemuran, rak sepatu, atau teras kos.
            </p>
          </div>

          <Link
            href="/tenant/storage/new"
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Titip Barang Baru</span>
          </Link>
        </div>

        {/* Hero Metric Summary Card */}
        <div className="w-full bg-gradient-to-br from-indigo-900 via-[#4f46e5] to-indigo-700 rounded-3xl p-4 sm:p-6 text-white shadow-xl shadow-indigo-600/20 mb-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-200 bg-white/15 px-2.5 py-0.5 rounded-md border border-white/15 uppercase tracking-wider">
                RINGKASAN STATUS BARANG
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 leading-snug">
                {myItems.length} Barang Terdaftar di Luar Kamar
              </h2>
              <p className="text-xs text-indigo-100/90 mt-1 max-w-lg leading-relaxed">
                Demi kenyamanan bersama, harap segera mengambil barang ke kamar setelah kering atau selesai digunakan.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[75px] sm:min-w-[90px]">
                <span className="text-base sm:text-lg font-black block leading-none text-emerald-200">
                  {onTimeCount}
                </span>
                <span className="text-[10px] text-emerald-200 font-medium block mt-1">
                  Tepat Waktu
                </span>
              </div>

              {overdueCount > 0 && (
                <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-rose-500/30 backdrop-blur-md rounded-2xl border border-rose-300/40 text-center min-w-[75px] sm:min-w-[90px]">
                  <span className="text-base sm:text-lg font-black block leading-none text-rose-200">
                    {overdueCount}
                  </span>
                  <span className="text-[10px] text-rose-200 font-medium block mt-1">
                    Perlu Diambil
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI (Tablet: 1/2, Desktop: 8 kolom) */}
          <div className="md:col-span-1 lg:col-span-8 space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: "all", label: "Semua", icon: LayoutGrid, count: myItems.length },
                  { id: "jemuran", label: "Jemuran", icon: Shirt, count: myItems.filter((i) => i.category === "jemuran").length },
                  { id: "sepatu", label: "Rak Sepatu", icon: Footprints, count: myItems.filter((i) => i.category === "sepatu").length },
                  { id: "teras", label: "Teras Depan", icon: HomeIcon, count: myItems.filter((i) => i.category === "teras").length },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterCategory(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        filterCategory === tab.id
                          ? "bg-[#4f46e5] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          filterCategory === tab.id ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative shrink-0 sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari barang saya..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* List of Items */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900">Semua Barang Sudah Bersih!</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Tidak ada barang di luar kamar yang tercatat atas nama Anda. Semua area bersama rapi dan teratur.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/tenant/storage/new"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4f46e5] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Titipkan Barang Baru</span>
                    </Link>
                  </div>
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md ${
                      item.statusType === "overdue"
                        ? "border-rose-300 ring-2 ring-rose-500/10"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Photo Thumbnail */}
                      <div
                        className={`w-full sm:w-28 h-36 sm:h-28 rounded-2xl bg-gradient-to-br ${item.imageBg} border border-slate-200 overflow-hidden shrink-0 flex flex-col justify-between p-2 relative shadow-2xs`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${item.locationColor}`}
                          >
                            {item.locationTag}
                          </span>
                        </div>
                        <span className="bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-md w-fit">
                          {item.photoLabel}
                        </span>
                      </div>

                      {/* Info & Status */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Status Alert Banner */}
                        <div className="mt-3">
                          {item.statusType === "overdue" && (
                            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                              <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                              <div>
                                <strong className="text-rose-700 font-bold block">
                                  {item.statusTitle}
                                </strong>
                                <span className="text-[11px] text-rose-800 leading-relaxed">
                                  {item.statusSubtitle}
                                </span>
                              </div>
                            </div>
                          )}

                          {item.statusType === "on_time" && (
                            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                              <div>
                                <strong className="text-emerald-800 font-bold block">
                                  {item.statusTitle}
                                </strong>
                                <span className="text-[11px] text-emerald-700 leading-relaxed">
                                  {item.statusSubtitle}
                                </span>
                              </div>
                            </div>
                          )}

                          {item.statusType === "temp" && (
                            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-slate-700 flex items-start gap-2.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-100 text-[#4f46e5] flex items-center justify-center shrink-0 mt-0.5">
                                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                              <div>
                                <strong className="text-slate-900 font-bold block">
                                  {item.statusTitle}
                                </strong>
                                <span className="text-[11px] text-slate-600 leading-relaxed">
                                  {item.statusSubtitle}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action CTA */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">
                            Aktif selama: <strong>{item.daysActive} Hari</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCollect(item.id, item.title)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                            <span>Tandai Sudah Diambil</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* KOLOM KANAN / SIDEBAR (Tablet: 1/2, Desktop: 4 kolom) */}
          <div className="md:col-span-1 lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Widget 1: SOP & Ketentuan Barang Pribadi */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    SOP Barang Pribadi
                  </h4>
                  <p className="text-[10px] text-slate-400">Kost Yusi Management</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-[#4f46e5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="leading-relaxed">
                    Bila pakaian jemuran sudah kering, harap segera dipindahkan agar penghuni lain dapat menggunakan gantungan.
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-[#4f46e5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="leading-relaxed">
                    Barang yang melewati batas waktu <strong>3x24 jam</strong> akan dipindahkan pengelola ke pos sekuriti.
                  </span>
                </div>
              </div>
            </div>

            {/* Widget 2: Status Kapasitas Area */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 leading-tight">Barang per Area Bersama</h5>
                  <p className="text-[10px] text-slate-400">Jumlah titipan seluruh penghuni</p>
                </div>
              </div>

              <div className="space-y-3">
                {Object.values(AREA_ZONES).map((zone) => {
                  const count = portal.areaItems.filter((a) => a.zone_id === zone.zoneId).length;
                  const mine = portal.areaItems.filter((a) => a.zone_id === zone.zoneId && a.tenant_id === tenant.id).length;
                  return (
                    <div key={zone.zoneId} className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-700">{zone.zoneName}</span>
                      <span className="font-bold text-[#4f46e5]">
                        {count} barang{mine > 0 ? ` (${mine} milik Anda)` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Widget 3: Hotline WhatsApp Pemilik */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl p-5 border border-indigo-100 space-y-2.5 text-xs">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                BANTUAN PENGAWASAN
              </span>
              <p className="text-slate-600 leading-relaxed">
                Butuh bantuan pemutaran rekaman CCTV atau mencari barang yang tertukar? Hubungi <strong>{owner.name}</strong> via WhatsApp.
              </p>
              <a
                href={`https://wa.me/${toWaNumber(owner.phone)}?text=${encodeURIComponent(
                  `Halo Ibu ${owner.name}, saya ${tenant.full_name} dari Kamar ${tenant.room_number}. Ingin menanyakan perihal barang saya yang ada di area bersama ${owner.propertyName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp {owner.name} (Pemilik)</span>
              </a>
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
