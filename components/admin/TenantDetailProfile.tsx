"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Pencil,
  LogOut,
  Receipt,
  ShieldCheck,
  RotateCcw,
  Phone,
  Mail,
  Copy,
  Check,
  Eye,
  EyeOff,
  Calendar,
  Building,
  UserCheck,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Tenant } from "@/types/tenant";

interface TenantDetailProfileProps {
  tenant: Tenant;
  onBack: () => void;
  onEdit: (tenant: Tenant) => void;
  onCheckOut: (tenant: Tenant) => void;
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onReviewPayment?: () => void;
}

export const TenantDetailProfile: React.FC<TenantDetailProfileProps> = ({
  tenant,
  onBack,
  onEdit,
  onCheckOut,
  onShowToast,
  onReviewPayment,
}) => {
  const [showNik, setShowNik] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    onShowToast(`${label} disalin ke clipboard!`, "success");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedDeposit = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(tenant.deposit_amount || 500000);

  const formattedRent = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(tenant.rent_amount || 1500000);

  const formattedBill = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(tenant.bill_amount || 1575000);

  // Format check-in date
  const checkInFormatted = new Date(tenant.check_in_date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rawPhone = tenant.phone.replace(/[^0-9]/g, "");
  const waPhone = rawPhone.startsWith("0")
    ? `62${rawPhone.substring(1)}`
    : rawPhone.startsWith("62")
      ? rawPhone
      : `62${rawPhone}`;

  // Mask NIK
  const displayNik = () => {
    if (!tenant.nik) return "Belum diisi";
    if (showNik) return tenant.nik;
    const clean = tenant.nik.trim();
    if (clean.length >= 10) {
      return `${clean.slice(0, 6)} •••••••• ${clean.slice(-4)}`;
    }
    return `${clean.slice(0, 3)} •••• ${clean.slice(-2)}`;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Penghuni</span>
        </button>
      </div>

      {/* Top Banner Card: Azka Andya Safira */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.06),0_4px_12px_-4px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {tenant.full_name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Aktif Terverifikasi
              </span>
            </div>

            {/* Room & Property meta */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1.5 flex-wrap">
              <span className="font-bold text-[#4f46e5] flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                Kamar {tenant.room_number} ({tenant.floor || "Lt. 1"})
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                {tenant.property_name || "Kost Yusi"}
              </span>
              <span>•</span>
              <span className="text-slate-400">
                ❄ 🛁 🔒 AC • KM Dalam • Smart Lock
              </span>
            </div>
          </div>

          {/* Action Buttons Top Right */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(tenant)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ubah Data</span>
            </button>

            <button
              type="button"
              onClick={() => onCheckOut(tenant)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-600 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Nonaktifkan / Check-Out</span>
            </button>
          </div>
        </div>

        {/* Tagihan Banner Notification */}
        {tenant.bill_status === "waiting_verification" ? (
          <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-medium text-slate-600">Tagihan {tenant.bill_period || "-"}: </span>
                <span className="font-bold text-blue-900">
                  Menunggu Verifikasi ({formattedBill})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onReviewPayment) onReviewPayment();
                else onShowToast("Membuka verifikasi bukti pembayaran...", "info");
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto uppercase tracking-wider"
            >
              REVIEW SEGERA
            </button>
          </div>
        ) : tenant.bill_status === "overdue" ? (
          <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-medium text-slate-600">Status Tagihan: </span>
                <span className="font-bold text-rose-700">
                  Terlambat {tenant.overdue_days} Hari (+Denda Rp {tenant.fine_amount.toLocaleString()})
                </span>
              </div>
            </div>

            <a
              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                `Halo ${tenant.full_name}, mohon maaf mengingatkan pembayaran sewa kos Kamar ${tenant.room_number} telah jatuh tempo.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer self-start sm:self-auto"
            >
              Kirim Tagihan WA
            </a>
          </div>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-800">
              Tagihan Periode {tenant.bill_period}: Lunas
            </span>
          </div>
        )}
      </div>

      {/* Deposit Jaminan Card */}
      <div className="bg-white rounded-[22px] border border-slate-100 p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            DEPOSIT JAMINAN
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {formattedDeposit}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tersimpan di Rekening Escrow</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onShowToast("Pengembalian deposit diproses saat check-out penyewa.", "info")}
          className="w-10 h-10 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] flex items-center justify-center transition cursor-pointer"
          title="Kelola Deposit"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Informasi Pribadi & Kontak */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Informasi Pribadi &amp; Kontak
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4f46e5] border border-indigo-100">
              Data Terverifikasi
            </span>
          </div>

          {/* Row 1: WA & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                NOMOR WHATSAPP / HP
              </span>
              <div className="text-sm font-extrabold text-slate-900 mt-1">
                {tenant.phone.startsWith("+") ? tenant.phone : `+62 ${tenant.phone.replace(/^0/, "")}`}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => handleCopy(tenant.phone, "Nomor WhatsApp")}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === "Nomor WhatsApp" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Salin No.</span>
                </button>
                <span className="text-slate-300">•</span>
                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>Buka WhatsApp</span>
                </a>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ALAMAT EMAIL
              </span>
              <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">
                {tenant.email || "Belum ada email"}
              </div>
              {tenant.email && (
                <div className="mt-1.5 text-[11px] font-semibold">
                  <a
                    href={`mailto:${tenant.email}`}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Kirim Email</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: NIK */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              NOMOR INDUK KEPENDUDUKAN (NIK)
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-base font-extrabold text-slate-900 tracking-wide font-mono">
                {displayNik()}
              </span>
              <button
                type="button"
                onClick={() => setShowNik(!showNik)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title={showNik ? "Sembunyikan NIK" : "Tampilkan NIK"}
              >
                {showNik ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Row 3: Pekerjaan & Asal KTP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PEKERJAAN &amp; INSTANSI
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {tenant.occupation || "Mahasiswa"}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {tenant.institution || "Universitas Negeri Malang"}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ALAMAT ASAL (KTP)
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {tenant.origin_city || "Bekasi"}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {tenant.origin_address || "Jatiwaringin, Kota Bekasi"}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Masa Sewa & Kontak Darurat */}
        <div className="lg:col-span-5 space-y-5">
          {/* Masa Sewa & Ketentuan Card */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Masa Sewa &amp; Ketentuan
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Tanggal Masuk (Check-In)</span>
                <span className="font-bold text-slate-900">{checkInFormatted}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Akhir Kontrak</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {tenant.contract_type || "Bulanan"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Siklus Jatuh Tempo</span>
                <span className="font-bold text-[#4f46e5]">
                  Tiap tanggal {tenant.due_date_day || 1}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Tarif Sewa Pokok</span>
                <span className="font-extrabold text-sm text-slate-900">
                  {formattedRent} <span className="text-[10px] text-slate-400 font-normal">/ bln</span>
                </span>
              </div>
            </div>
          </div>

          {/* Kontak Darurat (Wali) Card */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
                  *
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Kontak Darurat (Wali)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {tenant.emergency_contact_relation || "Orang Tua"}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {tenant.emergency_contact_name || "Bpk. Hendra Pratama"}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {tenant.emergency_contact_relation || "Ayah Kandung"} • Jtwr, BKS
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-800">
                {tenant.emergency_contact_phone || "0811-9876-5432"}
              </span>

              <div className="flex items-center gap-2">
                {tenant.emergency_contact_phone && (
                  <>
                    <a
                      href={`tel:${tenant.emergency_contact_phone}`}
                      className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] flex items-center justify-center transition cursor-pointer"
                      title="Telepon Wali"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/${tenant.emergency_contact_phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>WhatsApp Wali</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
