"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Snowflake,
  Bath,
  Bed,
  KeyRound,
  Flame,
  Wifi,
  Armchair,
  DoorClosed,
  AppWindow,
  Sparkles,
  Share2,
} from "lucide-react";
import { Room } from "@/types/room";
import { formatRupiah } from "@/lib/utils/currency";

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete?: (roomId: string, roomNumber: string) => void;
  onCompleteMaintenance?: (roomId: string) => void;
  onViewTenantProfile?: (tenantName: string) => void;
  onGenerateInvite?: (room: Room) => void;
}

// Icon helper untuk fasilitas kamar kos
const getFacilityIcon = (facility: string) => {
  const f = facility.toLowerCase();
  if (f.includes("ac")) return <Snowflake className="w-3 h-3 text-sky-500 shrink-0" />;
  if (f.includes("km") || f.includes("mandi")) return <Bath className="w-3 h-3 text-indigo-500 shrink-0" />;
  if (f.includes("springbed") || f.includes("kasur")) return <Bed className="w-3 h-3 text-violet-500 shrink-0" />;
  if (f.includes("lock") || f.includes("kunci") || f.includes("smart")) return <KeyRound className="w-3 h-3 text-blue-500 shrink-0" />;
  if (f.includes("water") || f.includes("heater") || f.includes("air")) return <Flame className="w-3 h-3 text-amber-500 shrink-0" />;
  if (f.includes("wi-fi") || f.includes("wifi")) return <Wifi className="w-3 h-3 text-emerald-500 shrink-0" />;
  if (f.includes("meja") || f.includes("kursi")) return <Armchair className="w-3 h-3 text-slate-500 shrink-0" />;
  if (f.includes("lemari")) return <DoorClosed className="w-3 h-3 text-slate-500 shrink-0" />;
  if (f.includes("jendela")) return <AppWindow className="w-3 h-3 text-slate-500 shrink-0" />;
  return <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />;
};

// Komponen kartu informasi kamar kos dengan hierarki warna semantik yang jelas
export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onEdit,
  onDelete,
  onCompleteMaintenance,
  onViewTenantProfile,
  onGenerateInvite,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOccupied = room.status === "occupied" || room.status === "terisi";
  const isAvailable = room.status === "available" || room.status === "kosong";
  const isMaintenance = room.status === "maintenance" || room.status === "perbaikan";

  // Menutup dropdown menu saat mengklik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Inisial untuk avatar penghuni
  const getInitials = (name?: string | null) => {
    if (!name) return "P";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const facilities = room.facilities && room.facilities.length > 0
    ? room.facilities
    : ["AC", "KM Dalam", "Springbed", "Wi-Fi"];

  const visibleFacilities = facilities.slice(0, 3);
  const hiddenCount = Math.max(0, facilities.length - 3);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/70 hover:border-indigo-300 p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(79,70,229,0.12)] transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header kartu: Nomor kamar, tipe, lantai, dan dropdown menu aksi */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                Kamar {room.room_number.replace(/^Kamar\s*/i, "")}
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                {room.floor || "Lt. 1"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {room.room_type || "Deluxe AC"}
            </p>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              title="Opsi kamar"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(room);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 font-medium transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ubah Detail Kamar</span>
                </button>

                {isAvailable && onGenerateInvite && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onGenerateInvite(room);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 font-medium transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Buat Link Undangan</span>
                  </button>
                )}

                {isMaintenance && onCompleteMaintenance && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onCompleteMaintenance(room.id);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 font-medium transition cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Selesaikan Perbaikan</span>
                  </button>
                )}

                {onDelete && (
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(room.id, room.room_number);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Kamar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Gambar kamar, Badge status semantik, dan Badge tarif sewa */}
        <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
          <Image
            src={
              room.image_url ||
              "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop"
            }
            alt={`Kamar ${room.room_number}`}
            fill
            sizes="(max-width: 768px) 100vw, 350px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badge status semantik dengan hierarki warna jelas */}
          <div className="absolute top-2.5 left-2.5">
            {isOccupied && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/90 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Terisi
              </span>
            )}
            {isAvailable && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/95 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Kosong
              </span>
            )}
            {isMaintenance && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/95 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                Perbaikan
              </span>
            )}
          </div>

          {/* Badge tarif sewa bulanan dengan kontras tinggi (Dark Glassmorphism) */}
          <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md backdrop-blur-md border border-white/10">
            <span>{formatRupiah(room.price)}</span>
            <span className="text-[10px] text-slate-300 font-normal ml-0.5">/bln</span>
          </div>
        </div>

        {/* Informasi penghuni atau kesiapan unit kamar */}
        <div className="mt-3.5">
          {/* Status 1: Terisi (Biru / Netral Stabil) */}
          {isOccupied && (
            <div className="flex items-center justify-between bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                  {getInitials(room.tenant_name)}
                </div>
                <span className={`text-xs font-bold truncate ${room.tenant_name ? "text-slate-800" : "text-amber-700"}`}>
                  {room.tenant_name || "Terisi, data penghuni belum ada"}
                </span>
              </div>
              <button
                type="button"
                hidden={!room.tenant_name}
                onClick={() => onViewTenantProfile?.(room.tenant_name || "Penghuni")}
                className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-[11px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer shrink-0 shadow-2xs"
              >
                <span>Profil</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Status 2: Tersedia (Hijau / Fresh Siap Sewa) */}
          {isAvailable && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Siap disewakan segera</span>
              </div>
              {onGenerateInvite && (
                <button
                  type="button"
                  onClick={() => onGenerateInvite(room)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Undang</span>
                </button>
              )}
            </div>
          )}

          {/* Status 3: Perbaikan (Amber / Butuh Tindakan) */}
          {isMaintenance && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-900 text-xs font-semibold min-w-0">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{room.maintenance_note || room.maintenance_title || "Perbaikan unit"}</span>
              </div>
              {onCompleteMaintenance && (
                <button
                  type="button"
                  onClick={() => onCompleteMaintenance(room.id)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-[10px] font-bold rounded-lg transition cursor-pointer shrink-0 shadow-xs"
                >
                  Selesai
                </button>
              )}
            </div>
          )}
        </div>

        {/* Daftar fasilitas kamar dengan warna netral teratur */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {visibleFacilities.map((facility, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100/80 border border-slate-200/70 text-slate-700 text-[10px] font-medium"
            >
              {getFacilityIcon(facility)}
              <span>{facility}</span>
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-lg bg-slate-200/80 text-slate-700 text-[9px] font-bold">
              +{hiddenCount} lainnya
            </span>
          )}
        </div>
      </div>

      {/* Footer kartu: Tombol aksi sekunder */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onEdit(room)}
          className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-400" />
          <span>Ubah Detail</span>
        </button>

        {isAvailable && onGenerateInvite && (
          <button
            type="button"
            onClick={() => onGenerateInvite(room)}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition cursor-pointer"
          >
            <KeyRound className="w-3 h-3 text-emerald-600" />
            <span>Bagikan Undangan</span>
          </button>
        )}
      </div>
    </div>
  );
};
