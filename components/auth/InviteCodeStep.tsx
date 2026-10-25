"use client";

import React, { useState } from "react";
import {
  Ticket,
  Clipboard,
  Check,
  Info,
  ArrowRight,
  ShieldCheck,
  XCircle,
  KeyRound,
} from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { InvitationData } from "@/types/auth";
import { authService } from "@/modules/auth/services/authService";

interface InviteCodeStepProps {
  onBack: () => void;
  onCodeVerified: (invitation: InvitationData) => void;
  onGoToLogin: () => void;
}

// Langkah 1: Input dan verifikasi kode undangan kamar kos
export const InviteCodeStep: React.FC<InviteCodeStepProps> = ({
  onBack,
  onCodeVerified,
  onGoToLogin,
}) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pasted, setPasted] = useState(false);

  // Tempel kode langsung dari clipboard perangkat
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCode(text.trim().toUpperCase());
        setErrorMessage(null);
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      }
    } catch {
      setErrorMessage("Izin clipboard ditolak. Silakan ketik kode undangan Anda secara manual.");
    }
  };

  // Cek validitas kode undangan via authService
  const handleCheckCode = async (overrideCode?: string) => {
    const codeToCheck = (overrideCode || code).trim().toUpperCase();
    if (!codeToCheck) {
      setErrorMessage("Harap masukkan kode undangan Anda.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const validInvitation = await authService.verifyInvitationCode(codeToCheck);
      onCodeVerified(validInvitation);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memverifikasi kode undangan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <AuthHeader onBack={onBack} stepIndicator="Langkah 1 dari 2" />

      {/* Konten Utama */}
      <div className="w-full text-left mt-2">
        <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
          Aktivasi Akun Kamar
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 mt-1 mb-5 leading-relaxed font-normal">
          Masukkan kode undangan unik yang diberikan oleh pemilik kos untuk aktivasi kamar Anda.
        </p>

        {/* Kartu Input Kode Undangan */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-indigo-500/5 border border-slate-200/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Kode Undangan Kamar <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              Format: KOS-XXXXX
            </span>
          </div>

          {/* Kolom Input dengan Tombol Tempel Cepat */}
          <div className="relative flex items-center mb-3">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-indigo-500">
              <Ticket className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setErrorMessage(null);
              }}
              placeholder="Contoh: KOS-B04"
              className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition uppercase tracking-wider"
            />
            <button
              type="button"
              onClick={handlePaste}
              className={`absolute right-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                pasted
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600"
              }`}
            >
              {pasted ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ditempel</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Tempel</span>
                </>
              )}
            </button>
          </div>

          {/* Catatan Bantuan */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 flex items-start gap-2.5 mb-4">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Kode tertera pada bukti sewa atau pesan WhatsApp yang dikirimkan oleh pengelola kos.
            </p>
          </div>

          {/* Pesan Error jika Ada */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <XCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Tombol Lanjutkan */}
          <button
            type="button"
            onClick={() => handleCheckCode()}
            disabled={isLoading || !code.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Memeriksa Kode...
              </span>
            ) : (
              <>
                <span>Verifikasi & Lanjut Lengkapi Profil</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Link Kembali ke Halaman Login */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun terdaftar?{" "}
            <button
              type="button"
              onClick={onGoToLogin}
              className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition cursor-pointer"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
