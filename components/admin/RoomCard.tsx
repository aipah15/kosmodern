"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Pencil,
  Wrench,
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
} from "lucide-react";
import { Room } from "@/types/room";

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onCompleteMaintenance?: (roomId: string) => void;
  onViewTenantProfile?: (tenantName: string) => void;
}

// Icon helper for facility tags
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

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onEdit,
  onCompleteMaintenance,
  onViewTenantProfile,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const isOccupied = room.status === "occupied" || room.status === "terisi";
  const isAvailable = room.status === "available" || room.status === "kosong";
  const isMaintenance = room.status === "maintenance" || room.status === "perbaikan";

  // Initials for avatar
  const getInitials = (name?: string | null) => {
    if (!name) return "P";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(room.price) || 0);

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.06),0_4px_12px_-4px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col justify-between hover:shadow-md hover:border-indigo-100/80 transition-all duration-200">
      <div>
        {/* Card Header Row */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Room Code Badge */}
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 tracking-tight shadow-xs ${
                isAvailable
                  ? "bg-[#4f46e5] text-white"
                  : isMaintenance
                    ? "bg-amber-100 text-amber-800 border border-amber-200/80"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-100"
              }`}
            >
              {room.room_number.replace(/^Kamar\s+/i, "")}
            </div>

            {/* Room Title, Status, and Floor */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  Kamar {room.room_number.replace(/^Kamar\s+/i, "")}
                </h4>
                {isOccupied && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Terisi
                  </span>
                )}
                {isAvailable && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Kosong (Siap)
                  </span>
                )}
                {isMaintenance && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Perbaikan
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                {room.floor || "Lantai 1"}
              </p>
            </div>
          </div>

          {/* Three dots menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              aria-label="Menu Kamar"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-30 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(room);
                    }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Edit Spesifikasi</span>
                  </button>

                  {isMaintenance && onCompleteMaintenance && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onCompleteMaintenance(room.id);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Selesaikan Servis</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Room Image Container */}
        <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden mt-3.5 bg-slate-100 group">
          {room.image_url ? (
            <img
              src={room.image_url}
              alt={`Foto Kamar ${room.room_number}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-50/50 text-indigo-400">
              <Bed className="w-12 h-12 stroke-[1.5]" />
            </div>
          )}

          {/* Maintenance banner in center if applicable */}
          {isMaintenance && (
            <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] flex items-center justify-center p-3">
              <div className="bg-white/95 text-amber-800 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-lg border border-amber-200 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>{room.maintenance_title || "Servis AC Berkala"}</span>
              </div>
            </div>
          )}

          {/* Overlay Pill on Image Bottom-Left: Room Type */}
          <div className="absolute bottom-2.5 left-2.5 bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg">
            {room.room_type || "Deluxe AC"}
          </div>

          {/* Overlay Pill on Image Bottom-Right: Price */}
          <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
            <span>{formattedPrice}</span>
            <span className="text-[10px] text-slate-500 font-normal ml-0.5">/bln</span>
          </div>
        </div>

        {/* Middle Section: Occupant OR Ready Banner OR Maintenance Action */}
        <div className="mt-3.5">
          {isOccupied && (
            <div className="flex items-center justify-between bg-slate-50/70 border border-slate-100 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#4f46e5] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(room.tenant_name)}
                </div>
                <span className="text-xs font-bold text-slate-800 truncate">
                  {room.tenant_name || "Penghuni Terdaftar"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onViewTenantProfile?.(room.tenant_name || "Penghuni")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition cursor-pointer shrink-0"
              >
                <span>Profil</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}

          {isAvailable && (
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl px-3 py-2 flex items-center gap-2 text-[#4f46e5]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold">Siap ditempati segera</span>
            </div>
          )}

          {isMaintenance && (
            <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-800 text-xs font-semibold min-w-0">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{room.maintenance_note || "Pembersihan AC & Filter"}</span>
              </div>
              {onCompleteMaintenance && (
                <button
                  type="button"
                  onClick={() => onCompleteMaintenance(room.id)}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold rounded-lg transition cursor-pointer shrink-0"
                >
                  Selesaikan
                </button>
              )}
            </div>
          )}
        </div>

        {/* Facilities Tag Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {(room.facilities && room.facilities.length > 0
            ? room.facilities
            : ["AC", "KM Dalam", "Springbed"]
          ).map((facility, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-medium"
            >
              {getFacilityIcon(facility)}
              <span>{facility}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: Edit Detail Link */}
      <div className="pt-3 mt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onEdit(room)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Detail</span>
        </button>
      </div>
    </div>
  );
};
