"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  Info,
  Wrench,
  CheckCircle2,
  Megaphone,
  Upload,
  ArrowRight,
  Receipt,
  Check,
  X,
  CreditCard,
  Building2,
} from "lucide-react";
import { PaymentModal } from "@/components/tenant/PaymentModal";

interface NotificationItem {
  id: string;
  type: "tagihan" | "tindakan" | "layanan" | "fasilitas" | "sukses" | "pengumuman";
  categoryLabel: string;
  categoryColor: string; // Tailwind color classes for tag
  ticketCode?: string;
  timeAgo: string;
  title: string;
  description: React.ReactNode;
  unread: boolean;
  section: "hari_ini" | "kemarin";
  iconType: "tagihan" | "warning" | "wrench" | "fridge" | "check" | "megaphone";
  footer?: React.ReactNode;
}

export default function TenantNotificationsPage() {
  const [filter, setFilter] = useState<"semua" | "belum_dibaca" | "tagihan" | "layanan">("semua");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      type: "tagihan",
      categoryLabel: "TAGIHAN KOS",
      categoryColor: "bg-amber-50 text-amber-700",
      timeAgo: "10 mnt lalu",
      title: "Pengingat Tagihan Jatuh Tempo (H-3)",
      description: (
        <span>
          Tagihan sewa Periode November 2026 sebesar{" "}
          <strong className="text-slate-900 font-bold">Rp 1.575.000</strong> jatuh tempo pada 1 Nov 2026.
          Hindari denda keterlambatan.
        </span>
      ),
      unread: true,
      section: "hari_ini",
      iconType: "tagihan",
      footer: (
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">
            Kamar B-04 • Sewa Bulanan
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPaymentModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span>Bayar Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
    {
      id: "notif-2",
      type: "tindakan",
      categoryLabel: "PERLU TINDAKAN",
      categoryColor: "bg-rose-50 text-rose-600",
      timeAgo: "2 jam lalu",
      title: "Bukti Bayar Oktober 2026 Ditolak",
      description: (
        <>
          <p className="text-xs text-slate-500 leading-relaxed mb-2.5">
            Pengelola kost menolak bukti transfer Oktober 2026 karena data transaksi tidak terbaca jelas.
          </p>
          <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100/80 flex items-start gap-2 mb-2.5 text-left">
            <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <strong className="text-rose-700 font-bold">Catatan Pengelola: </strong>
              <span>
                Nominal struk terpotong & gambar buram. Mohon unggah screenshot m-banking utuh.
              </span>
            </div>
          </div>
        </>
      ),
      unread: true,
      section: "hari_ini",
      iconType: "warning",
      footer: (
        <Link
          href="/tenant/reupload-proof"
          className="w-full py-2 px-3 bg-indigo-50/80 hover:bg-indigo-100 text-[#4f46e5] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-indigo-100/90 transition active:scale-99 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Unggah Ulang Bukti</span>
        </Link>
      ),
    },
    {
      id: "notif-3",
      type: "layanan",
      categoryLabel: "LAYANAN KAMAR",
      categoryColor: "bg-indigo-50 text-[#4f46e5]",
      ticketCode: "#KM-482",
      timeAgo: "4 jam lalu",
      title: "Status Laporan Rusak: Teknisi Dijadwalkan",
      description: (
        <span>
          Laporan perbaikan AC bocor di Kamar B-04 telah ditindaklanjuti. Teknisi{" "}
          <strong className="text-slate-900 font-bold">Pak Joko</strong> dijadwalkan hadir hari ini pk 14:00 WIB.
        </span>
      ),
      unread: true,
      section: "hari_ini",
      iconType: "wrench",
      footer: (
        <div className="mt-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Sedang Dikerjakan</span>
          </span>
        </div>
      ),
    },
    {
      id: "notif-4",
      type: "fasilitas",
      categoryLabel: "FASILITAS BERSAMA",
      categoryColor: "bg-emerald-50 text-emerald-700",
      timeAgo: "Kemarin, 09:30",
      title: "Pembersihan Kulkas Bersama (Label B-04)",
      description: (
        <span>
          Susu UHT & buah di rak 2 telah melewati batas waktu simpan 3 hari. Mohon segera konsumsi atau pindahkan sebelum pembersihan rutin.
        </span>
      ),
      unread: false,
      section: "kemarin",
      iconType: "fridge",
    },
    {
      id: "notif-5",
      type: "sukses",
      categoryLabel: "PEMBAYARAN SUKSES",
      categoryColor: "bg-emerald-50 text-emerald-700",
      timeAgo: "2 September 2026",
      title: "Pembayaran September 2026 Terverifikasi Lunas",
      description: (
        <span>
          Kuitansi digital{" "}
          <code className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] text-slate-700 font-semibold border border-slate-200">
            KM-INV/202604/B04
          </code>{" "}
          telah diterbitkan. Terima kasih telah membayar tepat waktu.
        </span>
      ),
      unread: false,
      section: "kemarin",
      iconType: "check",
    },
    {
      id: "notif-6",
      type: "pengumuman",
      categoryLabel: "PENGUMUMAN KOST",
      categoryColor: "bg-purple-50 text-purple-700",
      timeAgo: "3 hari lalu",
      title: "Info Jadwal Kuras Toren Air Bersih",
      description: (
        <span>
          <strong className="text-slate-800 font-semibold">Dari Ibu Hj. Ratna Juwita:</strong> Pembersihan toren air bersih hari Sabtu pk 09:00 - 11:00 WIB. Aliran air akan dimatikan sementara.
        </span>
      ),
      unread: false,
      section: "kemarin",
      iconType: "megaphone",
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("Semua notifikasi ditandai telah dibaca");
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "belum_dibaca") return n.unread;
    if (filter === "tagihan") return n.type === "tagihan" || n.type === "sukses";
    if (filter === "layanan") return n.type === "layanan" || n.type === "fasilitas";
    return true;
  });

  const hariIniList = filteredNotifications.filter((n) => n.section === "hari_ini");
  const kemarinList = filteredNotifications.filter((n) => n.section === "kemarin");

  // Render proper icon box
  const renderIcon = (type: NotificationItem["iconType"]) => {
    switch (type) {
      case "tagihan":
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
            {/* Bill Receipt Icon */}
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-100/90 text-rose-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case "wrench":
        return (
          <div className="w-10 h-10 rounded-2xl bg-indigo-100/80 text-[#4f46e5] flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case "fridge":
        return (
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <line x1="5" y1="10" x2="19" y2="10" />
              <line x1="8" y1="5" x2="8" y2="8" />
              <line x1="8" y1="13" x2="8" y2="16" />
            </svg>
          </div>
        );
      case "check":
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-100/90 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case "megaphone":
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5 fill-current rotate-[-10deg]" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden pb-12">
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

      {/* Mobile Device Frame Container (max-w-[430px]) */}
      <div className="relative z-10 w-full max-w-[430px] px-4 sm:px-5 pt-3 flex flex-col">
        {/* Top App Brand (KOST YUSI) */}
        <div className="flex items-center gap-2.5 pt-1 pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#eeeffe] text-[#4f46e5] flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 2H9c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 8h2v2H5V8zm0 4h2v2H5v-2zm0 4h2v2H5v-2zm14 4H9v-2h2v-2H9v-2h2v-2H9V8h2V6H9V4h10v16zm-6-12h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-8h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
            </svg>
          </div>
          <span className="text-xs font-bold tracking-wider text-[#4f46e5] uppercase">
            KOST YUSI
          </span>
        </div>

        {/* Navigation & Header Row */}
        <div className="flex items-center gap-3.5 my-2">
          {/* Back button */}
          <Link
            href="/tenant"
            className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </Link>

          {/* Title + Badge + Subtitle */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-none">
                Notifikasi
              </h1>
              {unreadCount > 0 && (
                <span className="bg-[#eeeffe] text-[#4f46e5] text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Kamar B-04 • Azka Andya
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-3 mb-5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setFilter("semua")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              filter === "semua"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-500 border border-slate-200/70 hover:bg-slate-50"
            }`}
          >
            Semua (6)
          </button>

          <button
            type="button"
            onClick={() => setFilter("belum_dibaca")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              filter === "belum_dibaca"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-500 border border-slate-200/70 hover:bg-slate-50"
            }`}
          >
            Belum Dibaca ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter("tagihan")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              filter === "tagihan"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-500 border border-slate-200/70 hover:bg-slate-50"
            }`}
          >
            Tagihan
          </button>

          <button
            type="button"
            onClick={() => setFilter("layanan")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              filter === "layanan"
                ? "bg-[#3848e0] text-white shadow-xs"
                : "bg-white text-slate-500 border border-slate-200/70 hover:bg-slate-50"
            }`}
          >
            Layanan
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="ml-auto text-[11px] text-[#4f46e5] font-semibold hover:underline whitespace-nowrap"
            >
              Tandai Dibaca
            </button>
          )}
        </div>

        {/* SECTION 1: HARI INI */}
        {hariIniList.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                HARI INI
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {hariIniList.filter((n) => n.unread).length} Notifikasi Baru
              </span>
            </div>

            <div className="space-y-3">
              {hariIniList.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => toggleReadStatus(notif.id)}
                  className={`bg-white rounded-2xl p-4 border transition-all duration-200 shadow-2xs hover:shadow-xs relative ${
                    notif.unread
                      ? "border-indigo-100/90"
                      : "border-slate-100"
                  }`}
                >
                  {/* Blue unread dot matching screenshot */}
                  {notif.unread && (
                    <span className="w-2 h-2 rounded-full bg-[#3848e0] absolute top-5 left-2 ring-2 ring-white" />
                  )}

                  <div className="flex items-start gap-3 pl-1">
                    {/* Icon */}
                    {renderIcon(notif.iconType)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top tags row */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${notif.categoryColor}`}
                          >
                            {notif.categoryLabel}
                          </span>
                          {notif.ticketCode && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50/80 text-[#4f46e5]">
                              {notif.ticketCode}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-normal shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{notif.timeAgo}</span>
                        </span>
                      </div>

                      {/* Heading */}
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-1">
                        {notif.title}
                      </h3>

                      {/* Body Description */}
                      <div className="text-xs text-slate-500 leading-relaxed font-normal">
                        {notif.description}
                      </div>

                      {/* Footer actions */}
                      {notif.footer && notif.footer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: KEMARIN & SEBELUMNYA */}
        {kemarinList.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                KEMARIN & SEBELUMNYA
              </span>
            </div>

            <div className="space-y-3">
              {kemarinList.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs transition-all flex items-start gap-3"
                >
                  {/* Icon */}
                  {renderIcon(notif.iconType)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top tags row */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${notif.categoryColor}`}
                      >
                        {notif.categoryLabel}
                      </span>

                      <span className="text-[11px] text-slate-400 font-normal shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span>{notif.timeAgo}</span>
                      </span>
                    </div>

                    {/* Heading */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-1">
                      {notif.title}
                    </h3>

                    {/* Body Description */}
                    <div className="text-xs text-slate-500 leading-relaxed font-normal">
                      {notif.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal for "Bayar Sekarang" */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={1575000}
        invoiceNumber="INV-202611-B04"
        onPaymentSuccess={() => {
          showToast("Pembayaran berhasil diproses via QRIS/VA!");
        }}
      />

      {/* Modal Unggah Ulang Bukti Transfer */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] bg-white rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Unggah Ulang Bukti Transfer
                  </h3>
                  <p className="text-[11px] text-slate-400">Periode Oktober 2026</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="mt-5 text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Bukti Baru Berhasil Diunggah!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Pengelola kos (Ibu Hj. Ratna Juwita) akan segera memverifikasi bukti pembayaran yang Anda kirimkan.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUploadSuccess(false);
                    setIsUploadModalOpen(false);
                  }}
                  className="mt-4 px-6 py-2 bg-[#4f46e5] text-white rounded-xl text-xs font-semibold"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setUploadSuccess(true);
                }}
                className="mt-4 space-y-3"
              >
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900">
                  <strong className="block mb-0.5">Catatan Penolakan Sebelumnya:</strong>
                  <span>"Nominal struk terpotong & gambar buram. Mohon unggah screenshot m-banking utuh."</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Pilih File Gambar Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition cursor-pointer">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs text-[#4f46e5] font-semibold block">
                      Klik untuk memilih foto / screenshot m-banking
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Format PNG, JPG maks 5 MB
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer mt-2"
                >
                  Kirim Bukti Baru ke Pengelola
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
