"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Copy,
  Check,
  Building2,
  Camera,
  Image as ImageIcon,
  RotateCw,
  Trash2,
  Info,
  CheckCircle2,
  BellRing,
  Sparkles,
} from "lucide-react";

export default function TenantUploadProofPage() {
  const [copied, setCopied] = useState(false);
  const [hasFile, setHasFile] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCopyAmount = () => {
    navigator.clipboard.writeText("1575000");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
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

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[430px] px-4 sm:px-5 pt-3 flex flex-col">
        {/* Top App Brand */}
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
          <Link
            href="/tenant/bills"
            className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </Link>

          <div className="flex flex-col">
            <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-none">
              Unggah Bukti Bayar
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Kamar B-04 • Periode November 2026
            </p>
          </div>
        </div>

        {/* Success State Overlay */}
        {isSuccess ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl my-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Bukti Pembayaran Diterima!
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Bukti transfer sebesar <strong>Rp 1.575.000</strong> telah dikirim ke Ibu Hj. Ratna Juwita. Status tagihan kini <strong>Menunggu Verifikasi</strong>.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/tenant/bills"
                className="w-full py-3 bg-[#3848e0] text-white rounded-2xl text-xs font-semibold shadow-md transition"
              >
                Lihat di Riwayat Pembayaran
              </Link>
              <Link
                href="/tenant"
                className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold hover:bg-slate-200 transition"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 my-3">
            {/* 1. Ringkasan Tagihan Sewa Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  RINGKASAN TAGIHAN SEWA
                </span>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Menunggu Bukti Transfer</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Sewa Kamar B-04 + Listrik + Denda Keterlambatan
              </p>

              {/* Amount Row */}
              <div className="flex items-center justify-between mt-2 mb-3">
                <span className="text-2xl sm:text-[28px] font-extrabold text-[#3848e0] tracking-tight">
                  Rp 1.575.000
                </span>
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="px-3 py-1.5 bg-[#eef2ff] hover:bg-indigo-100 text-[#3848e0] rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bank destination box */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-[#3848e0] flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      BCA • Hj. Ratna Juwita
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      8830-1928-301
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/80 px-2 py-1 rounded-md tracking-wider uppercase">
                  TRANSFER BANK
                </span>
              </div>
            </div>

            {/* 2. Foto Bukti Transfer / Resi Card */}
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

              {/* Preview Box matching screenshot */}
              {hasFile ? (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    {/* Simulated Receipt Thumbnail */}
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
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Ganti Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasFile(false)}
                      className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
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
                    Klik untuk memilih / ambil foto bukti transfer
                  </span>
                </div>
              )}
            </div>

            {/* 3. Catatan Tambahan (Opsional) */}
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

            {/* Primary Action Button: Tandai Sudah Bayar */}
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

            {/* Notification subtext */}
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
