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
} from "lucide-react";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";

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
}

export default function TenantMyStorageItemsPage() {
  const [filterCategory, setFilterCategory] = useState<"all" | "jemuran" | "sepatu" | "teras">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [myItems, setMyItems] = useState<MyStorageItem[]>([
    {
      id: "my-1",
      title: "Sneakers Putih Nike Air",
      locationTag: "Rak Sepatu - Lt. 2",
      locationColor: "bg-purple-50 text-purple-700",
      description: "Sedang diangin-anginkan setelah...",
      category: "sepatu",
      photoLabel: "Rak Lt. 2",
      imageBg: "from-slate-100 to-slate-200",
      statusType: "overdue",
      statusTitle: "Melewati perkiraan jadwal",
      statusSubtitle: "Diletakkan 2 hari lalu • Perkiraan diambil hari ini",
    },
    {
      id: "my-2",
      title: "Jemuran Handuk Biru & Kemeja",
      locationTag: "Jemuran Rooftop",
      locationColor: "bg-sky-50 text-sky-700",
      description: "Kering jam 4 sore nanti diambil",
      category: "jemuran",
      photoLabel: "Rooftop",
      imageBg: "from-blue-100 to-sky-200",
      statusType: "on_time",
      statusTitle: "Sedang dijemur • Tepat Waktu",
      statusSubtitle: "Diletakkan tadi pagi (08:00) • Perkiraan diambil 4 jam lagi",
    },
    {
      id: "my-3",
      title: "Sandal Gunung Eiger Hitam",
      locationTag: "Teras Depan Parkir",
      locationColor: "bg-slate-100 text-slate-700",
      description: "Dititip sementara dekat helm",
      category: "teras",
      photoLabel: "Teras",
      imageBg: "from-slate-200 to-stone-300",
      statusType: "temp",
      statusTitle: "Dititipkan sementara",
      statusSubtitle: "Diletakkan kemarin • Perkiraan diambil besok",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCollect = (id: string, title: string) => {
    setMyItems((prev) => prev.filter((item) => item.id !== id));
    showToast(`"${title}" berhasil ditandai sudah diambil!`);
  };

  const filtered = myItems.filter((item) => {
    if (filterCategory === "all") return true;
    return item.category === filterCategory;
  });

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
        {/* Navigation & Header */}
        <div className="flex items-center gap-3.5 my-2">
          <Link
            href="/tenant/storage"
            className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </Link>

          <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-none">
            Barang Saya Di Luar Kamar
          </h1>
        </div>

        {/* User Identity Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs my-2">
          <span className="text-xs font-bold text-[#3848e0] bg-indigo-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-1.5 border border-indigo-100">
            <Bed className="w-3.5 h-3.5" />
            <span>Azka Andya • Kamar B-04</span>
          </span>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Barang yang Anda letakkan di area bersama kos. Pastikan segera dirapikan bila sudah selesai.
          </p>
        </div>

        {/* Filter Pills: Semua, Jemuran, Rak Sepatu, Teras */}
        <div className="flex items-center gap-2 my-2.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterCategory === "all"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Semua</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory("jemuran")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterCategory === "jemuran"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Jemuran</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory("sepatu")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterCategory === "sepatu"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Rak Sepatu</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterCategory("teras")}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              filterCategory === "teras"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Teras</span>
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-4 my-2">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-2xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Semua Barang Sudah Bersih!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Tidak ada barang di area umum yang tercatat atas nama Anda.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs transition-all hover:shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  {/* Photo Thumbnail */}
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.imageBg} border border-slate-200 overflow-hidden shrink-0 flex flex-col justify-end p-1.5 relative shadow-2xs`}
                  >
                    <span className="bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md w-fit">
                      {item.photoLabel}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider ${item.locationColor}`}
                      >
                        {item.locationTag}
                      </span>
                      <button
                        type="button"
                        onClick={() => alert(`Pengaturan untuk "${item.title}"`)}
                        className="text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mt-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-normal line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Status Box (Overdue / On Time / Temp) */}
                <div className="my-2.5">
                  {item.statusType === "overdue" && (
                    <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-900 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div>
                        <strong className="text-rose-700 font-bold block mb-0.5">
                          {item.statusTitle}
                        </strong>
                        <span className="text-[11px] text-rose-800 font-normal">
                          {item.statusSubtitle}
                        </span>
                      </div>
                    </div>
                  )}

                  {item.statusType === "on_time" && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-slate-700 font-normal">
                          Sedang dijemur •{" "}
                          <strong className="text-emerald-700 font-bold">Tepat Waktu</strong>
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                          {item.statusSubtitle}
                        </span>
                      </div>
                    </div>
                  )}

                  {item.statusType === "temp" && (
                    <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-700 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-[#3848e0] flex items-center justify-center shrink-0 mt-0.5">
                        <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <div>
                        <strong className="text-slate-900 font-bold block mb-0.5">
                          {item.statusTitle}
                        </strong>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {item.statusSubtitle}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Blue Action CTA: Tandai Sudah Diambil */}
                <button
                  type="button"
                  onClick={() => handleCollect(item.id, item.title)}
                  className="w-full py-2.5 bg-[#3848e0] hover:bg-[#2f3ec4] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-99 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Tandai Sudah Diambil</span>
                </button>
              </div>
            ))
          )}
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
