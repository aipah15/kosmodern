"use client";

import React from "react";
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  IdCard,
  Mail,
  Building2,
  DoorClosed,
  Info,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { UserRegisteredData } from "@/types/auth";
import { DEFAULT_PROPERTY } from "@/lib/constants";

interface RegistrationSuccessStepProps {
  data: UserRegisteredData;
  onGoToLogin: () => void;
}

// Langkah sukses: Konfirmasi aktivasi akun penghuni baru
export const RegistrationSuccessStep: React.FC<RegistrationSuccessStepProps> = ({
  data,
  onGoToLogin,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      <AuthHeader />

      {/* Konten Utama */}
      <div className="w-full text-center mt-2">
        {/* Ikon Sukses Hero */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-3 transform transition-transform hover:scale-105">
            <Check className="w-9 h-9 stroke-[3]" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3.5 py-1 rounded-full border border-emerald-200 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pendaftaran Berhasil</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Akun Siap Digunakan!
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 mb-6 px-3 leading-relaxed font-normal">
            Selamat datang di <span className="font-bold text-slate-800">{data.propertyName || DEFAULT_PROPERTY.name}</span>. Akun penghuni Anda telah aktif dan tersinkronisasi dengan kamar.
          </p>
        </div>

        {/* Kartu Ringkasan Data Penghuni */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-indigo-500/5 border border-slate-200/80 text-left mb-4 transition-all">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Data Penghuni Terverifikasi
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              AKTIF
            </span>
          </div>

          {/* Rincian Akun */}
          <div className="divide-y divide-slate-100 text-xs space-y-0.5">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <IdCard className="w-4 h-4 text-slate-400" />
                <span>Nama Lengkap</span>
              </div>
              <span className="font-bold text-slate-900 text-right">
                {data.fullName}
              </span>
            </div>

            <div className="py-3 flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Kontak Akun</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 block font-mono">
                  {data.email}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {data.phone}
                </span>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Properti Kos</span>
              </div>
              <span className="font-bold text-slate-900 text-right">
                {data.propertyName || DEFAULT_PROPERTY.name}
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <DoorClosed className="w-4 h-4 text-slate-400" />
                <span>Alokasi Kamar</span>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                Kamar {data.roomNumber} • {data.floor}
              </span>
            </div>
          </div>
        </div>

        {/* Pemberitahuan Petunjuk Masuk */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mb-6 px-2 text-center">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Gunakan email atau nomor WhatsApp di atas beserta kata sandi Anda untuk masuk.</span>
        </div>

        {/* Tombol Menuju Login */}
        <button
          type="button"
          onClick={onGoToLogin}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
        >
          <span>Masuk ke Akun Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
