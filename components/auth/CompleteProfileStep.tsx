"use client";

import React, { useState } from "react";
import {
  Mail,
  User,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  Bed,
  DoorClosed,
  Coins,
  ShieldCheck,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { InvitationData, UserRegisteredData } from "@/types/auth";
import { createClient } from "@/lib/supabase/client";

interface CompleteProfileStepProps {
  invitation: InvitationData;
  onBack: () => void;
  onSuccess: (data: UserRegisteredData) => void;
}

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

  const supabase = createClient();
  const room = invitation.room || {
    id: "room-b04",
    room_number: "B-04",
    floor: "Lt. 1",
    room_type: "Deluxe",
    property_name: "Perumahan Kost Yusi",
    property_address: "Jl. Sigura - Gura IV No.6",
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
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
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

      // Register user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: cleanPhone,
            role: "tenant",
          },
        },
      });

      if (authError) {
        if (!authError.message.toLowerCase().includes("user already registered")) {
          setErrorMessage(authError.message);
          setIsLoading(false);
          return;
        }
      }

      const userId = authData?.user?.id;

      if (userId) {
        await supabase.from("profiles").upsert({
          id: userId,
          full_name: fullName.trim(),
          phone: cleanPhone,
          nik: nik.trim(),
          role: "tenant",
          room_id: invitation.room_id || null,
        });

        await supabase
          .from("invitations")
          .update({
            is_used: true,
            used_by: userId,
          })
          .eq("code", invitation.code);
      }

      const registeredData: UserRegisteredData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: cleanPhone,
        nik: nik.trim(),
        propertyName: room.property_name,
        roomNumber: room.room_number,
        floor: room.floor,
        invitationCode: invitation.code,
      };

      onSuccess(registeredData);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] flex flex-col items-center">
      <AuthHeader onBack={onBack} stepIndicator="Langkah 2 dari 2" />

      {/* Main Container */}
      <div className="w-full text-left mt-1 sm:mt-2">
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          Lengkapi Data Diri
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 mt-1 mb-4 leading-relaxed font-normal">
          Lengkapi profil Anda untuk mengaktifkan akses kamar digital dan kontrak sewa kos resmi.
        </p>

        {/* Invitation Summary Card matching Image 2 */}
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 shadow-[0_15px_40px_-15px_rgba(79,70,229,0.08),0_10px_20px_-5px_rgba(0,0,0,0.02)] border border-slate-100 mb-4 transition-all">
          {/* Top header row */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Anda diundang ke:</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {invitation.code}
            </span>
          </div>

          {/* Property Name & Unit Badge */}
          <div className="flex items-start justify-between mt-3 mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {room.property_name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {room.property_address}
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#4f46e5] bg-[#eeeffe] px-2.5 py-1 rounded-lg border border-[#d6d8fe] uppercase tracking-wide shrink-0">
              UNIT {room.room_number}
            </span>
          </div>

          {/* Two Columns Mini Boxes */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div className="bg-[#f3f6fe] rounded-xl p-2.5 flex items-center gap-2">
              <DoorClosed className="w-4 h-4 text-[#4f46e5] shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">
                  Kamar & Lantai
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {room.room_number} • {room.floor}
                </span>
              </div>
            </div>

            <div className="bg-[#f3f6fe] rounded-xl p-2.5 flex items-center gap-2">
              <Bed className="w-4 h-4 text-[#4f46e5] shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">
                  Tipe Kamar
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {room.room_type}
                </span>
              </div>
            </div>
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Coins className="w-3.5 h-3.5 text-slate-400" />
              <span>Biaya Sewa Bulanan:</span>
            </div>
            <div className="text-sm font-bold text-[#4f46e5]">
              Rp {room.price.toLocaleString("id-ID")}{" "}
              <span className="text-[11px] font-normal text-slate-400">/ bulan</span>
            </div>
          </div>

          {/* Note */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10.5px] text-slate-400">
            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Data kamar & tarif ditetapkan langsung sesuai undangan pemilik kos.</span>
          </div>
        </div>

        {/* Announcement Pill */}
        <div className="bg-[#eeeffe] text-[#4f46e5] text-xs font-semibold py-2 px-4 rounded-xl text-center mb-4 border border-[#d6d8fe]/60">
          Lengkapi Data Diri dengan Benar!
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Field: Nama Lengkap */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="cth. Azka Andya Safira"
                className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/10 transition shadow-xs"
              />
            </div>
          </div>

          {/* Field: NIK */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] sm:text-xs font-semibold text-slate-700">
                NIK <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {nik.length}/16 digit
              </span>
            </div>
            <div className="relative flex items-center">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
                placeholder="cth. 3828928392892834"
                maxLength={16}
                className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/10 transition shadow-xs font-mono"
              />
            </div>
          </div>

          {/* Field: Nomor WhatsApp */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
              Nomor WhatsApp <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-500 pointer-events-none text-xs font-semibold">
                <svg className="w-4 h-4 text-slate-400 fill-current" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                </svg>
                <span>+62</span>
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="812-3456-7890"
                className="w-full pl-17 pr-3.5 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/10 transition shadow-xs font-medium"
              />
            </div>
          </div>

          {/* Field: Alamat Email */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="azkaandya@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/10 transition shadow-xs"
              />
            </div>
          </div>

          {/* Field: Kata Sandi */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] sm:text-xs font-semibold text-slate-700">
                Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-normal">
                Min. 8 Karakter
              </span>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kombinasi huruf & angka"
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/10 transition shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Field: Konfirmasi Kata Sandi */}
          <div>
            <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1">
              Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <RotateCcw className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi Anda"
                className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/10 transition shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Checkbox Terms matching Image 2 */}
          <div className="bg-[#f8faff] border border-indigo-100/70 rounded-xl p-3 flex items-start gap-2.5">
            <input
              id="terms"
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded-[4px] border-slate-300 text-[#4f46e5] focus:ring-[#4f46e5] h-4 w-4 shrink-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
              Saya setuju data pribadi saya dikumpulkan dan diproses untuk keperluan kontrak sewa digital sesuai{" "}
              <span className="text-[#4f46e5] font-semibold hover:underline">
                Kebijakan Privasi & Tata Tertib
              </span>.
            </label>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs animate-in fade-in duration-150">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
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
                <UserCheck className="w-4 h-4" />
                <span>Daftar & Aktifkan Akun</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
