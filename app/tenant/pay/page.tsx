"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  QrCode,
  Building2,
  Copy,
  Check,
  Download,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  FileCheck,
  ShieldCheck,
  CreditCard,
  Lock,
  Clock,
  Sparkles,
  Info,
  LogOut,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { formatRupiah } from "@/lib/utils/currency";
import { billTotal } from "@/modules/tenant-portal/services/portalService";

export default function TenantPaymentProcessPage() {
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "bank">("qris");
  const portal = useTenantPortal();
  const { tenant, owner, billing, bankAccounts, paymentSettings } = portal;
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const selectedBank = selectedBankId ?? bankAccounts.find((b) => b.is_primary)?.id ?? bankAccounts[0]?.id ?? null;
  const bankInitials = (code: string) => code.slice(0, 5).toUpperCase();
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(id);
    showToast(`${label} berhasil disalin: ${text}`);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleLogout = () => portal.logout();

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
          href="/tenant/bills"
          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Kembali ke </span>Riwayat Tagihan</span>
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
      <TenantHeader activeNav="tagihan" />

      {/* Kontainer Utama Responsif (Mobile, Tablet, Desktop PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                TAGIHAN {billing.mainBill ? billing.mainBill.period.toUpperCase() : "-"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Kamar {tenant.room_number} ({tenant.floor})</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Pembayaran Tagihan Sewa
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih metode pembayaran instan via QRIS atau transfer rekening bank resmi {owner.propertyName}.
            </p>
          </div>

          <Link
            href="/tenant/bills"
            className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold py-1.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200/70 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lihat Semua Invoice</span>
          </Link>
        </div>

        {/* =========================================================================
            TATA LETAK RESPONSIVE:
            - Mobile (< 768px): Alur linier ringkas (Rincian Ringkas -> Metode Bayar -> CTA)
            - Tablet (768px - 1023px): 2 Kolom seimbang
            - PC / Desktop (>= 1024px): 12 Kolom lebar (8 Kolom Metode + 4 Kolom Order Summary)
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI / METODE BAYAR (Tablet: 1/2, Desktop: 8 kolom) */}
          <div className="md:col-span-1 lg:col-span-8 space-y-5">
            {/* Method Selector: QRIS vs Transfer Bank */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 px-0.5">
                PILIH METODE PEMBAYARAN RESMI
              </span>

              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === "qris"
                      ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>QRIS Instan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === "bank"
                      ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Transfer Bank</span>
                </button>
              </div>
            </div>

            {/* ================= METHOD 1: QRIS INSTAN ================= */}
            {paymentMethod === "qris" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* QRIS Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs text-center flex flex-col items-center relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                      ⚡ VERIFIKASI CEPAT • BEBAS BIAYA ADMIN
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {paymentSettings?.qris_merchant_name || owner.propertyName}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 mb-4">
                    {paymentSettings?.qris_nmid ? `NMID: ${paymentSettings.qris_nmid}` : "QRIS belum dikonfigurasi"}
                  </p>

                  {/* QR Code Container with Frame */}
                  <div className="relative p-4 sm:p-5 rounded-3xl border-2 border-indigo-100 bg-slate-50/80 flex flex-col items-center justify-center w-64 sm:w-72 shadow-inner">
                    <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#4f46e5]" />
                    <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#4f46e5]" />
                    <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#4f46e5]" />
                    <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#4f46e5]" />

                    <div className="w-full flex justify-between items-center text-[10px] font-extrabold text-slate-700 px-1 mb-2">
                      <span className="text-xs tracking-wider">QRIS</span>
                      <span className="text-rose-600 flex items-center gap-1 font-bold">
                        GPN <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                      </span>
                    </div>

                    {paymentSettings?.qris_image_url && paymentSettings.qris_is_active ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={paymentSettings.qris_image_url}
                        alt="Kode QRIS pembayaran"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-2xl bg-white"
                      />
                    ) : (
                      <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-center text-xs text-slate-500 p-4">
                        Gambar QRIS belum diunggah pengelola. Gunakan transfer bank.
                      </div>
                    )}

                    <p className="text-[10px] text-slate-500 mt-2.5 font-medium text-center">
                      Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay
                    </p>
                  </div>

                  {/* Nominal Tagihan Row */}
                  <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-4 w-full max-w-sm">
                    <span className="text-xs text-slate-600 font-medium">Nominal QRIS:</span>
                    <span className="text-base font-black text-[#4f46e5]">{formatRupiah(billing.total)}</span>
                  </div>

                  {/* Button: Unduh Kode QRIS */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!paymentSettings?.qris_image_url) {
                        showToast("Gambar QRIS belum tersedia.");
                        return;
                      }
                      window.open(paymentSettings.qris_image_url, "_blank");
                    }}
                    className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Gambar QRIS</span>
                  </button>
                </div>

                {/* Stepper Guide */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    CARA MUDAH BAYAR QRIS
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                        1
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        Buka aplikasi mobile banking (BCA, Livin' Mandiri, BRImo, BNI) atau dompet digital (GoPay, OVO, Dana, ShopeePay).
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                        2
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        Pilih menu <strong>Scan / Bayar</strong>, lalu arahkan kamera ponsel ke kode QRIS di atas.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                        3
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        Periksa nama merchant: <strong>{paymentSettings?.qris_merchant_name || owner.propertyName}</strong> dengan nominal <strong>{formatRupiah(billing.total)}</strong>. Selesaikan transaksi dan simpan struk screenshot.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= METHOD 2: TRANSFER BANK ================= */}
            {paymentMethod === "bank" && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Rekening Tujuan Pembayaran
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Pilih salah satu rekening resmi pemilik kos:
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                    {bankAccounts.length} Rekening Aktif
                  </span>
                </div>

                {bankAccounts.length === 0 && (
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 text-xs text-slate-500">
                    Pengelola belum menambahkan rekening pembayaran. Hubungi pemilik kos untuk informasi rekening.
                  </div>
                )}
                {bankAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedBankId(acc.id)}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs relative ${
                      selectedBank === acc.id
                        ? "border-[#4f46e5] ring-2 ring-indigo-500/10"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center tracking-tight border border-blue-200">
                          {bankInitials(acc.bank_code)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">{acc.bank_name}</span>
                            {acc.is_primary && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                                Prioritas
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">a.n. {acc.account_holder}</span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                          selectedBank === acc.id ? "bg-[#4f46e5] border-[#4f46e5] text-white" : "border-slate-300 bg-slate-50"
                        }`}
                      >
                        {selectedBank === acc.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">NOMOR REKENING</span>
                        <span className="font-mono font-bold text-base sm:text-lg text-slate-900 tracking-wider">{acc.account_number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(acc.account_number.replace(/\D/g, ""), acc.id, `Nomor Rekening ${acc.bank_code}`);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedBank === acc.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBank === acc.id ? "Disalin!" : "Salin Rekening"}</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Panduan & Cara Transfer Accordion */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                  <div
                    onClick={() => setIsGuideOpen(!isGuideOpen)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4f46e5] flex items-center justify-center text-xs font-bold">
                        ?
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        Panduan &amp; Cara Transfer Bank
                      </span>
                    </div>
                    {isGuideOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>

                  {isGuideOpen && (
                    <div className="mt-3 space-y-2.5 text-xs pt-3 border-t border-slate-100 animate-in fade-in">
                      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50">
                        <span className="w-5 h-5 rounded-full bg-[#4f46e5] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <div>
                          <strong className="text-slate-900 block">Salin Nomor Rekening &amp; Nominal</strong>
                          <span className="text-slate-500 text-[11px]">Salin nomor rekening tujuan di atas dan transfer nominal persis {formatRupiah(billing.total)}.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50">
                        <span className="w-5 h-5 rounded-full bg-[#4f46e5] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <strong className="text-slate-900 block">Kirim via M-Banking / ATM</strong>
                          <span className="text-slate-500 text-[11px]">Buka BCA Mobile, Livin' Mandiri, BRImo, atau ATM dan selesaikan transaksi transfer.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50">
                        <span className="w-5 h-5 rounded-full bg-[#4f46e5] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <div>
                          <strong className="text-slate-900 block">Simpan Bukti &amp; Unggah di Portal</strong>
                          <span className="text-slate-500 text-[11px]">Ambil tangkapan layar (screenshot) bukti berhasil dan klik tombol "Lanjut Unggah Bukti Bayar".</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* KOLOM KANAN / ORDER SUMMARY SIDEBAR (Tablet: 1/2, Desktop: 4 kolom) */}
          <div className="md:col-span-1 lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Card: Rincian Tagihan Sewa */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                    <FileCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      Rincian Tagihan Sewa
                    </h3>
                    <span className="text-[10px] text-slate-400">Periode {billing.mainBill?.period || "-"}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 tracking-wider uppercase">
                  {billing.state === "verifikasi" ? "MENUNGGU VERIFIKASI" : billing.state === "terlambat" ? "TERLAMBAT" : billing.state === "lunas" ? "LUNAS" : "BELUM BAYAR"}
                </span>
              </div>

              {/* Breakdown items */}
              <div className="space-y-2.5 text-xs text-slate-600">
                {billing.payableBills.length === 0 && (
                  <p className="text-slate-400">
                    {billing.state === "verifikasi"
                      ? "Pembayaran Anda sedang diverifikasi pengelola."
                      : "Tidak ada tagihan yang perlu dibayar."}
                  </p>
                )}
                {billing.payableBills.map((b) => (
                  <React.Fragment key={b.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-slate-900 block">{b.title}</span>
                        <span className="text-[10px] text-slate-400">{b.invoice_number}</span>
                      </div>
                      <span className="font-bold text-slate-900">{formatRupiah(Number(b.amount || 0))}</span>
                    </div>
                    {Number(b.fine_amount || 0) > 0 && (
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-rose-700 block">Denda Keterlambatan</span>
                          <span className="text-[10px] text-slate-400">{b.invoice_number}</span>
                        </div>
                        <span className="font-bold text-rose-600">+ {formatRupiah(Number(b.fine_amount))}</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Total Box */}
              <div className="pt-3 border-t border-slate-100">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#eef2ff] to-indigo-50 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      TOTAL PEMBAYARAN
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#4f46e5] tracking-tight">
                      {formatRupiah(billing.payableBills.reduce((acc, b) => acc + billTotal(b), 0))}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(billing.payableBills.reduce((acc, b) => acc + billTotal(b), 0)), "amount", "Nominal Pembayaran")}
                    className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-600 shadow-2xs transition active:scale-95"
                    title="Salin Angka Nominal"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Primary CTA Button */}
              <div className="pt-2">
                <Link
                  href={`/tenant/upload-proof${selectedBank ? `?bank=${selectedBank}` : ""}`}
                  aria-disabled={billing.payableBills.length === 0}
                  onClick={(e) => {
                    if (billing.payableBills.length === 0) e.preventDefault();
                  }}
                  className="w-full py-3.5 px-4 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Lanjut Unggah Bukti Bayar</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-1 leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Pastikan mentransfer sesuai nominal tepat agar proses verifikasi status sewa berjalan otomatis.
                </span>
              </div>
            </div>

            {/* Widget: Bantuan WhatsApp Ibu Kos */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2.5 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                BUTUH KONFIRMASI MANUAL?
              </span>
              <p className="text-slate-600 leading-relaxed">
                Jika Anda mengalami kendala saat transfer atau ingin meminta toleransi waktu, silakan hubungi pemilik kos.
              </p>
              <a
                href={`https://wa.me/${
                  owner.phone.replace(/\D/g, "").startsWith("0")
                    ? "62" + owner.phone.replace(/\D/g, "").slice(1)
                    : owner.phone.replace(/\D/g, "")
                }?text=${encodeURIComponent(
                  `Halo Ibu ${owner.name}, saya ${tenant.full_name} dari Kamar ${tenant.room_number}. Ingin mengonfirmasi perihal pembayaran sewa periode ${billing.mainBill?.period || ""}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat {owner.name} via WhatsApp</span>
              </a>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Kuitansi resmi digital diterbitkan otomatis setelah verifikasi</span>
            </div>
          </div>
        </div>
      </main>

      {/* Navigasi Bawah Khusus Layar Ponsel (< 768px) */}
      <TenantBottomNav
        activeTab="tagihan"
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
