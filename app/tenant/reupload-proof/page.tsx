"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  QrCode,
  Building2,
  Copy,
  Check,
  Download,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  RotateCw,
  Trash2,
  Info,
  CheckCircle2,
  BellRing,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Quote,
} from "lucide-react";

export default function TenantReuploadProofPage() {
  // Step 1: "metode" (Images 2 & 3: Rejection note + QRIS / Bank Transfer)
  // Step 2: "unggah" (Image 1: Actual file upload + notes + Tandai Sudah Bayar)
  const [currentStep, setCurrentStep] = useState<"metode" | "unggah">("metode");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "bank">("qris");
  const [selectedBank, setSelectedBank] = useState<"bca" | "mandiri" | "bri">("bca");
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  // Upload step states
  const [hasFile, setHasFile] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(id);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasFile) {
      alert("Harap pilih foto bukti transfer terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden pb-12">
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

        {/* Navigation & Header */}
        <div className="flex items-center gap-3.5 my-2">
          {currentStep === "unggah" ? (
            <button
              type="button"
              onClick={() => setCurrentStep("metode")}
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
          ) : (
            <Link
              href="/tenant/bills"
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </Link>
          )}

          <div className="flex flex-col">
            <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-none">
              Unggah Ulang Bukti
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Kamar B-04 • Periode Oktober 2026
            </p>
          </div>
        </div>

        {/* Success Modal / Screen */}
        {isSuccess ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl my-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Bukti Baru Berhasil Dikirim!
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Bukti transfer pengganti untuk <strong>Periode Oktober 2026</strong> telah diteruskan ke Ibu Hj. Ratna Juwita untuk verifikasi ulang.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/tenant/bills"
                className="w-full py-3 bg-[#3848e0] text-white rounded-2xl text-xs font-semibold shadow-md transition"
              >
                Kembali ke Riwayat Pembayaran
              </Link>
              <Link
                href="/tenant"
                className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold hover:bg-slate-200 transition"
              >
                Ke Beranda Utama
              </Link>
            </div>
          </div>
        ) : currentStep === "metode" ? (
          /* ================= STEP 1: LIHAT CATATAN PENOLAKAN & METODE (Images 2 & 3) ================= */
          <div className="space-y-4 my-2">
            {/* Card: Bukti Pembayaran Anda Ditolak */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-rose-200/90 shadow-2xs relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bukti Pembayaran Anda Ditolak
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Mohon periksa catatan pemilik kos di bawah ini
                  </p>
                </div>
              </div>

              {/* Red Quote Box: CATATAN PENOLAKAN */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100/90 text-xs text-rose-900 leading-relaxed relative">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                  <Quote className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>CATATAN PENOLAKAN</span>
                </div>
                <p className="italic text-slate-700 font-medium">
                  "Foto struk buram dan nominal transfer Rp 1.550.000 tidak terbaca jelas. Mohon unggah struk asli atau screenshot m-Banking terbaru."
                </p>
              </div>
            </div>

            {/* Method Selector: QRIS vs Transfer Bank */}
            <div className="mt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 px-1">
                PILIH METODE PEMBAYARAN
              </span>

              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("qris")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === "qris"
                      ? "bg-[#3848e0] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS Instan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === "bank"
                      ? "bg-[#3848e0] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Transfer Bank</span>
                </button>
              </div>
            </div>

            {/* Tab Content: QRIS Instan (Image 2) */}
            {paymentMethod === "qris" && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs text-center flex flex-col items-center">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider mb-2">
                    ⚡ REKOMENDASI • VERIFIKASI REALTIME
                  </span>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Kost Yusi / Hj. Ratna Juwita
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 mb-4">
                    NMID: ID1020349182390 • A01
                  </p>

                  {/* QR Code Container */}
                  <div className="relative p-4 rounded-2xl border-2 border-indigo-100 bg-slate-50 flex flex-col items-center justify-center w-64 h-64 shadow-inner">
                    <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#3848e0]" />
                    <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#3848e0]" />
                    <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#3848e0]" />
                    <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#3848e0]" />

                    <div className="w-full flex justify-between items-center text-[10px] font-extrabold text-slate-700 px-1 mb-1">
                      <span>QRIS</span>
                      <span className="text-rose-600 flex items-center gap-1">
                        GPN <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                      </span>
                    </div>

                    <div className="relative w-44 h-44 bg-slate-900 rounded-xl p-2.5 flex items-center justify-center">
                      <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm0 5h5v3h-5v-3zm3-2h2v2h-2v-2zm-6-3h2v4h-2v-4zm0 6h4v2h-4v-2z" />
                      </svg>
                      <div className="absolute w-8 h-8 rounded-lg bg-[#3848e0] border-2 border-white flex items-center justify-center text-white shadow-md">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-500 mt-2 font-medium">
                      Mendukung BCA, Mandiri, GoPay, OVO, ShopeePay
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert("Mengunduh gambar QRIS Kost Yusi (PNG)")}
                    className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Kode QRIS</span>
                  </button>
                </div>

                {/* Steps */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    CARA MUDAH BAYAR QRIS
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#3848e0] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        Buka aplikasi mobile banking (BCA, Mandiri, BRI) atau e-wallet (GoPay, OVO, Dana, ShopeePay).
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#3848e0] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        Pilih menu <strong>Scan / Bayar</strong>, lalu arahkan kamera ke kode QR atau unggah gambar yang diunduh.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#3848e0] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <p className="text-slate-600 leading-relaxed">
                        Pastikan nama merchant <strong>Kost Yusi</strong> dan nominal tepat, lalu konfirmasi pembayaran.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content: Transfer Bank (Image 3) */}
            {paymentMethod === "bank" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Rekening Tujuan
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Pilih salah satu rekening pemilik kos berikut:
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#3848e0] bg-indigo-50 px-2 py-0.5 rounded-full">
                    3 Bank Aktif
                  </span>
                </div>

                {/* Bank BCA */}
                <div
                  onClick={() => setSelectedBank("bca")}
                  className={`bg-white rounded-3xl p-4 border transition-all cursor-pointer shadow-2xs relative ${
                    selectedBank === "bca"
                      ? "border-[#3848e0] ring-2 ring-indigo-500/10"
                      : "border-slate-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center tracking-tight">
                        BCA
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            Bank Central Asia
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            Otomatis
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          a.n. Ratna Juwita (Ibu Kost Yusi)
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                        selectedBank === "bca"
                          ? "bg-[#3848e0] border-[#3848e0] text-white"
                          : "border-slate-300 bg-slate-50"
                      }`}
                    >
                      {selectedBank === "bca" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        NOMOR REKENING
                      </span>
                      <span className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                        8730 1928 44
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy("8730192844", "bca");
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      {copiedBank === "bca" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedBank === "bca" ? "Disalin" : "Salin Rekening"}</span>
                    </button>
                  </div>
                </div>

                {/* Bank Mandiri */}
                <div
                  onClick={() => setSelectedBank("mandiri")}
                  className={`bg-white rounded-3xl p-4 border transition-all cursor-pointer shadow-2xs relative ${
                    selectedBank === "mandiri"
                      ? "border-[#3848e0] ring-2 ring-indigo-500/10"
                      : "border-slate-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 font-extrabold text-[10px] flex items-center justify-center tracking-tight">
                        LIVIN
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                          Bank Mandiri
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          a.n. Ratna Juwita
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                        selectedBank === "mandiri"
                          ? "bg-[#3848e0] border-[#3848e0] text-white"
                          : "border-slate-300 bg-slate-50"
                      }`}
                    >
                      {selectedBank === "mandiri" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        NOMOR REKENING
                      </span>
                      <span className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                        137 00 2938 1029
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy("1370029381029", "mandiri");
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      {copiedBank === "mandiri" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedBank === "mandiri" ? "Disalin" : "Salin Rekening"}</span>
                    </button>
                  </div>
                </div>

                {/* Bank BRI */}
                <div
                  onClick={() => setSelectedBank("bri")}
                  className={`bg-white rounded-3xl p-4 border transition-all cursor-pointer shadow-2xs relative ${
                    selectedBank === "bri"
                      ? "border-[#3848e0] ring-2 ring-indigo-500/10"
                      : "border-slate-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 font-extrabold text-xs flex items-center justify-center tracking-tight">
                        BRI
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                          Bank BRI
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          a.n. Ratna Juwita
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                        selectedBank === "bri"
                          ? "bg-[#3848e0] border-[#3848e0] text-white"
                          : "border-slate-300 bg-slate-50"
                      }`}
                    >
                      {selectedBank === "bri" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        NOMOR REKENING
                      </span>
                      <span className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                        0123 01 098765 50 1
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy("012301098765501", "bri");
                      }}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                    >
                      {copiedBank === "bri" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedBank === "bri" ? "Disalin" : "Salin Rekening"}</span>
                    </button>
                  </div>
                </div>

                {/* Panduan Accordion */}
                <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs mt-3">
                  <div
                    onClick={() => setIsGuideOpen(!isGuideOpen)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#3848e0] flex items-center justify-center text-xs font-bold">
                        ?
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        Panduan &amp; Cara Transfer
                      </span>
                    </div>
                    {isGuideOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>

                  {isGuideOpen && (
                    <div className="mt-3 space-y-2.5 text-xs pt-3 border-t border-slate-100 animate-in fade-in">
                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
                        <span className="w-5 h-5 rounded-full bg-[#3848e0] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div>
                          <strong className="text-slate-900 block">Salin Rekening &amp; Nominal</strong>
                          <span className="text-slate-500 text-[11px]">Salin nomor rekening tujuan dan nominal persis sesuai tagihan di atas.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
                        <span className="w-5 h-5 rounded-full bg-[#3848e0] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          2
                        </span>
                        <div>
                          <strong className="text-slate-900 block">Kirim Melalui Aplikasi Bank</strong>
                          <span className="text-slate-500 text-[11px]">Buka BCA Mobile, Livin' Mandiri, BRImo, atau ATM dan lakukan transaksi transfer dana.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50">
                        <span className="w-5 h-5 rounded-full bg-[#3848e0] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          3
                        </span>
                        <div>
                          <strong className="text-slate-900 block">Simpan Struk &amp; Unggah Bukti</strong>
                          <span className="text-slate-500 text-[11px]">Tangkapan layar (screenshot) bukti berhasil dan klik tombol "Lanjut Unggah Bukti" di bawah.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tip Notice */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-slate-700 flex items-center gap-2.5 my-3">
              <span className="leading-relaxed">
                Setelah transfer berhasil, simpan tangkapan layar atau struk bukti bayar untuk diunggah.
              </span>
            </div>

            {/* Primary CTA: Lanjut Unggah Bukti (transitions to Step 2: Image 1) */}
            <button
              type="button"
              onClick={() => setCurrentStep("unggah")}
              className="w-full py-3.5 px-4 bg-[#3848e0] hover:bg-[#2f3ec4] text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-99"
            >
              <span>Lanjut Unggah Bukti</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* WhatsApp Footer */}
            <div className="mt-3 mb-2 text-center">
              <a
                href="https://wa.me/6281299887766?text=Halo%20Ibu%20Ratna,%20saya%20Azka%20Andya%20ingin%20konfirmasi%20bukti%20transfer%20Oktober."
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-500 hover:text-[#3848e0] font-medium transition inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Butuh bantuan konfirmasi? <strong>Hubungi Pengelola Kos</strong></span>
              </a>
            </div>
          </div>
        ) : (
          /* ================= STEP 2: FORM UNGGAH BUKTI ULANG (Image 1) ================= */
          <form onSubmit={handleFinalSubmit} className="space-y-4 my-3">
            {/* Foto Bukti Transfer / Resi Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Foto Bukti Transfer / Resi
                  </h3>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md">
                    Wajib
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Maks. 5 MB</span>
              </div>

              <p className="text-[11px] text-slate-400 mb-3 font-normal">
                Format JPG / PNG • Otomatis dikompres &amp; dioptimasi
              </p>

              {/* Action buttons: Ambil Foto / Pilih Galeri */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setHasFile(true)}
                  className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#3848e0]" />
                  <span>Ambil Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasFile(true)}
                  className="py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#3848e0]" />
                  <span>Pilih Galeri</span>
                </button>
              </div>

              {/* Preview Box matching Image 1 */}
              {hasFile ? (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-16 rounded-xl bg-white border border-slate-200 p-1 flex flex-col justify-between shrink-0 shadow-2xs relative">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <div className="space-y-1">
                        <div className="w-full h-1 bg-slate-200 rounded-full" />
                        <div className="w-3/4 h-1 bg-slate-200 rounded-full" />
                        <div className="w-1/2 h-1 bg-slate-200 rounded-full" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          bukti_transfer_Nov_b04.jpg
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-1">
                          1.4 MB
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Resolusi 1280×1920 • Siap dikirim
                      </p>
                    </div>
                  </div>

                  {/* Actions: Ganti Foto & Hapus */}
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => alert("Silakan pilih file gambar baru")}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Ganti Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasFile(false)}
                      className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setHasFile(true)}
                  className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center cursor-pointer hover:bg-slate-50 transition"
                >
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-[#3848e0] font-semibold block">
                    Klik untuk memilih / ambil foto bukti transfer baru
                  </span>
                </div>
              )}
            </div>

            {/* Catatan Tambahan (Opsional) */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">
                  Catatan Tambahan <span className="font-normal text-slate-400">(Opsional)</span>
                </span>
                <span className="text-[10px] text-slate-400">{notes.length}/200</span>
              </div>

              <textarea
                rows={3}
                maxLength={200}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Transfer atas nama Azka Andya via BCA Mobile jam 14:15..."
                className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3848e0] focus:ring-2 focus:ring-indigo-500/10 transition"
              />

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Cantumkan nama pemilik rekening jika nama berbeda dengan profil.</span>
              </div>
            </div>

            {/* Action CTA: Tandai Sudah Bayar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 bg-[#3848e0] hover:bg-[#2f3ec4] active:scale-99 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <span>Mengirim bukti ke sistem...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                  <span>Tandai Sudah Bayar</span>
                </>
              )}
            </button>

            {/* Footer subtext */}
            <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400 pt-1">
              <BellRing className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Pemilik kos (Ibu Hj. Ratna Juwita) otomatis menerima notifikasi Sistem.
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
