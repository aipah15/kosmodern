"use client";

import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  IdCard,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LoginStepProps {
  initialIdentifier?: string;
  onGoToInvite: () => void;
  onGoToForgotPassword: () => void;
  onShowToast: (text: string, type?: "info" | "error" | "success") => void;
}

export const LoginStep: React.FC<LoginStepProps> = ({
  initialIdentifier = "",
  onGoToInvite,
  onGoToForgotPassword,
  onShowToast,
}) => {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      onShowToast("Harap masukkan Email / WhatsApp dan Kata Sandi.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const isEmail = identifier.includes("@");

      if (isEmail) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier.trim(),
          password: password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            onShowToast("Email atau kata sandi tidak cocok.", "error");
          } else {
            onShowToast(error.message, "error");
          }
          return;
        }

        if (data.user) {
          const isOwner =
            data.user.user_metadata?.role === "owner" ||
            identifier.trim().toLowerCase() === "owner@kostyusi.com";

          if (isOwner) {
            onShowToast("Selamat datang kembali, Ibu Hj. Ratna Juwita!", "success");
            setTimeout(() => {
              window.location.href = "/admin";
            }, 800);
            return;
          }

          onShowToast("Login berhasil! Mengalihkan ke Beranda Penghuni...", "success");
          setTimeout(() => {
            window.location.href = "/tenant";
          }, 800);
          return;
        }
      } else {
        const cleanDigits = identifier.trim().replace(/[-\s]/g, "");
        let phoneFormatted = cleanDigits;
        if (phoneFormatted.startsWith("0")) {
          phoneFormatted = "+62" + phoneFormatted.slice(1);
        } else if (!phoneFormatted.startsWith("+")) {
          phoneFormatted = "+" + phoneFormatted;
        }

        let emailToUse = "";
        if (cleanDigits.includes("81299887766")) {
          emailToUse = "owner@kostyusi.com";
        } else if (cleanDigits.includes("81288219920")) {
          emailToUse = "azkaandya@gmail.com";
        } else {
          // Lookup in tenants table
          const { data: tenantRows } = await supabase
            .from("tenants")
            .select("email, phone")
            .limit(50);

          if (tenantRows) {
            const matched = tenantRows.find(
              (t) => t.phone && t.phone.replace(/[-\s]/g, "").includes(cleanDigits.slice(-8))
            );
            if (matched?.email) {
              emailToUse = matched.email;
            }
          }
        }

        let data, error;
        if (emailToUse) {
          const res = await supabase.auth.signInWithPassword({
            email: emailToUse,
            password: password,
          });
          data = res.data;
          error = res.error;
        } else {
          const res = await supabase.auth.signInWithPassword({
            phone: phoneFormatted,
            password: password,
          });
          data = res.data;
          error = res.error;
        }

        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            onShowToast("Nomor WhatsApp atau kata sandi tidak cocok.", "error");
          } else {
            onShowToast(error.message, "error");
          }
          return;
        }

        if (data.user) {
          const isOwner =
            data.user.user_metadata?.role === "owner" ||
            phoneFormatted.includes("81299887766");

          if (isOwner) {
            onShowToast("Selamat datang kembali, Ibu Hj. Ratna Juwita!", "success");
            setTimeout(() => {
              window.location.href = "/admin";
            }, 800);
            return;
          }

          onShowToast("Login berhasil! Mengalihkan ke Beranda Penghuni...", "success");
          setTimeout(() => {
            window.location.href = "/tenant";
          }, 800);
          return;
        }
      }
    } catch (err: any) {
      onShowToast(err.message || "Gagal menghubungi database.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[430px] bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.12),0_10px_25px_-5px_rgba(0,0,0,0.04)] border border-white/80 transition-all duration-300">
      {/* Top Logo / App Icon */}
      <div className="flex flex-col items-center">
        <div className="w-13 h-13 sm:w-14 sm:h-14 bg-[#4f46e5] rounded-[18px] flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3.5 transform transition-transform hover:scale-105">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-current" viewBox="0 0 24 24">
            <path d="M10.707 2.293a1 1 0 0 1 1.414 0l8 8a1 1 0 0 1 .293.707V20a2 2 0 0 1-2 2H5.586A2 2 0 0 1 3.586 20v-9a1 1 0 0 1 .293-.707l6.828-8zM12 4.414L5.586 10.828V20h3.414v-5a3 3 0 0 1 6 0v5h3.414v-9.172L12 4.414z" />
          </svg>
        </div>

        {/* Brand Name */}
        <div className="flex items-center justify-center gap-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
            Kost<span className="text-[#4f46e5]">Yusi</span>
          </h1>
          <span className="text-[10px] font-bold text-[#4f46e5] bg-[#eeeffe] px-1.5 py-0.5 rounded-full border border-[#d6d8fe] leading-none uppercase tracking-wide">
            ID
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-slate-400 text-xs sm:text-[13px] font-normal text-center mt-1 mb-6">
          Kelola sewa kos & tagihan jadi mudah & praktis
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Field 1: Email / WhatsApp */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-1.5"
          >
            Email atau Nomor WhatsApp <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-emerald-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </div>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Contoh: 08123456789 atau nama@email.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/10 transition shadow-xs"
            />
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 pl-0.5 font-normal">
            Gunakan nomor WhatsApp aktif yang terdaftar di kos
          </p>
        </div>

        {/* Field 2: Kata Sandi */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-[11px] sm:text-xs font-semibold text-slate-700"
            >
              Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={onGoToForgotPassword}
              className="text-[11px] sm:text-xs font-medium text-[#4f46e5] hover:text-indigo-700 hover:underline transition cursor-pointer"
            >
              Lupa kata sandi?
            </button>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi Anda"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-indigo-500/10 transition shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Checkbox: Ingat saya di perangkat ini */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={rememberMe}
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
              rememberMe
                ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                : "bg-white border-slate-300 hover:border-indigo-400"
            }`}
          >
            {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          <span
            onClick={() => setRememberMe(!rememberMe)}
            className="text-xs text-slate-600 cursor-pointer select-none font-normal"
          >
            Ingat saya di perangkat ini
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 sm:py-3 px-4 bg-[#4f46e5] hover:bg-[#4338ca] active:scale-[0.99] text-white font-medium text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Memproses autentikasi...
            </span>
          ) : (
            <>
              <span>Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider: ATAU */}
      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-slate-200/80" />
        <span className="flex-shrink mx-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          ATAU
        </span>
        <div className="flex-grow border-t border-slate-200/80" />
      </div>

      {/* Bottom Box: Calon / Penghuni Baru? */}
      <div className="bg-[#f8faff] border border-indigo-100/90 rounded-2xl p-3.5 sm:p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#4f46e5]">
          <IdCard className="w-4 h-4 text-[#4f46e5]" />
          <span>Calon / Penghuni Baru?</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
          Punya kode undangan dari pemilik kos?
        </p>
        <button
          type="button"
          onClick={onGoToInvite}
          className="w-full py-2 sm:py-2.5 px-4 bg-white border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-[#4f46e5] text-xs font-medium rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Daftar dengan Undangan</span>
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 text-center">
        <a
          href="/tenant"
          className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200/80 text-[#4f46e5] text-xs font-semibold rounded-xl shadow-2xs transition inline-flex items-center justify-center gap-1.5"
        >
          <span>👤 Buka Halaman Sisi Penghuni (User / Beranda)</span>
          <span>→</span>
        </a>

        <a
          href="/admin"
          className="text-[11px] text-slate-400 hover:text-[#4f46e5] font-medium transition inline-flex items-center gap-1"
        >
          <span>Masuk ke Portal Pemilik / Admin</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
};
