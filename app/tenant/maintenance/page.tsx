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
} from "lucide-react";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";

export default function TenantMaintenancePage() {
  const [activeTab, setActiveTab] = useState<"saya" | "area_umum">("saya");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmedCompleted, setConfirmedCompleted] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmFinish = () => {
    setConfirmedCompleted(true);
    showToast("Tiket #TK-0824 berhasil dikonfirmasi selesai! Terima kasih.");
  };

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

        {/* Hero Card: Pusat Kendala & Fasilitas */}
        <div className="w-full bg-gradient-to-br from-[#3b49df] via-[#4f46e5] to-[#5b63ea] rounded-[28px] p-5 text-white shadow-lg shadow-indigo-600/20 my-2 relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
            Pusat Kendala &amp; Fasilitas
          </h1>
          <p className="text-xs text-indigo-100 font-medium mt-1 mb-4">
            Kamar B-04 • Kost Yusi
          </p>

          {/* Metric Badges & Buat Laporan CTA Button */}
          <div className="flex items-center gap-2">
            {/* Badge 1: 1 Laporan Diperoses */}
            <div className="px-3 py-2 bg-white/20 backdrop-blur-md rounded-2xl flex items-center gap-1.5 border border-white/20 text-xs font-semibold">
              <span className="text-amber-300">⏳</span>
              <div className="leading-tight">
                <span className="block text-xs font-bold">{confirmedCompleted ? "0" : "1"} Laporan</span>
                <span className="text-[10px] text-indigo-100 font-normal">Diproses</span>
              </div>
            </div>

            {/* Badge 2: 2 Selesai */}
            <div className="px-3 py-2 bg-white/15 backdrop-blur-md rounded-2xl flex flex-col justify-center border border-white/15 text-xs text-center">
              <span className="text-xs font-bold leading-tight">{confirmedCompleted ? "3" : "2"}</span>
              <span className="text-[10px] text-indigo-100 font-normal">Selesai</span>
            </div>

            {/* CTA Button: + Buat Laporan */}
            <Link
              href="/tenant/maintenance/new"
              className="ml-auto px-4 py-3 bg-white text-[#3848e0] hover:bg-slate-50 active:scale-95 text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <div className="text-left leading-tight">
                <span className="block text-[11px] font-extrabold">Buat</span>
                <span className="block text-[11px] font-extrabold">Laporan</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Tab Switcher: Laporan Saya (3) vs Area Umum (4) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-2xl my-3">
          <button
            type="button"
            onClick={() => setActiveTab("saya")}
            className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "saya"
                ? "bg-white text-[#3848e0] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Laporan Saya</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-50 text-[#3848e0]">
              3
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("area_umum")}
            className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "area_umum"
                ? "bg-white text-[#3848e0] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Area Umum</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              4
            </span>
          </button>
        </div>

        {/* Card: FOKUS TIKET (AC Kamar Bocor) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs my-2 relative">
          {/* Top Tag Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-[#eeeffe] text-[#3848e0] tracking-wider uppercase">
                FOKUS TIKET
              </span>
              <span className="text-xs text-slate-400 font-medium">
                #TK-0824 • Hari ini 09:30
              </span>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
              confirmedCompleted
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-[#fef9c3] text-[#b45309]"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${confirmedCompleted ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>{confirmedCompleted ? "Selesai" : "Diproses Teknisi"}</span>
            </span>
          </div>

          {/* Title & Photo Row */}
          <div className="flex items-start justify-between gap-3 my-2">
            <div className="flex-1">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                AC kamar bocor menetes air ke kasur
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kamar B-04 (Lantai 2)</span>
                </span>
                <span>•</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase">
                  URGENSI TINGGI
                </span>
              </div>
            </div>

            {/* Simulated Photo Thumbnail */}
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex flex-col items-center justify-center p-1 text-[9px] text-slate-600 text-center font-bold">
                <Droplets className="w-5 h-5 text-indigo-500 mb-0.5" />
                <span>Foto AC</span>
              </div>
            </div>
          </div>

          {/* Service Visit Info Card */}
          <div className="p-3 rounded-2xl bg-[#f0f4ff] border border-indigo-50 flex items-center justify-between my-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-[#3848e0] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  Estimasi Kunjungan Servis
                </span>
                <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                  Hari Ini, 15:30 WIB
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Pak Joko (Servis AC Berkah)
                </span>
              </div>
            </div>

            {/* Call button */}
            <a
              href="tel:081298765432"
              className="w-9 h-9 rounded-full bg-[#3848e0] hover:bg-[#2f3ec4] text-white flex items-center justify-center shadow-xs transition active:scale-95"
              title="Hubungi Teknisi"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Manager's Note Box */}
          <div className="p-3 rounded-2xl bg-[#f8faff] border border-indigo-50/80 text-xs mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#3848e0] mb-0.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Catatan Pengelola:</span>
            </div>
            <p className="text-slate-700 italic font-medium leading-relaxed">
              "Halo Kak Azka, teknisi AC rekanan sudah dijadwalkan tiba pkl 15.30 WIB."
            </p>
          </div>

          {/* 2 Bottom Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <a
              href="https://wa.me/6281299887766?text=Halo%20Ibu%20Ratna,%20saya%20Azka%20Andya%20ingin%20menanyakan%20progres%20AC%20Kamar%20B-04."
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#eef2ff] hover:bg-indigo-100 text-[#3848e0] font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-99"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Pengelola</span>
            </a>

            <button
              type="button"
              onClick={handleConfirmFinish}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-99 cursor-pointer ${
                confirmedCompleted
                  ? "bg-emerald-600 text-white"
                  : "bg-[#3848e0] hover:bg-[#2f3ec4] text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{confirmedCompleted ? "Sudah Selesai" : "Konfirmasi Selesai"}</span>
            </button>
          </div>
        </div>

        {/* Section: Riwayat & Daftar Tiket Lainnya */}
        <div className="my-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mb-3">
            Riwayat &amp; Daftar Tiket Lainnya
          </h3>

          <div className="space-y-3">
            {/* Item 1: Wi-Fi Router Lantai 2 */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between">
              <div className="flex-1 pr-3">
                <span className="text-[11px] text-slate-400 font-medium block mb-1">
                  • Hari ini, 11:20
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Wi-Fi Router Lantai 2 sering putus-sambung
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Wifi className="w-3 h-3 text-[#3848e0]" />
                    <span>Area Umum: Lorong Lt 2</span>
                  </span>
                  <span className="px-2 py-0.2 rounded-md bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-100">
                    Sedang
                  </span>
                </div>
              </div>

              {/* Router Icon Box */}
              <div className="w-11 h-11 rounded-2xl bg-[#eeeffe] text-[#3848e0] flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5" />
              </div>
            </div>

            {/* Item 2: Kran wastafel kamar mandi (Selesai) */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between">
              <div className="flex-1 pr-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    • 05 Jun 2026
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Selesai</span>
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Kran wastafel kamar mandi longgar dan merembes
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Droplets className="w-3 h-3 text-sky-500" />
                    <span>Kamar B-04 (Pribadi)</span>
                  </span>
                  <span className="px-2 py-0.2 rounded-md bg-indigo-50 text-[#3848e0] text-[10px] font-semibold">
                    Sedang
                  </span>
                </div>
              </div>

              {/* Photo Thumbnail */}
              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[8px] text-slate-600 font-bold">
                  Kran
                </div>
              </div>
            </div>

            {/* Item 3: Lampu LED sorot gerbang (Selesai) */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between">
              <div className="flex-1 pr-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    #TK-0810 • 28 Mei 2026
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Selesai</span>
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Lampu LED sorot gerbang parkiran motor redup
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Area Umum: Parkiran Bawah</span>
                  </span>
                  <span className="px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    Rendah
                  </span>
                </div>
              </div>

              {/* Photo Thumbnail */}
              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-[8px] text-slate-700 font-bold">
                  Lampu
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation with Laporan Active */}
      <TenantBottomNav
        activeTab="laporan"
        onChangeTab={(tab) => {
          if (tab === "beranda") window.location.href = "/tenant";
          else if (tab === "tagihan") window.location.href = "/tenant/bills";
          else if (tab === "laporan") window.location.href = "/tenant/maintenance";
        }}
      />
    </div>
  );
}
