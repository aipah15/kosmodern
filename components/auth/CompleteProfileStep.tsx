"use client";

import React, { useState } from "react";
import {
  Mail,
  User,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Check,
  ShieldCheck,
  XCircle,
  ArrowRight,
  Phone,
} from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { InvitationData, UserRegisteredData } from "@/types/auth";
import { authService } from "@/modules/auth/services/authService";
import { formatRupiah } from "@/lib/utils/currency";

interface CompleteProfileStepProps {
  invitation: InvitationData;
  onBack: () => void;
  onSuccess: (data: UserRegisteredData) => void;
}

// Langkah 2: Pengisian data identitas dan pembuatan akun penghuni
export const CompleteProfileStep: React.FC<CompleteProfileStepProps> = ({
  invitation,
  onBack,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState("");
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const room = invitation.room || {
    id: invitation.room_id || "room-b04",
    room_number: "B-04",
    floor: "Lt. 1",
    room_type: "Deluxe AC",
    property_name: "Kost Yusi",
    property_address: "Jl. Sigura - Gura IV No.6, Malang",
    price: 1500000,
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nik.trim() || !phone.trim() || !email.trim() || !password) {
      setErrorMessage("Harap lengkapi semua kolom bertanda bintang (*).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal terdiri dari 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    if (!agreedTerms) {
      setErrorMessage("Anda harus menyetujui Kebijakan Privasi & Tata Tertib untuk melanjutkan.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let cleanPhone = phone.replace(/[-\s]/g, "");
      if (cleanPhone.startsWith("0")) {
        cleanPhone = "+62" + cleanPhone.slice(1);
      } else if (!cleanPhone.startsWith("+")) {
        cleanPhone = "+62" + cleanPhone;
      }

      const registeredData = await authService.completeRegistration({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: cleanPhone,
        nik: nik.trim(),
        password,
        invitation,
      });

      onSuccess(registeredData);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mendaftarkan akun. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <AuthHeader onBack={onBack} stepIndicator="Langkah 2 dari 2" />

      {/* Konten Utama */}
      <div className="w-full text-left mt-2">
        <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
          Lengkapi Data Akun
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 mt-1 mb-4 leading-relaxed font-normal">
          Isi informasi profil Anda untuk mengonfirmasi penempatan kamar kos.
        </p>

        {/* Banner Ringkasan Kamar Terpilih */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-3.5 mb-5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              {room.room_number}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">
                  Unit {room.room_number} ({room.room_type || "Deluxe AC"})
                </span>
                <span className="text-[10px] bg-white border border-indigo-200 text-indigo-700 px-1.5 py-0.2 rounded-md font-semibold">
                  {room.floor || "Lt. 1"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {room.property_name || "Kost Yusi"} • {formatRupiah(room.price)}/bln
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Terverifikasi</span>
          </div>
        </div>

        {/* Formulir Pendaftaran */}
        <form
          onSubmit={handleRegister}
          className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-indigo-500/5 border border-slate-200/80 transition-all space-y-4"
        >
          {/* Baris 1: Nama Lengkap & NIK (Grid 2 Kolom di Layar Lebar) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Azka Andya"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="16 digit angka KTP"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-2xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Baris 2: Nomor WhatsApp & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-emerald-500 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Baris 3: Kata Sandi & Konfirmasi Sandi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Buat Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ulangi Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Persetujuan Tata Tertib */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <button
                type="button"
                role="checkbox"
                aria-checked={agreedTerms}
                onClick={() => setAgreedTerms(!agreedTerms)}
                className={`w-4 h-4 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  agreedTerms
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-slate-300 hover:border-indigo-400"
                }`}
              >
                {agreedTerms && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <span className="text-xs text-slate-600 leading-relaxed font-normal">
                Saya menyetujui <span className="text-indigo-600 font-semibold">Tata Tertib Kos</span> dan memastikan data yang saya masukkan adalah sah & akurat.
              </span>
            </label>
          </div>

          {/* Pesan Error jika Ada */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <XCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Tombol Simpan & Aktifkan */}
          <button
            type="submit"
            disabled={isLoading || !agreedTerms}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Mendaftarkan Akun...
              </span>
            ) : (
              <>
                <span>Selesaikan & Aktifkan Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
