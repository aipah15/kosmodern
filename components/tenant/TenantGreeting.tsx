"use client";

import React, { useState, useEffect } from "react";
import {
  Wifi,
  Copy,
  Check,
  Phone,
  MessageSquare,
  Key,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";
import { useTenantPortal } from "@/modules/tenant-portal/context";

interface TenantGreetingProps {
  userName?: string;
  roomNumber?: string;
  floor?: string;
  propertyName?: string;
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

export const TenantGreeting: React.FC<TenantGreetingProps> = ({
  userName: userNameProp,
  roomNumber: roomNumberProp,
  floor: floorProp,
  propertyName: propertyNameProp,
  onShowToast,
}) => {
  const { tenant, wifi, owner } = useTenantPortal();
  const userName = userNameProp ?? tenant.full_name.split(" ").slice(0, 2).join(" ");
  const roomNumber = roomNumberProp ?? tenant.room_number;
  const floor = floorProp ?? tenant.floor;
  const propertyName = propertyNameProp ?? owner.propertyName;
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [greetingTime, setGreetingTime] = useState("Selamat Datang");

  // Time-aware greeting computed on client mount
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) setGreetingTime("Selamat Pagi");
    else if (hour >= 11 && hour < 15) setGreetingTime("Selamat Siang");
    else if (hour >= 15 && hour < 18) setGreetingTime("Selamat Sore");
    else setGreetingTime("Selamat Malam");
  }, []);

  const handleCopyWifi = () => {
    if (!wifi.password) {
      onShowToast?.("Password Wi-Fi belum diatur pengelola.", "info");
      return;
    }
    navigator.clipboard.writeText(wifi.password);
    setCopiedWifi(true);
    onShowToast?.("Password Wi-Fi berhasil disalin.", "success");
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleContactOwner = () => {
    const phone = owner.phone.replace(/\D/g, "");
    const cleanPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
    const msg = encodeURIComponent(
      `Halo Ibu ${owner.name}, saya ${userName} dari Kamar ${roomNumber}. Ingin bertanya perihal fasilitas kos. Terima kasih! 🙏`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="w-full mt-1 mb-4 space-y-3">
      {/* 1. Main Greeting Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>{greetingTime}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
            <span>Halo, {userName}</span>
            <span className="text-xl origin-bottom-right hover:rotate-12 transition-transform inline-block cursor-default">
              👋
            </span>
          </h2>
        </div>

        {/* Room & Floor Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs self-start sm:self-center">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
            <Key className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-slate-900 block leading-none">
              Kamar {roomNumber}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">
              {floor} • {propertyName}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick Utilities Bar: Wi-Fi Pill & Chat Ibu Kos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
        {/* Wi-Fi Quick Copy Card */}
        <div
          onClick={handleCopyWifi}
          className="bg-white/95 rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-indigo-200 hover:shadow-xs transition flex items-center justify-between cursor-pointer group select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wifi className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                WI-FI KOS
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
                {wifi.ssid || "Belum diatur"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition shrink-0"
          >
            {copiedWifi ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-indigo-500" />
                <span>Salin Sandi</span>
              </>
            )}
          </button>
        </div>

        {/* Contact Ibu Kos Quick Card */}
        <div
          onClick={handleContactOwner}
          className="bg-white/95 rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs hover:border-emerald-200 hover:shadow-xs transition flex items-center justify-between cursor-pointer group select-none"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                PENGELOLA KOS
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">
                {owner.name}
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition shrink-0">
            <Phone className="w-3 h-3 text-emerald-600" />
            <span>Chat WA</span>
          </span>
        </div>
      </div>
    </div>
  );
};
