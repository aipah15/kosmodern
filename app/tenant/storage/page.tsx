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
} from "lucide-react";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";

interface StorageItem {
  id: string;
  title: string;
  locationTag: string;
  locationColor: string;
  timeTag: string;
  isOverdue?: boolean;
  overdueTag?: string;
  userName: string;
  roomNumber: string;
  isMine: boolean;
  note: string;
  category: "jemuran" | "sepatu" | "koridor" | "dapur" | "teras";
  photoLabel?: string;
  imageBg: string;
}

export default function TenantStoragePage() {
  const [activeFilter, setActiveFilter] = useState<"semua" | "milik_saya">("semua");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [items, setItems] = useState<StorageItem[]>([
    {
      id: "item-1",
      title: "Jemuran Sprei Motif Bunga",
      locationTag: "Jemuran Lt. 2",
      locationColor: "bg-indigo-50 text-[#3848e0]",
      timeTag: "4 Jam lalu",
      userName: "Azka Andya",
      roomNumber: "Kamar B-04",
      isMine: true,
      note: "Sedang dijemur hingga kering",
      category: "jemuran",
      photoLabel: "1 Foto",
      imageBg: "from-blue-200 to-indigo-200",
    },
    {
      id: "item-2",
      title: "Sepatu Lari Nike Pegasus",
      locationTag: "Rak Sepatu Depan",
      locationColor: "bg-purple-50 text-purple-700",
      timeTag: "1 hari (s/d besok)",
      userName: "Riana",
      roomNumber: "Kamar A-01",
      isMine: false,
      note: "Baru selesai dicuci basah, diangin-anginkan...",
      category: "sepatu",
      imageBg: "from-amber-200 to-orange-200",
    },
    {
      id: "item-3",
      title: "Paket Kardus Shopee Besar",
      locationTag: "Teras Koridor B",
      locationColor: "bg-rose-50 text-rose-600",
      timeTag: "3+ Hari",
      isOverdue: true,
      overdueTag: "Lewat Batas",
      userName: "Nia",
      roomNumber: "Kamar A-02",
      isMine: false,
      note: "Lagi dinas luar kota, diambil lusa...",
      category: "koridor",
      imageBg: "from-rose-200 to-pink-200",
    },
    {
      id: "item-4",
      title: "Helm KYT Hitam Doff",
      locationTag: "Rak Sepatu Depan",
      locationColor: "bg-purple-50 text-purple-700",
      timeTag: "2 Jam lalu",
      userName: "Azka Andya",
      roomNumber: "Kamar B-04",
      isMine: true,
      note: "Ditaruh sebentar nunggu kurir jemput...",
      category: "sepatu",
      imageBg: "from-slate-700 to-slate-900",
    },
    {
      id: "item-5",
      title: "Wajan Teflon & Spatula Kayu",
      locationTag: "Dapur Bersama Lt. 1",
      locationColor: "bg-indigo-50 text-[#3848e0]",
      timeTag: "5 Jam lalu",
      userName: "Sarah",
      roomNumber: "Kamar B-02",
      isMine: false,
      note: "Sudah dicuci bersih, ditaruh di rak pengering...",
      category: "dapur",
      imageBg: "from-emerald-200 to-teal-300",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCollectItem = (id: string, title: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast(`"${title}" berhasil ditandai sudah diambil & dirapikan.`);
  };

  const myItemsCount = items.filter((i) => i.isMine).length;
  const filteredItems = activeFilter === "milik_saya" ? items.filter((i) => i.isMine) : items;

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden pb-24">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-indigo-200/35 via-blue-100/25 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Floating Toast */}
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

        {/* Hero Card: Papan Barang Bersama (Image 3) */}
        <div className="bg-gradient-to-br from-[#eef2ff] via-[#f5f7ff] to-white rounded-3xl p-5 border border-indigo-100 shadow-2xs my-2 relative">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                Papan Barang Bersama
              </h1>
              <p className="text-xs text-slate-500 font-normal leading-relaxed mt-1 max-w-[280px]">
                Pantau dan rapikan barang yang diletakkan sementara di area umum kos agar tetap tertib dan nyaman bersama.
              </p>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-indigo-100/90 text-[#3848e0] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          {/* 3 Metrics Row */}
          <div className="grid grid-cols-3 gap-2 my-3.5">
            <div className="p-2.5 rounded-2xl bg-white border border-indigo-50 text-center shadow-2xs">
              <span className="text-base font-extrabold text-[#3848e0] block leading-none">
                12
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                Barang Aktif
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-indigo-50 text-center shadow-2xs">
              <span className="text-base font-extrabold text-slate-900 block leading-none flex items-center justify-center gap-1">
                <span>{myItemsCount}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                Milik Anda
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white border border-indigo-50 text-center shadow-2xs">
              <span className="text-base font-extrabold text-amber-500 block leading-none">
                3 Hari
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                Batas Waktu
              </span>
            </div>
          </div>

          {/* CTA: + Tambah Barang di Luar Kamar */}
          <Link
            href="/tenant/storage/new"
            className="w-full py-3 bg-[#3848e0] hover:bg-[#2f3ec4] text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition active:scale-99"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Barang di Luar Kamar</span>
          </Link>
        </div>

        {/* Tata Tertib Area Umum Alert */}
        <div className="p-3.5 rounded-2xl bg-[#fffbeb] border border-amber-200/70 my-2 flex items-start gap-2.5 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-amber-900 font-bold block mb-0.5">
              Tata Tertib Area Umum
            </strong>
            <span className="text-slate-600">
              Barang maksimal 3x24 jam di luar kamar. Beri catatan agar tetangga kos dapat saling menjaga.
            </span>
          </div>
        </div>

        {/* Filter Pills: Semua (12) vs Barang Saya (3) */}
        <div className="flex items-center gap-2 my-2.5">
          <button
            type="button"
            onClick={() => setActiveFilter("semua")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              activeFilter === "semua"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            Semua (12)
          </button>

          <Link
            href="/tenant/storage/my-items"
            className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === "milik_saya"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Barang Saya ({myItemsCount})</span>
          </Link>
        </div>

        {/* Feed List of Cards */}
        <div className="space-y-3.5 my-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs transition-all hover:shadow-xs relative"
            >
              <div className="flex items-start gap-3">
                {/* Photo Thumbnail */}
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.imageBg} border border-slate-200 overflow-hidden shrink-0 flex flex-col justify-end p-1.5 relative shadow-2xs`}
                >
                  {item.isOverdue && (
                    <span className="absolute top-1 left-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                      ⚠️ 3+ Hari
                    </span>
                  )}
                  {item.photoLabel && (
                    <span className="bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md w-fit flex items-center gap-0.5">
                      <Camera className="w-2.5 h-2.5" />
                      <span>{item.photoLabel}</span>
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  {/* Tags Row */}
                  <div className="flex items-center justify-between gap-1 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase ${item.locationColor}`}
                    >
                      {item.locationTag}
                    </span>

                    <span
                      className={`text-[10px] font-semibold flex items-center gap-1 ${
                        item.isOverdue
                          ? "text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md"
                          : "text-emerald-600"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{item.timeTag}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  {/* User info */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
                    <div
                      className={`w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${
                        item.isMine ? "bg-[#3848e0]" : "bg-purple-600"
                      }`}
                    >
                      {item.userName[0]}
                    </div>
                    <span>
                      {item.userName} • {item.roomNumber}{" "}
                      {item.isMine && <strong className="text-[#3848e0]">(Anda)</strong>}
                    </span>
                  </div>

                  {/* Note Quote */}
                  <p className="text-[11px] text-slate-500 italic mt-1 leading-snug">
                    💬 "{item.note}"
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                {item.isMine ? (
                  <button
                    type="button"
                    onClick={() => handleCollectItem(item.id, item.title)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-99 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    <span>Sudah Diambil</span>
                  </button>
                ) : (
                  <a
                    href={`https://wa.me/6281299887766?text=Halo%20Kak%20${encodeURIComponent(
                      item.userName
                    )},%20saya%20Azka%20Andya%20ingin%20menanyakan%20tentang%20barang%20"${encodeURIComponent(
                      item.title
                    )}" di area ${encodeURIComponent(item.locationTag)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-[#eef2ff] hover:bg-indigo-100 text-[#3848e0] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-99"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Hubungi via WA</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav with Penyimpanan Active */}
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
