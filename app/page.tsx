"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  AlertCircle,
  Building2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  HeartHandshake,
} from "lucide-react";
import { AuthScreen, InvitationData, UserRegisteredData } from "@/types/auth";
import { LoginStep } from "@/components/auth/LoginStep";
import { InviteCodeStep } from "@/components/auth/InviteCodeStep";
import { CompleteProfileStep } from "@/components/auth/CompleteProfileStep";
import { RegistrationSuccessStep } from "@/components/auth/RegistrationSuccessStep";
import { ForgotPasswordStep } from "@/components/auth/ForgotPasswordStep";
import { DEFAULT_PROPERTY } from "@/lib/constants";

// Halaman utama autentikasi dan pendaftaran penghuni dengan desain responsif penuh
export default function AuthPage() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>("login");
  const [currentInvitation, setCurrentInvitation] = useState<InvitationData | null>(null);
  const [registeredUser, setRegisteredUser] = useState<UserRegisteredData | null>(null);

  // Status notifikasi toast mengambang
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "info" | "error" | "success";
  } | null>(null);

  const showToast = (text: string, type: "info" | "error" | "success" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Deteksi pesan error dari parameter URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      if (error === "unauthorized") {
        showToast("Harap masuk terlebih dahulu untuk mengakses Portal Pemilik.", "error");
      } else if (error === "forbidden") {
        showToast("Akses ditolak: Akun Anda tidak memiliki izin sebagai pemilik.", "error");
      }
    }
  }, []);

  // Handler saat kode undangan berhasil diverifikasi
  const handleCodeVerified = (invitation: InvitationData) => {
    setCurrentInvitation(invitation);
    setCurrentScreen("complete-profile");
    showToast(`Kode undangan "${invitation.code}" terverifikasi!`, "success");
  };

  // Handler saat registrasi profil berhasil
  const handleRegistrationSuccess = (data: UserRegisteredData) => {
    setRegisteredUser(data);
    setCurrentScreen("success");
    showToast("Akun Anda berhasil didaftarkan dan diaktifkan!", "success");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/70 p-3 sm:p-6 lg:p-10 antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting halus */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-blue-300/30 rounded-full blur-3xl animate-pulse duration-1000" />
        <div className="absolute top-1/3 -right-40 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-rose-100/40 rounded-full blur-3xl" />
      </div>

      {/* Notifikasi Toast Mengambang */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-900/95 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-300 border border-white/10">
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Kontainer Utama: 1 Kolom di Layar Kecil, 2 Kolom Eksklusif di Layar Lebar (Desktop) */}
      <div className="w-full max-w-6xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
        {/* Kolom Kiri: Branding & Keunggulan Kos (Hanya tampil di Desktop/Tablet Lebar) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-indigo-100 shadow-xs backdrop-blur-xs text-indigo-700 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sistem Manajemen Kos Modern & Digital</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Hunian Nyaman, <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
                Kelola Sewa Praktis.
              </span>
            </h1>

            <p className="text-slate-600 text-base leading-relaxed max-w-lg">
              Portal terpadu untuk penghuni dan pemilik properti {DEFAULT_PROPERTY.name}. Cek tagihan, konfirmasi pembayaran, hingga laporan fasilitas dalam satu pintu.
            </p>
          </div>

          {/* 3 Kartu Keunggulan Cepat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Tagihan Transparan</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Rincian sewa & bukti transfer otomatis tersinkronisasi.</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Aman & Terverifikasi</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Akses privasi penghuni terjaga dengan akun terenkripsi.</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3 sm:col-span-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Fasilitas Bersama & Pelaporan</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Pantau kulkas bersama, penitipan barang, dan respon cepat keluhan fasilitas.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 font-medium">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span>{DEFAULT_PROPERTY.address}</span>
          </div>
        </div>

        {/* Kolom Kanan / Tengah: Form Interaktif (Login, Invite, dll.) */}
        <div className="w-full lg:col-span-6 flex justify-center">
          <main className="w-full max-w-[430px] sm:max-w-[460px] flex justify-center transition-all duration-300">
            {currentScreen === "login" && (
              <LoginStep
                initialIdentifier={registeredUser?.email || ""}
                onGoToInvite={() => setCurrentScreen("invite")}
                onGoToForgotPassword={() => setCurrentScreen("forgot-password")}
                onShowToast={showToast}
              />
            )}

            {currentScreen === "invite" && (
              <InviteCodeStep
                onBack={() => setCurrentScreen("login")}
                onCodeVerified={handleCodeVerified}
                onGoToLogin={() => setCurrentScreen("login")}
              />
            )}

            {currentScreen === "complete-profile" && currentInvitation && (
              <CompleteProfileStep
                invitation={currentInvitation}
                onBack={() => setCurrentScreen("invite")}
                onSuccess={handleRegistrationSuccess}
              />
            )}

            {currentScreen === "success" && registeredUser && (
              <RegistrationSuccessStep
                data={registeredUser}
                onGoToLogin={() => setCurrentScreen("login")}
              />
            )}

            {currentScreen === "forgot-password" && (
              <ForgotPasswordStep
                onBack={() => setCurrentScreen("login")}
                onGoToLogin={() => setCurrentScreen("login")}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
