"use client";

import React, { useState } from "react";
import {
  Ticket,
  Clipboard,
  Check,
  Info,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AuthHeader } from "./AuthHeader";
import { createClient } from "@/lib/supabase/client";
import { InvitationData } from "@/types/auth";

interface InviteCodeStepProps {
  onBack: () => void;
  onCodeVerified: (invitation: InvitationData) => void;
  onGoToLogin: () => void;
}

export const InviteCodeStep: React.FC<InviteCodeStepProps> = ({
  onBack,
  onCodeVerified,
  onGoToLogin,
}) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pasted, setPasted] = useState(false);

  const supabase = createClient();

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

  const handleCheckCode = async (overrideCode?: string) => {
    const codeToCheck = (overrideCode || code).trim().toUpperCase();
    if (!codeToCheck) {
      setErrorMessage("Harap masukkan kode undangan Anda.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Query invitation from Supabase along with room data
      const { data, error } = await supabase
        .from("invitations")
        .select(`
          id,
          code,
          room_id,
          is_used,
          room:rooms (
            id,
            room_number,
            floor,
            room_type,
            property_name,
            property_address,
            price
          )
        `)
        .eq("code", codeToCheck)
        .maybeSingle();

      if (error && !error.message.includes("schema cache")) {
        setErrorMessage(error.message);
        return;
      }

      if (!data) {
        setErrorMessage("Kode undangan tidak ditemukan. Periksa kembali huruf dan angka kode Anda.");
        return;
      }

      if (data.is_used) {
        setErrorMessage("Kode undangan ini sudah digunakan oleh akun lain.");
        return;
      }

      // Valid invitation found!
      const validInvitation: InvitationData = {
        id: data.id,
        code: data.code,
        room_id: data.room_id,
        is_used: data.is_used,
        room: Array.isArray(data.room) ? data.room[0] : (data.room as any) || {
          id: data.room_id || "room-b04",
          room_number: "B-04",
          floor: "Lt. 1",
          room_type: "Deluxe",
          property_name: "Perumahan Kost Yusi",
          property_address: "Jl. Sigura - Gura IV No.6",
          price: 1500000,
        },
      };

      onCodeVerified(validInvitation);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memverifikasi kode.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] flex flex-col items-center">
      <AuthHeader onBack={onBack} stepIndicator="Langkah 1 dari 2" />

      {/* Main Container */}
      <div className="w-full text-left mt-1 sm:mt-2">
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          Buat Akun Penghuni
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 mt-1 mb-5 leading-relaxed font-normal">
          Masukkan kode undangan unik yang dikirimkan oleh ibu atau bapak pemilik kos Anda.
        </p>

        {/* Card 1: Input Code Card */}
        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-[0_20px_50px_-15px_rgba(79,70,229,0.08),0_10px_25px_-5px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] sm:text-xs font-semibold text-slate-700">
              Kode Undangan <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
              Format: KOS-XXXX-XXXX
            </span>
          </div>

          {/* Input with Tempel button */}
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
              placeholder="Contoh: KOS-MELATI-8821"
              className="w-full pl-10 pr-24 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#4f46e5] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition uppercase tracking-wide"
            />
            <button
              type="button"
              onClick={handlePaste}
              className={`absolute right-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition ${
                pasted
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-[#eeeffe] hover:bg-indigo-100 text-[#4f46e5]"
              }`}
            >
              {pasted ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Ditempel</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3 h-3" />
                  <span>Tempel</span>
                </>
              )}
            </button>
          </div>

          {/* Info note */}
          <div className="bg-[#f8faff] border border-indigo-100/70 rounded-xl p-3 flex items-start gap-2.5 mb-4">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
              Kode tertera pada struk tanda jadi sewa atau pesan teks dari pengelola hunian.
            </p>
          </div>


          {/* Error notice if any */}
          {errorMessage && (
            <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CTA Submit Button */}
          <button
            type="button"
            disabled={isLoading || !code.trim()}
            onClick={() => handleCheckCode()}
            className="w-full py-3 px-4 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                <span>Buat Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Card 2: Help Box */}
        <div className="bg-[#f8faff] border border-indigo-100/90 rounded-[22px] p-4 sm:p-5 mt-4 text-left shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-800">
                Belum menerima kode undangan?
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-normal">
                Hubungi induk semang atau pengelola kos untuk membuatkan tautan registrasi instan kamar Anda.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Pengelola%20Kost%20Yusi,%20saya%20ingin%20meminta%20kode%20undangan%20pendaftaran%20kamar%20kos."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 py-2.5 px-4 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-emerald-500 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>Minta Kode via WhatsApp Pemilik</span>
          </a>
        </div>

        {/* Footer Notes */}
        <div className="mt-5 text-center space-y-3 pb-2">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-normal">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Data penyewa dilindungi enkripsi standar UU No. 27/2022 Pelindungan Data Pribadi (PDP).</span>
          </div>
          <p className="text-xs text-slate-600 font-normal">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={onGoToLogin}
              className="text-[#4f46e5] font-semibold hover:underline cursor-pointer"
            >
              Masuk Sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
