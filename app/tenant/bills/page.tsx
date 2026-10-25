"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  QrCode,
  Building2,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";

export default function TenantPaymentHistoryPage() {
  const [filterYear] = useState("2026");
  const [activeFilter, setActiveFilter] = useState<"semua" | "lunas" | "tunggu" | "ditolak">("semua");

  const bills = [
    {
      id: "bill-nov",
      period: "Periode Nov 2026",
      title: "Sewa Kamar + Listrik + Denda",
      amount: "Rp 1.575.000",
      status: "tunggu",
      statusLabel: "Menunggu Verifikasi",
      statusColor: "bg-amber-50 text-amber-600 border-amber-200/60",
      dotColor: "bg-amber-500",
      method: "BCA Manual Transfer",
      dateTime: "17 Oktober 2026, 14:15 WIB",
      iconType: "hourglass",
    },
    {
      id: "bill-okt",
      period: "Periode Oktober 2026",
      title: "Sewa Pokok Kamar B-04",
      amount: "Rp 1.550.000",
      status: "ditolak",
      statusLabel: "Ditolak",
      statusColor: "bg-rose-50 text-rose-600 border-rose-200/60",
      dotColor: "bg-rose-500",
      badgeText: "Unggahan 6 Oktober",
      rejectionReason: "Nominal struk terpotong & gambar buram. Mohon unggah bukti screenshot m-banking utuh.",
      iconType: "rejected",
    },
    {
      id: "bill-sep",
      period: "Periode September 2026",
      title: "Sewa Kamar + Pemakaian Listrik",
      amount: "Rp 1.550.000",
      status: "lunas",
      statusLabel: "Lunas",
      statusColor: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
      dotColor: "bg-emerald-500",
      invoiceNumber: "KM-INV/202604/B04",
      method: "QRIS • 1 September 2026, 09:20",
      iconType: "lunas",
    },
    {
      id: "bill-ags",
      period: "Periode Agustus 2026",
      title: "Sewa Kamar B-04",
      amount: "Rp 1.550.000",
      status: "lunas",
      statusLabel: "Lunas",
      statusColor: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
      dotColor: "bg-emerald-500",
      invoiceNumber: "KM-INV/202603/B04",
      method: "BCA • 1 Agustus 2026, 18:05",
      iconType: "lunas",
    },
    {
      id: "bill-jul",
      period: "Periode Juli 2026",
      title: "Sewa Kamar",
      amount: "Rp 1.500.000",
      status: "lunas_telat",
      statusLabel: "Lunas (Telat 2 Hari)",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200/60",
      dotColor: "bg-purple-600",
      invoiceNumber: "KM-INV/202602/B04",
      method: "BCA • 12 Juli 2026, 20:30",
      iconType: "history",
    },
  ];

  const filteredBills = bills.filter((b) => {
    if (activeFilter === "lunas") return b.status === "lunas" || b.status === "lunas_telat";
    if (activeFilter === "tunggu") return b.status === "tunggu";
    if (activeFilter === "ditolak") return b.status === "ditolak";
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden pb-24">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-indigo-200/35 via-blue-100/25 to-transparent rounded-full blur-3xl" />
      </div>

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

        {/* Page Title with Back Button */}
        <div className="flex items-center gap-3.5 my-2">
          <Link
            href="/tenant"
            className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </Link>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#4f46e5] uppercase tracking-wider leading-none mb-1">
              KAMAR B-04 • LANTAI 2
            </span>
            <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-none">
              Riwayat Pembayaran
            </h1>
          </div>
        </div>

        {/* Summary Metric Cards Row (2 Cards) */}
        <div className="grid grid-cols-2 gap-3 my-3">
          {/* Card 1: Terbayar (2026) */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Terbayar ({filterYear})</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 block tracking-tight">
                Rp 9.325.000
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                6 bulan sewa lunas
              </span>
            </div>
          </div>

          {/* Card 2: Perlu Perhatian */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Perlu Perhatian</span>
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 block tracking-tight">
                2 Tagihan
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                  1 Tunggu
                </span>
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                  1 Ditolak
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Year Filter Pill */}
        <div className="mt-1 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200/70 text-[#4f46e5] shadow-2xs inline-block">
            {filterYear}
          </span>
        </div>

        {/* Filter Pills Bar */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setActiveFilter("semua")}
            className="w-full py-2 bg-[#3848e0] text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer active:scale-99 transition"
          >
            Semua (8)
          </button>
        </div>

        {/* List of Period Bills */}
        <div className="space-y-3">
          {/* ITEM 1: Periode Nov 2026 (Menunggu Verifikasi) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Periode Nov 2026
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sewa Kamar + Listrik + Denda
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-amber-700 bg-[#fef9c3] px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Menunggu Verifikasi</span>
              </span>
            </div>

            <div className="flex items-end justify-between mt-3 pt-2.5 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">
                  Total Pembayaran
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  Rp 1.575.000
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-normal">
                  Metode
                </span>
                <span className="text-xs font-bold text-slate-700">
                  BCA Manual Transfer
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
              <Clock className="w-3 h-3 text-slate-300" />
              <span>17 Oktober 2026, 14:15 WIB</span>
            </div>
          </div>

          {/* ITEM 2: Periode Oktober 2026 (DITOLAK) */}
          <div className="bg-white rounded-2xl p-4 border-2 border-rose-200/90 shadow-2xs transition-all relative">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Periode Oktober 2026
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sewa Pokok Kamar B-04
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Ditolak</span>
              </span>
            </div>

            <div className="flex items-end justify-between mt-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">
                  Nominal Ditagihkan
                </span>
                <span className="text-sm sm:text-base font-extrabold text-rose-600">
                  Rp 1.550.000
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#4f46e5] bg-indigo-50 px-2 py-0.5 rounded-md">
                Unggahan 6 Oktober
              </span>
            </div>

            {/* Red Alert Note Box */}
            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100/90 text-xs text-rose-900 leading-relaxed my-2.5 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-rose-700 font-bold">Alasan: </strong>
                Nominal struk terpotong & gambar buram. Mohon unggah bukti screenshot m-banking utuh.
              </span>
            </div>

            {/* Red Action CTA: Unggah Ulang Bukti */}
            <Link
              href="/tenant/reupload-proof"
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-rose-500/20 active:scale-99 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Ulang Bukti</span>
            </Link>
          </div>

          {/* ITEM 3: Periode September 2026 (LUNAS) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Periode September 2026
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sewa Kamar + Pemakaian Listrik
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Lunas</span>
              </span>
            </div>

            <div className="flex items-end justify-between mt-3 pt-2.5 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">
                  Total Bayar
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  Rp 1.550.000
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-normal">
                  No. Invoice
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  KM-INV/202604/B04
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
              <QrCode className="w-3 h-3 text-slate-400" />
              <span>QRIS • 1 September 2026, 09:20</span>
            </div>
          </div>

          {/* ITEM 4: Periode Agustus 2026 (LUNAS) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Periode Agustus 2026
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sewa Kamar B-04
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Lunas</span>
              </span>
            </div>

            <div className="flex items-end justify-between mt-3 pt-2.5 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">
                  Total Bayar
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  Rp 1.550.000
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-normal">
                  No. Invoice
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  KM-INV/202603/B04
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>BCA • 1 Agustus 2026, 18:05</span>
            </div>
          </div>

          {/* ITEM 5: Periode Juli 2026 (Lunas Telat 2 Hari) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <History className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Periode Juli 2026
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sewa Kamar
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                <span>Lunas (Telat 2 Hari)</span>
              </span>
            </div>

            <div className="flex items-end justify-between mt-3 pt-2.5 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">
                  Total Bayar
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  Rp 1.500.000
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-normal">
                  No. Invoice
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  KM-INV/202602/B04
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>BCA • 12 Juli 2026, 20:30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation with Tagihan active */}
      <TenantBottomNav
        activeTab="tagihan"
        onChangeTab={(tab) => {
          if (tab === "beranda") window.location.href = "/tenant";
          else if (tab === "tagihan") window.location.href = "/tenant/bills";
        }}
      />
    </div>
  );
}
