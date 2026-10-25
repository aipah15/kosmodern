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
} from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { UserRegisteredData } from "@/types/auth";

interface RegistrationSuccessStepProps {
  data: UserRegisteredData;
  onGoToLogin: () => void;
}

export const RegistrationSuccessStep: React.FC<RegistrationSuccessStepProps> = ({
  data,
  onGoToLogin,
}) => {
  return (
    <div className="w-full max-w-[430px] flex flex-col items-center">
      <AuthHeader />

      {/* Main Container */}
      <div className="w-full text-center mt-3">
        {/* Top Green Hero Icon */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-[22px] bg-[#10b981] text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 transform transition-transform hover:scale-105">
            <Check className="w-9 h-9 stroke-[3]" />
          </div>

          {/* Pill: Pendaftaran Berhasil */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold px-3.5 py-1 rounded-full border border-emerald-200 mt-4 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pendaftaran Berhasil</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
            Akun Berhasil Dibuat
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 mb-6 px-3 leading-relaxed font-normal">
            Selamat datang di <span className="font-medium text-slate-700">Kost Yusi</span>. Silakan masuk menggunakan akun yang baru Anda buat.
          </p>
        </div>

        {/* Resident Summary Card */}
        <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_20px_50px_-15px_rgba(79,70,229,0.08),0_10px_25px_-5px_rgba(0,0,0,0.03)] border border-slate-100 text-left mb-4">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Penghuni Resmi
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              AKTIF
            </span>
          </div>

          {/* Details List */}
          <div className="divide-y divide-slate-100 text-xs space-y-0.5">
            {/* Row 1: Nama Lengkap */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <IdCard className="w-4 h-4 text-slate-400" />
                <span>Nama Lengkap</span>
              </div>
              <span className="font-bold text-slate-900 text-right">
                {data.fullName}
              </span>
            </div>

            {/* Row 2: Kontak Akun */}
            <div className="py-3 flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-500 mt-0.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>Kontak Akun</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 block">
                  {data.email}
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {data.phone}
                </span>
              </div>
            </div>

            {/* Row 3: Properti Kos */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Properti Kos</span>
              </div>
              <span className="font-bold text-slate-900 text-right">
                {data.propertyName}
              </span>
            </div>

            {/* Row 4: Alokasi Kamar */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <DoorClosed className="w-4 h-4 text-slate-400" />
                <span>Alokasi Kamar</span>
              </div>
              <span className="text-xs font-semibold text-[#4f46e5] bg-[#eeeffe] px-2.5 py-1 rounded-lg border border-[#d6d8fe]">
                Kamar {data.roomNumber} • {data.floor}
              </span>
            </div>
          </div>
        </div>

        {/* Notice Info Text */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 mb-6 px-2 text-center">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Gunakan email atau nomor HP di atas serta kata sandi Anda untuk masuk.</span>
        </div>

        {/* CTA Button: Masuk ke Akun */}
        <button
          type="button"
          onClick={onGoToLogin}
          className="w-full py-3 px-4 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
        >
          <span>Masuk ke Akun</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
