"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  AtSign,
  Send,
  Headphones,
  CheckCircle2,
  XCircle,
  LogIn,
  KeyRound,
} from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PROPERTY } from "@/lib/constants";

interface ForgotPasswordStepProps {
  onBack: () => void;
  onGoToLogin: () => void;
}

// Langkah pemulihan kata sandi akun
export const ForgotPasswordStep: React.FC<ForgotPasswordStepProps> = ({
  onBack,
  onGoToLogin,
}) => {
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsapp.trim()) {
      setErrorMessage("Harap masukkan nomor WhatsApp atau Email yang terdaftar.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let cleanInput = whatsapp.trim();
      const isEmail = cleanInput.includes("@");

      if (isEmail) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanInput, {
          redirectTo: `${window.location.origin}/?screen=reset-password`,
        });
        if (error) throw error;
        setSuccessMessage(`Tautan pemulihan kata sandi telah dikirimkan ke email ${cleanInput}.`);
      } else {
        let cleanPhone = cleanInput.replace(/[-\s]/g, "");
        if (cleanPhone.startsWith("0")) {
          cleanPhone = "+62" + cleanPhone.slice(1);
        } else if (!cleanPhone.startsWith("+")) {
          cleanPhone = "+62" + cleanPhone;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, phone, full_name")
          .eq("phone", cleanPhone)
          .maybeSingle();

        if (profile) {
          setSuccessMessage(
            `Nomor ${cleanPhone} (${profile.full_name || "Penghuni"}) terverifikasi. Petunjuk pemulihan telah disiapkan.`
          );
        } else {
          setSuccessMessage(
            `Permintaan reset diproses. Jika nomor ${cleanPhone} terdaftar di ${DEFAULT_PROPERTY.name}, tautan pemulihan akan dikirimkan.`
          );
        }
      }

      setCountdown(60);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses permintaan reset kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <AuthHeader onBack={onBack} />

      {/* Konten Utama */}
      <div className="w-full text-center mt-2">
        <div className="bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 shadow-xl shadow-indigo-500/5 border border-slate-200/80 transition-all">
          <div className="flex flex-col items-center">
            <div className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 mb-3.5 transform transition-transform hover:scale-105">
              <KeyRound className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pemulihan Kata Sandi
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-2 mb-6 leading-relaxed font-normal px-2">
              Masukkan nomor WhatsApp atau Email yang terdaftar di kos. Kami akan mengirimkan instruksi pemulihan yang aman.
            </p>
          </div>

          {/* Form Permintaan Pemulihan */}
          <form onSubmit={handleSendVerification} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor WhatsApp atau Email Terdaftar <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Contoh: 08123456789 atau email@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-2xs"
                />
              </div>
            </div>

            {/* Notifikasi Status */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <XCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* Tombol Kirim */}
            <button
              type="submit"
              disabled={isLoading || countdown > 0}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Mengirim Instruksi...
                </span>
              ) : countdown > 0 ? (
                <span>Kirim Ulang ({countdown}s)</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Tautan Pemulihan</span>
                </>
              )}
            </button>
          </form>

          {/* Tombol Kembali ke Halaman Masuk */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onGoToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Masuk</span>
            </button>
          </div>

          <div className="border-t border-slate-100 my-5" />

          {/* Bantuan Langsung WhatsApp Pemilik */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Butuh Bantuan Cepat?
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                  Hubungi Pengelola atau Pemilik Kos via WhatsApp
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/62${DEFAULT_PROPERTY.ownerPhone.replace(/^0/, "")}?text=Halo%20Pengelola%20${encodeURIComponent(DEFAULT_PROPERTY.name)},%20saya%20memerlukan%20bantuan%20terkait%20akun%20saya.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-3 py-2.5 px-4 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-emerald-500 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Hubungi Pengelola via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
