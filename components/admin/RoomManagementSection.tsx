"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building,
  UserCheck,
  KeyRound,
  Wrench,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Room, RoomFilterTab, RoomFormData } from "@/types/room";
import { RoomCard } from "./RoomCard";
import { RoomEditModal } from "./RoomEditModal";
import { createClient } from "@/lib/supabase/client";

interface RoomManagementSectionProps {
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onViewTenantProfile?: (tenantName: string) => void;
}

export const RoomManagementSection: React.FC<RoomManagementSectionProps> = ({
  onShowToast,
  onViewTenantProfile,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RoomFilterTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const supabase = createClient();

  // Fetch rooms from Supabase
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number", { ascending: true });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setRooms(data as Room[]);
      }
    } catch (err: any) {
      console.error("Error loading rooms:", err.message);
      onShowToast("Gagal memuat data kamar dari server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Compute KPI Counts
  const stats = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter(
      (r) => r.status === "occupied" || r.status === "terisi"
    ).length;
    const available = rooms.filter(
      (r) => r.status === "available" || r.status === "kosong"
    ).length;
    const maintenance = rooms.filter(
      (r) => r.status === "maintenance" || r.status === "perbaikan"
    ).length;

    const availableUnit = rooms.find(
      (r) => r.status === "available" || r.status === "kosong"
    );
    const maintenanceUnit = rooms.find(
      (r) => r.status === "maintenance" || r.status === "perbaikan"
    );

    return {
      total,
      occupied,
      available,
      maintenance,
      availableUnitName: availableUnit ? `Unit ${availableUnit.room_number}` : "-",
      maintenanceUnitName: maintenanceUnit
        ? `Unit ${maintenanceUnit.room_number} (${maintenanceUnit.maintenance_title || "Servis AC"})`
        : "-",
    };
  }, [rooms]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (activeFilter === "occupied") {
        return r.status === "occupied" || r.status === "terisi";
      }
      if (activeFilter === "available") {
        return r.status === "available" || r.status === "kosong";
      }
      if (activeFilter === "maintenance") {
        return r.status === "maintenance" || r.status === "perbaikan";
      }
      return true;
    });
  }, [rooms, activeFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage) || 1;
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRooms.slice(start, start + itemsPerPage);
  }, [filteredRooms, currentPage]);

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsEditModalOpen(true);
  };

  const handleAddNewRoom = () => {
    setEditingRoom(null);
    setIsEditModalOpen(true);
  };

  const handleSaveRoom = async (formData: RoomFormData, roomId?: string) => {
    try {
      if (roomId) {
        // Update existing room
        const { error } = await supabase
          .from("rooms")
          .update({
            room_number: formData.room_number,
            floor: formData.floor,
            room_type: formData.room_type,
            price: formData.price,
            status: formData.status,
            facilities: formData.facilities,
            description: formData.description,
            property_name: formData.property_name || "Wisma Melati",
            updated_at: new Date().toISOString(),
          })
          .eq("id", roomId);

        if (error) throw error;

        // Optimistically update local state
        setRooms((prev) =>
          prev.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  room_number: formData.room_number,
                  floor: formData.floor,
                  room_type: formData.room_type,
                  price: formData.price,
                  status: formData.status,
                  facilities: formData.facilities,
                  description: formData.description,
                }
              : r
          )
        );
        onShowToast(`Spesifikasi Kamar ${formData.room_number} berhasil diperbarui!`, "success");
      } else {
        // Insert new room
        const { data, error } = await supabase
          .from("rooms")
          .insert([
            {
              room_number: formData.room_number,
              floor: formData.floor,
              room_type: formData.room_type,
              price: formData.price,
              status: formData.status,
              facilities: formData.facilities,
              description: formData.description,
              property_name: "Wisma Melati",
              image_url:
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
            },
          ])
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          setRooms((prev) => [...prev, data[0] as Room]);
        }
        onShowToast(`Kamar ${formData.room_number} berhasil ditambahkan dan dipublikasikan!`, "success");
      }
    } catch (err: any) {
      console.error("Save room error:", err);
      onShowToast(`Gagal menyimpan data kamar: ${err.message}`, "error");
      throw err;
    }
  };

  const handleCompleteMaintenance = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from("rooms")
        .update({
          status: "available",
          maintenance_title: null,
          maintenance_note: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", roomId);

      if (error) throw error;

      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? {
                ...r,
                status: "available",
                maintenance_title: null,
                maintenance_note: null,
              }
            : r
        )
      );
      onShowToast("Perbaikan kamar selesai! Status kamar kini 'Kosong (Siap Huni)'.", "success");
    } catch (err: any) {
      onShowToast(`Gagal menyelesaikan servis: ${err.message}`, "error");
    }
  };

  const handleViewTenantProfile = (tenantName: string) => {
    if (onViewTenantProfile) {
      onViewTenantProfile(tenantName);
    } else {
      onShowToast(`Melihat profil penghuni: ${tenantName}`, "info");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle matching Image 1 */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Manajemen &amp; Alokasi Kamar
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pantau ketersediaan unit, status hunian, tarif sewa, serta kelola spesifikasi kamar secara efisien.
        </p>
      </div>

      {/* 4 KPI Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Kapasitas */}
        <div className="bg-white rounded-[22px] border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL KAPASITAS
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.total}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Kamar
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">
              Portofolio: {stats.total} Kamar Total
            </span>
            <span className="text-indigo-600 font-bold">100% Aktif</span>
          </div>
        </div>

        {/* Card 2: Terisi (Occupied) */}
        <div className="bg-white rounded-[22px] border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TERISI (OCCUPIED)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.occupied}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  Kamar
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">
              Portofolio: {stats.total} Kamar Total
            </span>
            <span className="text-indigo-600 font-bold">100% Aktif</span>
          </div>
        </div>

        {/* Card 3: Kosong (Siap Huni) */}
        <div className="bg-white rounded-[22px] border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                KOSONG (SIAP HUNI)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.available}
                </span>
                <span className="text-xs font-semibold text-indigo-600">
                  Kamar Siap
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center text-[11px]">
            <span className="text-indigo-600 font-semibold flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {stats.availableUnitName}
            </span>
          </div>
        </div>

        {/* Card 4: Perbaikan (Maintenance) */}
        <div className="bg-white rounded-[22px] border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PERBAIKAN (MAINTENANCE)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                  {stats.maintenance}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  Kamar
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center text-[11px]">
            <span className="text-amber-700 font-medium truncate">
              {stats.maintenanceUnitName}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Add Room Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Filter Pills matching Image 1 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Semua */}
          <button
            type="button"
            onClick={() => {
              setActiveFilter("all");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-600/25"
                : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            Semua ({stats.total})
          </button>

          {/* Terisi */}
          <button
            type="button"
            onClick={() => {
              setActiveFilter("occupied");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "occupied"
                ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-600/25"
                : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Terisi ({stats.occupied})</span>
          </button>

          {/* Kosong */}
          <button
            type="button"
            onClick={() => {
              setActiveFilter("available");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "available"
                ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-600/25"
                : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Kosong ({stats.available})</span>
          </button>

          {/* Perbaikan */}
          <button
            type="button"
            onClick={() => {
              setActiveFilter("maintenance");
              setCurrentPage(1);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "maintenance"
                ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-600/25"
                : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Perbaikan ({stats.maintenance})</span>
          </button>
        </div>

        {/* Action Button: Tambah Kamar Baru */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchRooms}
            className="p-2 bg-white border border-slate-200/80 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleAddNewRoom}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-bold text-xs rounded-xl border border-indigo-200/60 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kamar</span>
          </button>
        </div>
      </div>

      {/* Room Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-[#4f46e5] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Memuat daftar unit kamar...
          </span>
        </div>
      ) : paginatedRooms.length === 0 ? (
        <div className="py-16 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center p-6">
          <Building className="w-12 h-12 text-slate-300 stroke-[1.5] mb-3" />
          <h4 className="text-sm font-bold text-slate-700">
            Tidak ada kamar yang sesuai filter
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Silakan pilih filter lain atau klik tombol Tambah Kamar untuk menambahkan unit baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleEditRoom}
              onCompleteMaintenance={handleCompleteMaintenance}
              onViewTenantProfile={handleViewTenantProfile}
            />
          ))}
        </div>
      )}

      {/* Pagination Footer matching Image 1 */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400 font-medium">
          Menampilkan <span className="font-bold text-slate-700">{paginatedRooms.length}</span> dari{" "}
          <span className="font-bold text-slate-700">{rooms.length}</span> total kamar di Wisma Melati
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-slate-600 transition cursor-pointer"
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-[#4f46e5] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-slate-600 transition cursor-pointer"
              aria-label="Halaman Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Room Edit/Create Modal */}
      <RoomEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        room={editingRoom}
        onSave={handleSaveRoom}
      />
    </div>
  );
};
