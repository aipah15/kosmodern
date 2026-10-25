"use client";

import React, { useState } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { AuthScreen, InvitationData, UserRegisteredData } from "@/types/auth";
import { LoginStep } from "@/components/auth/LoginStep";
import { InviteCodeStep } from "@/components/auth/InviteCodeStep";
import { CompleteProfileStep } from "@/components/auth/CompleteProfileStep";
import { RegistrationSuccessStep } from "@/components/auth/RegistrationSuccessStep";
import { ForgotPasswordStep } from "@/components/auth/ForgotPasswordStep";

export default function AuthPage() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>("login");
  const [currentInvitation, setCurrentInvitation] = useState<InvitationData | null>(null);
  const [registeredUser, setRegisteredUser] = useState<UserRegisteredData | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "info" | "error" | "success";
  } | null>(null);

  const showToast = (text: string, type: "info" | "error" | "success" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  React.useEffect(() => {
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

  // Handlers for step progression
  const handleCodeVerified = (invitation: InvitationData) => {
    setCurrentInvitation(invitation);
    setCurrentScreen("complete-profile");
    showToast(`Kode "${invitation.code}" terverifikasi!`, "success");
  };

  const handleRegistrationSuccess = (data: UserRegisteredData) => {
    setRegisteredUser(data);
    setCurrentScreen("success");
    showToast("Akun berhasil didaftarkan dan diaktifkan!", "success");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#d4e1ff] via-[#e8eafc] to-[#fcd9e5]">
      
      {/* Ambient background glows isolated inside overflow-hidden to prevent extra scroll container */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-blue-300/40 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-pink-200/50 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-24 left-1/4 w-72 sm:w-80 h-72 sm:h-80 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/90 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-200">
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Clean centered card container */}
      <main className="w-full max-w-[430px] flex justify-center z-10 py-4 sm:py-6 transition-all duration-300">
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
  );
}
