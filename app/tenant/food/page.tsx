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
} from "lucide-react";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [items, setItems] = useState<FoodItem[]>([
    // Barang Milik Saya (Azka)
    {
      id: "food-mine-1",
      name: "Susu UHT Full Cream 1L",
      quantityNote: "1 Liter, sisa 1/2 kotak",
      portionBadge: "Sisa 1/2",
      locationTag: "Rak Pintu Kanan Atas",
      locationType: "pintu",
      dateIn: "1 Oktober 2026",
      dateExp: "18 Oktober 2026",
      ownerName: "Azka Andya",
      ownerRoom: "Kamar B-04",
      ownerPhone: "081288219920",
      isMine: true,
      status: "urgent",
      statusText: "Besok Exp",
      statusBadge: "1 Hari Lagi",
      photoUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
      alertNote: "Habiskan segera!",
    },
    {
      id: "food-mine-2",
      name: "Yogurt Blueberry Cup",
      quantityNote: "2 Cup kemasan utuh",
      portionBadge: "2 Cup",
      locationTag: "Chiller Tengah Rak 2",
      locationType: "tengah",
      dateIn: "17 Oktober 2026",
      dateExp: "23 Oktober 2026",
      ownerName: "Azka Andya",
      ownerRoom: "Kamar B-04",
      ownerPhone: "081288219920",
      isMine: true,
      status: "safe",
      statusText: "Aman (6 Hari)",
      statusBadge: "6 Hari Lagi",
      photoUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
      alertNote: "Label nama: Azka (B-04)",
    },
    {
      id: "food-mine-3",
      name: "Ayam Ungkep Bumbu",
      quantityNote: "1 Box Tupperware kaca",
      portionBadge: "1 Kotak",
      locationTag: "Freezer Kotak B-04",
      locationType: "freezer",
      dateIn: "5 Oktober 2026",
      dateExp: "20 Oktober 2026",
      ownerName: "Azka Andya",
      ownerRoom: "Kamar B-04",
      ownerPhone: "081288219920",
      isMine: true,
      status: "safe",
      statusText: "Aman (3 Hari)",
      statusBadge: "3 Hari Lagi",
      photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
      alertNote: "Label nama: Azka (B-04)",
    },
    // Barang Penghuni Lain
    {
      id: "food-other-1",
      name: "Susu UHT Full Cream",
      quantityNote: "1 Liter, sisa 1/2 kotak",
      locationTag: "PINTU KULKAS",
      locationType: "pintu",
      dateIn: "01 Okt 2026",
      dateExp: "15 Okt 2026",
      ownerName: "Rizka Salsabila",
      ownerRoom: "A-02",
      ownerPhone: "081299001122",
      isMine: false,
      status: "expired",
      statusText: "Sudah Kadaluarsa",
      statusBadge: "1 Hari Lalu",
      photoUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "food-other-2",
      name: "Yogurt Greek Strawberry",
      quantityNote: "2 Cup kemasan utuh",
      locationTag: "RAK TENGAH",
      locationType: "tengah",
      dateIn: "10 Okt 2026",
      dateExp: "18 Okt 2026",
      ownerName: "Salma",
      ownerRoom: "Kamar B-05",
      ownerPhone: "081299334455",
      isMine: false,
      status: "urgent",
      statusText: "Kadaluarsa 1 hari lagi",
      statusBadge: "1 Hari Lagi",
      photoUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "food-other-3",
      name: "Telur Ayam Omega",
      quantityNote: "6 Butir dalam box karton",
      locationTag: "RAK BAWAH",
      locationType: "bawah",
      dateIn: "1 Okt 2026",
      dateExp: "1 Nov 2026",
      ownerName: "Nia",
      ownerRoom: "Kamar A-03",
      ownerPhone: "081299556677",
      isMine: false,
      status: "safe",
      statusText: "Aman",
      statusBadge: "14 Hari Lagi",
      photoUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTakeItem = (id: string, name: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    showToast(`"${name}" berhasil ditandai sudah diambil & dikeluarkan dari kulkas.`);
  };

  // Filter items
  const displayedItems = items.filter((item) => {
    // Tab filter
    if (mainTab === "milik_saya" && !item.isMine) return false;

    // Status filter
    if (statusFilter === "safe" && item.status !== "safe") return false;
    if (statusFilter === "urgent" && item.status !== "urgent") return false;
    if (statusFilter === "expired" && item.status !== "expired") return false;

    return true;
  });

  const myItemsCount = items.filter((i) => i.isMine).length;
  const urgentCount = items.filter((i) => i.status === "urgent").length;

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden pb-24">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-indigo-200/35 via-blue-100/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-36 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container max-w-[430px] */}
      <div className="relative z-10 w-full max-w-[430px] px-4 sm:px-5 pt-3 flex flex-col">
        {/* Top App Brand (KOST YUSI) + Bell Icon */}
        <div className="flex items-center justify-between pt-1 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#eeeffe] text-[#4f46e5] flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 2H9c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 8h2v2H5V8zm0 4h2v2H5v-2zm0 4h2v2H5v-2zm14 4H9v-2h2v-2H9v-2h2v-2H9V8h2V6H9V4h10v16zm-6-12h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-8h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-wider text-[#4f46e5] uppercase">
              KOST YUSI
            </span>
          </div>

          <Link
            href="/tenant/notifications"
            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>

        {/* Hero Card: Kulkas Bersama (Image 2 & 3) */}
        <div className="bg-gradient-to-br from-[#eef2ff] via-[#f5f7ff] to-white rounded-3xl p-5 border border-indigo-100 shadow-2xs my-2 relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                Kulkas Bersama
              </h1>
              <p className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                Dapur Komunal KosModern • Unit Dingin Bersama
              </p>
            </div>

            <Link
              href="/tenant/food/new"
              className="py-2 px-3.5 bg-[#3848e0] hover:bg-[#2f3ec4] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Simpan Barang</span>
            </Link>
          </div>

          {/* 3 Metrics Row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-2.5 rounded-2xl bg-white border border-indigo-50 shadow-2xs text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-medium">Milik Anda</span>
                <Archive className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-lg font-extrabold text-[#3848e0] block leading-none">
                8
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#fff7ed] border border-orange-100 shadow-2xs text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-orange-600 font-medium">≤ 2 Hari Exp</span>
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <span className="text-lg font-extrabold text-orange-600 block leading-none">
                2
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#faf5ff] border border-purple-100 shadow-2xs text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-purple-700 font-bold uppercase">MINGGU</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <span className="text-[10px] font-medium text-slate-500 block leading-tight">
                Piket 20:00 WIB
              </span>
            </div>
          </div>
        </div>

        {/* Main Tabs Segmented Control: Barang Saya (8) vs Semua Barang (24) */}
        <div className="p-1 rounded-2xl bg-slate-100 flex items-center gap-1 my-3">
          <button
            type="button"
            onClick={() => setMainTab("milik_saya")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === "milik_saya"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Barang Saya</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                mainTab === "milik_saya"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              8
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab("semua")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mainTab === "semua"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Semua Barang</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                mainTab === "semua"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              24
            </span>
          </button>
        </div>

        {/* Sub-Filters: STATUS */}
        <div className="flex items-center gap-1.5 my-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider mr-1">
            STATUS:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-full font-semibold transition shrink-0 flex items-center gap-1 text-[11px] ${
              statusFilter === "all"
                ? "bg-indigo-50 text-[#3848e0] border border-indigo-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3848e0]" />
            <span>Semua</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("safe")}
            className={`px-3 py-1.5 rounded-full font-semibold transition shrink-0 flex items-center gap-1 text-[11px] ${
              statusFilter === "safe"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Aman</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("urgent")}
            className={`px-3 py-1.5 rounded-full font-semibold transition shrink-0 flex items-center gap-1 text-[11px] ${
              statusFilter === "urgent"
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>≤ 2 Hari</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("expired")}
            className={`px-3 py-1.5 rounded-full font-semibold transition shrink-0 flex items-center gap-1 text-[11px] ${
              statusFilter === "expired"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Kadaluarsa</span>
          </button>
        </div>

        {/* Card Feed */}
        <div className="space-y-4 my-3">
          {displayedItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                Tidak ada makanan dalam status ini.
              </p>
            </div>
          ) : (
            displayedItems.map((item) => {
              // Layout differ between "Barang Saya" (Image 3) and "Semua Barang" (Image 2)
              if (mainTab === "milik_saya") {
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs hover:shadow-xs transition relative"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Photo Thumbnail with Badge */}
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80">
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {item.portionBadge && (
                          <span className="absolute top-1 left-1 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            {item.portionBadge}
                          </span>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                            {item.name}
                          </h3>
                          {/* Expiry Pill */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                              item.status === "urgent"
                                ? "bg-amber-100 text-amber-800"
                                : item.status === "expired"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === "urgent"
                                  ? "bg-amber-500"
                                  : item.status === "expired"
                                  ? "bg-rose-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            <span>{item.statusText}</span>
                          </span>
                        </div>

                        {/* Location Tag */}
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1 font-medium">
                          <svg
                            className="w-3.5 h-3.5 text-indigo-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="5" y="2" width="14" height="20" rx="3" />
                            <line x1="5" y1="10" x2="19" y2="10" />
                          </svg>
                          <span className="text-indigo-600 font-medium">
                            {item.locationTag}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="text-[10px] text-slate-400">
                          <span>Masuk: {item.dateIn}</span>
                          <span className="mx-1">•</span>
                          <span className={item.status === "urgent" ? "text-amber-600 font-semibold" : ""}>
                            Batas: {item.dateExp}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                      {item.alertNote?.includes("Habiskan") ? (
                        <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.alertNote}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-indigo-600 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{item.alertNote}</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleTakeItem(item.id, item.name)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Tandai Sudah Diambil</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // Image 2 layout for "Semua Barang"
              return (
                <div
                  key={item.id}
                  className="rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-2xs transition hover:shadow-xs"
                >
                  {/* Top Colored Header Banner */}
                  <div
                    className={`px-4 py-2 flex items-center justify-between text-xs font-bold ${
                      item.status === "expired"
                        ? "bg-[#be123c] text-white"
                        : item.status === "urgent"
                        ? "bg-[#f59e0b] text-slate-900"
                        : "bg-[#dcfce7] text-emerald-800"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {item.status === "expired" && (
                        <AlertTriangle className="w-3.5 h-3.5 text-white" />
                      )}
                      {item.status === "urgent" && (
                        <Clock className="w-3.5 h-3.5 text-slate-900" />
                      )}
                      {item.status === "safe" && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                      <span>{item.statusText}</span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        item.status === "expired"
                          ? "bg-white/20 text-white"
                          : item.status === "urgent"
                          ? "bg-white/30 text-slate-900"
                          : "bg-emerald-200/60 text-emerald-800"
                      }`}
                    >
                      {item.statusBadge}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80">
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          {item.locationTag}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.quantityNote}
                        </p>
                      </div>
                    </div>

                    {/* Owner & Dates Row */}
                    <div className="bg-slate-50/80 rounded-2xl p-2.5 my-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] text-slate-400">Pemilik</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {item.ownerName} ({item.ownerRoom})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-1 mb-3">
                      <span className="text-slate-400">Masuk: {item.dateIn}</span>
                      <span
                        className={`font-bold ${
                          item.status === "expired"
                            ? "text-rose-600"
                            : item.status === "urgent"
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        Exp: {item.dateExp}
                      </span>
                    </div>

                    {/* Action Button: Hubungi via WA */}
                    <a
                      href={`https://wa.me/6281299887766?text=Halo%20Kak%20${encodeURIComponent(
                        item.ownerName
                      )},%20saya%20Azka%20Andya%20ingin%20menanyakan%20tentang%20makanan%20"${encodeURIComponent(
                        item.name
                      )}" di kulkas bersama (${encodeURIComponent(item.locationTag)}).`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-[#eef2ff] hover:bg-indigo-100 text-[#3848e0] text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-99"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Hubungi via WA</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Aturan Bersama Kulkas Komunal (Image 2 & 3) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-2xs my-2 flex items-start gap-3">
          <div className="w-8 h-8 rounded-2xl bg-indigo-50 text-[#3848e0] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-xs font-bold text-slate-900 block mb-0.5">
              Aturan Bersama Kulkas Komunal
            </strong>
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Selalu cantumkan nama & tanggal masuk. Makanan tanpa label dan yang telah kadaluarsa saat pembersihan <strong>Minggu pukul 20:00 WIB</strong> akan disortir oleh pengurus demi kebersihan kos.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Nav with Makanan Active */}
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
