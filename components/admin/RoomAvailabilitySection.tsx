"use client";

import React, { useState, useEffect } from "react";
import { Bed, KeyRound, Wrench, Home, RefreshCw } from "lucide-react";
import { roomService } from "@/modules/rooms/services/roomService";
import { Room } from "@/types/room";

interface RoomAvailabilitySectionProps {
  onManageRooms?: () => void;
}

// Komponen ringkasan ketersediaan kamar pada dasbor admin
export const RoomAvailabilitySection: React.FC<RoomAvailabilitySectionProps> = ({
  onManageRooms,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    maintenance: 0,
    occupancyRate: 0,
  });
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [maintenanceRooms, setMaintenanceRooms] = useState<Room[]>([]);

  // Memuat data ketersediaan kamar dari roomService
  const loadRoomData = async () => {
    try {
      setIsLoading(true);
      const [roomStats, allRooms] = await Promise.all([
        roomService.getRoomStats(),
        roomService.getRooms("all"),
      ]);

      setStats(roomStats);
      setAvailableRooms(
        allRooms.filter((r) => r.status === "available" || r.status === "kosong")
      );
      setMaintenanceRooms(
        allRooms.filter((r) => r.status === "maintenance" || r.status === "perbaikan")
      );
      setLoadError(null);
    } catch (err: any) {
      console.error("Gagal memuat status kamar:", err);
      setLoadError(err?.message || "Gagal memuat data kamar");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoomData();
  }, []);

  // Hitung persentase untuk progress bar bersegmen
  const total = stats.total || 1;
  const occupiedPct = Math.round((stats.occupied / total) * 100);
  const availablePct = Math.round((stats.available / total) * 100);
  const maintenancePct = Math.max(0, 100 - occupiedPct - availablePct);

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06),0_5px_15px_-5px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
      {loadError && (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
          Gagal memuat data kamar: {loadError}
        </div>
      )}
      {/* Header Bagian */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            KETERSEDIAAN UNIT
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Kondisi Kamar Saat Ini
          </h3>
        </div>
        <button
          type="button"
          onClick={loadRoomData}
          title="Muat ulang ketersediaan kamar"
          className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center justify-center transition cursor-pointer"
        >
          <Bed className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Progress Bar & Ringkasan Okupansi */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-700">Total {stats.total} Kamar</span>
          <span className="text-blue-600 font-bold">
            {stats.occupied} Terisi ({stats.occupancyRate}%)
          </span>
        </div>

        {/* Bar Segmentasi Okupansi */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex gap-0.5 p-0.5">
          <div
            className="h-full bg-blue-600 rounded-l-full transition-all duration-500"
            style={{ width: `${occupiedPct}%` }}
            title={`Terisi: ${stats.occupied} kamar (${occupiedPct}%)`}
          />
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${availablePct}%` }}
            title={`Kosong: ${stats.available} kamar (${availablePct}%)`}
          />
          <div
            className="h-full bg-amber-500 rounded-r-full transition-all duration-500"
            style={{ width: `${maintenancePct}%` }}
            title={`Perbaikan: ${stats.maintenance} kamar (${maintenancePct}%)`}
          />
        </div>

        {/* Legenda Warna Semantik */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Terisi ({stats.occupied})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Kosong ({stats.available})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Perbaikan ({stats.maintenance})
          </span>
        </div>
      </div>

      {/* Daftar Rincian Kamar */}
      <div className="space-y-2.5">
        {/* Kamar Siap Huni (Emerald) */}
        <div className="bg-[#f8faff] border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Kamar Siap Huni
              </h4>
              <p className="text-[10px] text-slate-400 font-normal">
                {availableRooms.length > 0
                  ? `Kamar ${availableRooms.map((r) => r.room_number).join(", ")}`
                  : "Siap disewakan langsung"}
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-emerald-600 shrink-0">
            {stats.available} Kamar
          </span>
        </div>

        {/* Kamar Perbaikan (Amber) */}
        <div className="bg-[#f8faff] border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Kamar Perbaikan
              </h4>
              <p className="text-[10px] text-slate-400 font-normal">
                {maintenanceRooms.length > 0
                  ? `Kamar ${maintenanceRooms.map((r) => r.room_number).join(", ")}`
                  : "AC & peremajaan cat"}
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-amber-600 shrink-0">
            {stats.maintenance} Kamar
          </span>
        </div>
      </div>

      {/* Tombol Kelola Unit - Tepat berada di bawah daftar kamar tanpa jarak berlebih */}
      <button
        type="button"
        onClick={onManageRooms}
        className="w-full mt-3.5 py-2.5 px-4 bg-[#eef2ff] hover:bg-indigo-100 text-[#4f46e5] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
      >
        <Home className="w-4 h-4" />
        <span>Kelola Ketersediaan Kamar</span>
      </button>
    </div>
  );
};
