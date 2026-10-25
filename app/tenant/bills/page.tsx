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
  Search,
  Filter,
  Printer,
  X,
  CreditCard,
  Download,
  Receipt,
  FileCheck,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { formatRupiah } from "@/lib/utils/currency";
import { formatDateIndo } from "@/lib/utils/date";

interface TenantBillItem {
  id: string;
  period: string;
  title: string;
  amount: number;
  status: "lunas" | "tunggu" | "ditolak" | "lunas_telat" | "belum";
  statusLabel: string;
  statusColor: string;
  dotColor: string;
  method: string;
  dateTime: string;
  invoiceNumber?: string;
  rejectionReason?: string;
  badgeText?: string;
}

export default function TenantPaymentHistoryPage() {
  const [filterYear] = useState(String(new Date().getFullYear()));
  const portal = useTenantPortal();
  const { tenant, billing, owner } = portal;
  const policies = portal.propertySettings?.policies || {};
  const [activeFilter, setActiveFilter] = useState<"semua" | "lunas" | "tunggu" | "ditolak">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<TenantBillItem | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Riwayat tagihan diambil dari tabel bills + status bukti bayar terakhir
  const bills: TenantBillItem[] = portal.bills.map((bill) => {
    const proof = portal.proofs.find(
      (p) => p.invoice_number === bill.invoice_number || (p.invoice_numbers || []).includes(bill.invoice_number)
    );
    const isPaid = bill.status === "paid" || bill.status === "lunas";
    const isPending = bill.status === "pending" || bill.status === "menunggu_verifikasi";
    const paidLate = isPaid && !!bill.paid_at && new Date(bill.paid_at).getTime() > new Date(bill.due_date).getTime() + 86400000;
    const lateDays = paidLate ? Math.ceil((new Date(bill.paid_at as string).getTime() - new Date(bill.due_date).getTime()) / 86400000) : 0;
    const isRejected = !isPaid && !isPending && proof?.status === "rejected";

    let status: TenantBillItem["status"] = "belum";
    let statusLabel = "Belum Dibayar";
    let statusColor = "bg-slate-100 text-slate-700 border-slate-200";
    let dotColor = "bg-slate-500";
    if (isPaid) {
      status = paidLate ? "lunas_telat" : "lunas";
      statusLabel = paidLate ? `Lunas (Telat ${lateDays} Hari)` : "Lunas";
      statusColor = paidLate ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotColor = paidLate ? "bg-purple-600" : "bg-emerald-500";
    } else if (isPending) {
      status = "tunggu";
      statusLabel = "Menunggu Verifikasi";
      statusColor = "bg-amber-50 text-amber-700 border-amber-200";
      dotColor = "bg-amber-500";
    } else if (isRejected) {
      status = "ditolak";
      statusLabel = "Ditolak (Perlu Unggah Ulang)";
      statusColor = "bg-rose-50 text-rose-700 border-rose-200";
      dotColor = "bg-rose-500";
    } else if (bill.status === "overdue" || bill.status === "terlambat") {
      statusLabel = "Terlambat";
      statusColor = "bg-rose-50 text-rose-700 border-rose-200";
      dotColor = "bg-rose-500";
    }

    return {
      id: bill.id,
      period: `Periode ${bill.period}`,
      title: bill.title,
      amount: Number(bill.amount || 0) + Number(bill.fine_amount || 0),
      status,
      statusLabel,
      statusColor,
      dotColor,
      method: bill.payment_method || proof?.bank_name || "-",
      dateTime: isPaid
        ? formatDateIndo(bill.paid_at, true)
        : proof?.created_at
        ? formatDateIndo(proof.created_at, true)
        : `Jatuh tempo ${formatDateIndo(bill.due_date)}`,
      invoiceNumber: bill.invoice_number,
      rejectionReason: isRejected ? proof?.rejection_reason || undefined : undefined,
    };
  });

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAccount(acc);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const filteredBills = bills.filter((b) => {
    let matchStatus = true;
    if (activeFilter === "lunas") matchStatus = b.status === "lunas" || b.status === "lunas_telat";
    else if (activeFilter === "tunggu") matchStatus = b.status === "tunggu";
    else if (activeFilter === "ditolak") matchStatus = b.status === "ditolak";

    const q = searchQuery.toLowerCase();
    const matchSearch =
      b.period.toLowerCase().includes(q) ||
      b.title.toLowerCase().includes(q) ||
      (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(q)) ||
      b.method.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  const paidBills = portal.bills.filter(
    (b) => (b.status === "paid" || b.status === "lunas") && new Date(b.paid_at || b.due_date).getFullYear() === Number(filterYear)
  );
  const totalPaid = paidBills.reduce((acc, curr) => acc + Number(curr.amount || 0) + Number(curr.fine_amount || 0), 0);

  const pendingCount = bills.filter((b) => b.status === "tunggu").length;
  const rejectedCount = bills.filter((b) => b.status === "ditolak").length;

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col justify-start relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-200/25 via-blue-100/15 to-transparent rounded-full blur-3xl" />
      </div>

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
      <TenantHeader activeNav="tagihan" />

      {/* Kontainer Utama yang Membedakan Mobile, Tablet, dan Desktop (PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                KAMAR {tenant.room_number.toUpperCase()} • {tenant.floor.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Tahun {filterYear}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Riwayat Tagihan & Pembayaran
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau status pelunasan sewa bulanan dan unduh bukti kuitansi resmi bertanda sah.
            </p>
          </div>

          <Link
            href="/tenant/pay"
            className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Bayar Tagihan Aktif</span>
          </Link>
        </div>

        {/* Top Summary Metric Cards (Unified Color Palette & Mobile Responsive) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
          {/* Card 1: Total Terbayar */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                TERBAYAR ({filterYear})
              </span>
              <h3 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 leading-tight">
                Rp {totalPaid.toLocaleString("id-ID")}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 truncate">{paidBills.length} Tagihan lunas</p>
            </div>
          </div>

          {/* Card 2: Menunggu Verifikasi */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                VERIFIKASI
              </span>
              <h3 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 leading-tight">
                {pendingCount} Tagihan
              </h3>
              <p className="text-[10px] sm:text-[11px] text-amber-600 font-medium mt-0.5 truncate">Sedang dicek</p>
            </div>
          </div>

          {/* Card 3: Perlu Tindakan / Ditolak */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/80 shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                PERLU TINDAKAN
              </span>
              <h3 className="text-xs sm:text-base lg:text-lg font-black text-rose-700 leading-tight">
                {rejectedCount} Ditolak
              </h3>
              <p className="text-[10px] sm:text-[11px] text-rose-600 font-medium mt-0.5 truncate">Unggah ulang</p>
            </div>
          </div>

          {/* Card 4: Status Kontrak */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-2.5 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center border border-indigo-200/80 shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                STATUS SEWA
              </span>
              <h3 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 leading-tight truncate">
                {tenant.status === "active" ? "Aktif" : tenant.status === "pending" ? "Menunggu" : "Nonaktif"}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">{tenant.contract_type || "Sewa Bulanan"}</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            TATA LETAK RESPONSIVE:
            - Mobile (< 768px): Alur linier ringkas
            - Tablet (768px - 1023px): 2 Kolom proporsional
            - PC / Desktop (>= 1024px): 12 Kolom lebar (8 Kolom Daftar + 4 Kolom Widget)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM UTAMA: Filter & Daftar Tagihan (Tablet: 1/2, Desktop: 8 kolom) */}
          <div className="md:col-span-1 lg:col-span-8 space-y-4">
            {/* Filter Pills & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "semua", label: "Semua", count: bills.length },
                  { id: "lunas", label: "Lunas", count: bills.filter((b) => b.status === "lunas" || b.status === "lunas_telat").length },
                  { id: "tunggu", label: "Menunggu", count: pendingCount },
                  { id: "ditolak", label: "Ditolak", count: rejectedCount },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setActiveFilter(pill.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      activeFilter === pill.id
                        ? "bg-[#4f46e5] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        activeFilter === pill.id
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
                  placeholder="Cari invoice, periode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* List of Period Bills */}
            <div className="space-y-3.5">
              {filteredBills.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center space-y-2 border border-slate-100">
                  <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Tidak ada riwayat tagihan</h4>
                  <p className="text-xs text-slate-400">
                    Coba sesuaikan filter atau kata kunci pencarian Anda.
                  </p>
                </div>
              ) : (
                filteredBills.map((b) => {
                  const isPaid = b.status === "lunas" || b.status === "lunas_telat";
                  const isRejected = b.status === "ditolak";
                  const isPending = b.status === "tunggu";

                  return (
                    <div
                      key={b.id}
                      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs hover:shadow-md ${
                        isRejected
                          ? "border-rose-200 ring-2 ring-rose-500/10"
                          : isPending
                          ? "border-amber-200 ring-2 ring-amber-500/10"
                          : "border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      {/* Top Card Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                                : isPending
                                ? "bg-amber-50 text-amber-600 border border-amber-200/60"
                                : "bg-rose-50 text-rose-600 border border-rose-200/60"
                            }`}
                          >
                            {isPaid ? (
                              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                            ) : isPending ? (
                              <Clock className="w-5 h-5 stroke-[2.2]" />
                            ) : (
                              <AlertCircle className="w-5 h-5 stroke-[2.2]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {b.period}
                            </span>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                              {b.title}
                            </h3>
                            <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                              {b.method} • {b.dateTime}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 shrink-0 ${b.statusColor}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${b.dotColor}`} />
                          <span>{b.statusLabel}</span>
                        </span>
                      </div>

                      {/* Middle Breakdown & Total */}
                      <div className="flex items-end justify-between mt-3.5 pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Total Tagihan
                          </span>
                          <span
                            className={`text-base sm:text-lg font-black ${
                              isRejected ? "text-rose-600" : "text-slate-900"
                            }`}
                          >
                            Rp {b.amount.toLocaleString("id-ID")}
                          </span>
                        </div>

                        {b.invoiceNumber && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-normal">
                              No. Invoice
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700">
                              {b.invoiceNumber}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Rejection Alert Box */}
                      {isRejected && b.rejectionReason && (
                        <div className="mt-3 p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-700">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Alasan Penolakan dari Pemilik:</span>
                          </div>
                          <p className="leading-relaxed text-[11px] pl-5">{b.rejectionReason}</p>
                        </div>
                      )}

                      {/* Card Action Button */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                        {isPaid && (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(b)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Lihat Kuitansi Resmi</span>
                          </button>
                        )}

                        {isRejected && (
                          <Link
                            href="/tenant/reupload-proof"
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah Ulang Bukti Transfer</span>
                          </Link>
                        )}

                        {(b.status === "belum") && (
                          <Link
                            href="/tenant/pay"
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] text-xs font-bold border border-indigo-200 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Bayar Sekarang</span>
                          </Link>
                        )}
                        {isPending && (
                          <Link
                            href="/tenant/pay"
                            className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-600" />
                            <span>Detail Pembayaran</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* KOLOM KANAN: Sidebar Tagihan Aktif & Rekening Resmi (Tablet: 1/2, Desktop: 4 kolom) */}
          <div className="md:col-span-1 lg:col-span-4 space-y-5">
            {/* Widget 1: Tagihan Aktif Bulan Ini */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-200 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10 uppercase tracking-wider">
                  TAGIHAN AKTIF
                </span>
                <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{billing.mainBill && billing.state !== "lunas" ? `Jatuh Tempo: ${formatDateIndo(billing.mainBill.due_date)}` : "Tidak ada tagihan"}</span>
                </span>
              </div>
              <div>
                <span className="text-xs text-indigo-200 block">{billing.mainBill ? `Periode ${billing.mainBill.period}` : "-"}</span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {formatRupiah(billing.state === "lunas" ? 0 : billing.total)}
                </h3>
                <p className="text-xs text-indigo-200/80 mt-1">
                  {billing.state === "lunas" ? "Semua tagihan sudah lunas" : billing.mainBill?.title}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/tenant/pay"
                  className="w-full py-3 bg-[#4f46e5] hover:bg-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Bayar Tagihan Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Widget 2: Saluran Rekening Resmi {owner.propertyName} */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Rekening Resmi {owner.propertyName}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  a.n {portal.bankAccounts[0]?.account_holder || owner.name}
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                {portal.bankAccounts.length === 0 && (
                  <p className="text-[11px] text-slate-400">Pengelola belum menambahkan rekening pembayaran.</p>
                )}
                {portal.bankAccounts.map((acc) => {
                  const digits = acc.account_number.replace(/\D/g, "");
                  return (
                    <div key={acc.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{acc.bank_name}</span>
                        <span className="font-mono text-xs font-semibold text-slate-600">{acc.account_number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAccount(digits)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-indigo-600 font-bold text-[11px] hover:bg-indigo-50 transition cursor-pointer"
                      >
                        {copiedAccount === digits ? "Tersalin!" : "Salin"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/60 text-[11px] text-amber-800 leading-relaxed">
                <strong>Catatan:</strong> Pastikan nominal transfer sesuai dan simpan bukti transfer untuk diunggah pada formulir pembayaran.
              </div>
            </div>

            {/* Widget 3: Kebijakan Denda & Toleransi */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2.5 text-xs text-slate-600">
              <h5 className="font-bold text-slate-900">Ketentuan Jatuh Tempo:</h5>
              <p className="leading-relaxed">
                Pembayaran sewa dilakukan paling lambat tanggal <strong>{tenant.due_date_day} setiap bulannya</strong>.
                {policies.gracePeriodDays ? ` Masa tenggang ${policies.gracePeriodDays} hari.` : ""}
                {policies.lateFeeAmount ? ` Keterlambatan dikenakan denda ${formatRupiah(policies.lateFeeAmount)}.` : ""}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL KUITANSI RESMI DIGITAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  LUNAS • TERVERIFIKASI
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Kuitansi Pembayaran Sah
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Nomor Kuitansi:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedReceipt.invoiceNumber || "-"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Diterima Dari:</span>
                <span className="font-bold text-slate-900">{tenant.full_name} (Kamar {tenant.room_number})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Untuk Pembayaran:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Waktu Bayar:</span>
                <span className="text-slate-700">{selectedReceipt.dateTime}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Metode:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.method}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                <span>Total Lunas:</span>
                <span className="text-[#4f46e5]">
                  Rp {selectedReceipt.amount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400">
              Diterbitkan secara digital oleh <strong>{owner.propertyName}</strong> • Pemilik: {owner.name}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kuitansi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigasi Bawah Khusus Layar Ponsel (< 768px) */}
      <TenantBottomNav
        activeTab="tagihan"
        onChangeTab={(tab) => {
          if (tab === "beranda") window.location.href = "/tenant";
          else if (tab === "laporan") window.location.href = "/tenant/maintenance";
          else if (tab === "penyimpanan") window.location.href = "/tenant/storage";
          else if (tab === "makanan") window.location.href = "/tenant/food";
        }}
      />
    </div>
  );
}

function Eye(props: any) {
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
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
