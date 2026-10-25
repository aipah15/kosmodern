"use client";

import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Check,
  Building,
  Mail,
  Smartphone,
} from "lucide-react";
import { authService } from "@/modules/auth/services/authService";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PROPERTY } from "@/lib/constants";

interface LoginStepProps {
  initialIdentifier?: string;
  onGoToInvite: () => void;
  onGoToForgotPassword: () => void;
  onShowToast: (text: string, type?: "info" | "error" | "success") => void;
}

// Komponen form masuk (login) yang optimal untuk semua ukuran layar (Mobile, Tablet, Desktop)
export const LoginStep: React.FC<LoginStepProps> = ({
  initialIdentifier = "",
  onGoToInvite,
  onGoToForgotPassword,
  onShowToast,
}) => {
  const [roleTab, setRoleTab] = useState<"tenant" | "owner">("tenant");
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ganti tab peran (Penghuni / Pemilik)
  const handleSwitchRole = (tab: "tenant" | "owner") => {
    setRoleTab(tab);
    if (tab === "owner" && !identifier) {
      setIdentifier(DEFAULT_PROPERTY.ownerEmail);
    } else if (tab === "tenant" && identifier === DEFAULT_PROPERTY.ownerEmail) {
      setIdentifier("");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      onShowToast("Harap masukkan Email / Nomor WhatsApp dan Kata Sandi.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const isEmail = identifier.includes("@");
      const supabase = createClient();

      if (isEmail) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: identifier.trim(),
          password: password,
        });

        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            onShowToast("Email atau kata sandi tidak cocok. Periksa kembali.", "error");
          } else {
            onShowToast(error.message, "error");
          }
          return;
        }

        if (data.user) {
          const isOwner =
            data.user.user_metadata?.role === "owner" ||
            identifier.trim().toLowerCase() === DEFAULT_PROPERTY.ownerEmail.toLowerCase();

          if (isOwner) {
            onShowToast(`Selamat datang kembali, ${DEFAULT_PROPERTY.ownerName}!`, "success");
            setTimeout(() => {
              window.location.href = "/admin";
            }, 600);
            return;
          }

          onShowToast("Login berhasil! Mengalihkan ke Beranda Penghuni...", "success");
          setTimeout(() => {
            window.location.href = "/tenant";
          }, 600);
          return;
        }
      } else {
        // Autentikasi menggunakan nomor telepon / WhatsApp
        const cleanDigits = identifier.trim().replace(/[-\s]/g, "");
        let phoneFormatted = cleanDigits;
        if (phoneFormatted.startsWith("0")) {
          phoneFormatted = "+62" + phoneFormatted.slice(1);
        } else if (!phoneFormatted.startsWith("+")) {
          phoneFormatted = "+" + phoneFormatted;
        }

        let emailToUse = "";
        // Cek data nomor di tabel penghuni
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

        if (data?.user) {
          const isOwner =
            data.user.user_metadata?.role === "owner" ||
            phoneFormatted.includes("81299887766");

          if (isOwner) {
            onShowToast(`Selamat datang kembali, ${DEFAULT_PROPERTY.ownerName}!`, "success");
            setTimeout(() => {
              window.location.href = "/admin";
            }, 600);
            return;
          }

          onShowToast("Login berhasil! Mengalihkan ke Beranda Penghuni...", "success");
          setTimeout(() => {
            window.location.href = "/tenant";
          }, 600);
          return;
        }
      }
    } catch (err: any) {
      onShowToast(err.message || "Gagal menghubungi server database.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 shadow-xl shadow-indigo-500/5 border border-slate-200/70 backdrop-blur-md transition-all duration-300">
      {/* Header Logo & Identitas Brand */}
      <div className="flex flex-col items-center text-center">
        <div className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 mb-3.5 transform transition-transform hover:scale-105">
          <Building className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <div className="flex items-center gap-1.5 justify-center">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
            {DEFAULT_PROPERTY.name}
          </h2>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider">
            Portal
          </span>
        </div>

        <p className="text-slate-500 text-xs sm:text-[13px] font-normal mt-1 mb-5">
          {roleTab === "tenant"
            ? "Masuk untuk kelola sewa, tagihan, dan fasilitas kos"
            : "Masuk ke panel manajemen & administrasi kos"}
        </p>

        {/* Tab Switcher Peran: Penghuni vs Pemilik */}
        <div className="w-full grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleSwitchRole("tenant")}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              roleTab === "tenant"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Penghuni</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchRole("owner")}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              roleTab === "owner"
                ? "bg-white text-indigo-600 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pemilik (Admin)</span>
          </button>
        </div>
      </div>

      {/* Formulir Masuk */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Input Identifier: Email / WhatsApp */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            {roleTab === "tenant" ? "Nomor WhatsApp atau Email" : "Email Pemilik Properti"}
            <span className="text-rose-500 ml-1">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {identifier.includes("@") || roleTab === "owner" ? (
                <Mail className="w-4 h-4 text-indigo-500" />
              ) : (
                <Smartphone className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                roleTab === "tenant"
                  ? "Contoh: 08123456789 atau azka@gmail.com"
                  : DEFAULT_PROPERTY.ownerEmail
              }
              className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-2xs"
            />
          </div>
          {roleTab === "tenant" && (
            <p className="text-[11px] text-slate-400 mt-1 pl-1">
              Gunakan nomor WhatsApp aktif yang terdaftar di kos
            </p>
          )}
        </div>

        {/* Input Kata Sandi */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-slate-700"
            >
              Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={onGoToForgotPassword}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition cursor-pointer"
            >
              Lupa sandi?
            </button>
          </div>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi Anda"
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Checkbox Ingat Saya */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={rememberMe}
            onClick={() => setRememberMe(!rememberMe)}
            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
              rememberMe
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-slate-300 hover:border-indigo-400"
            }`}
          >
            {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
          <span
            onClick={() => setRememberMe(!rememberMe)}
            className="text-xs text-slate-600 cursor-pointer select-none font-medium"
          >
            Ingat saya di perangkat ini
          </span>
        </div>

        {/* Tombol Submit Masuk */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Memproses Autentikasi...
            </span>
          ) : (
            <>
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Bagian Bawah: Registrasi Penghuni Baru dengan Kode Undangan */}
      {roleTab === "tenant" && (
        <div className="mt-5 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-2.5">
            Penghuni baru dan memiliki kode undangan kamar?
          </p>
          <button
            type="button"
            onClick={onGoToInvite}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 text-indigo-600 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Aktivasi Akun dengan Kode Undangan</span>
          </button>
        </div>
      )}
    </div>
  );
};
