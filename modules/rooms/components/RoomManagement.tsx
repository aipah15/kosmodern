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
  Search,
  X,
  Copy,
  Check,
  Share2,
  Trash2,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import { Room, RoomFilterTab, RoomFormData } from "@/types/room";
import { RoomCard } from "./RoomCard";
import { RoomEditModal } from "@/components/admin/RoomEditModal";
import { roomService } from "@/modules/rooms/services/roomService";
import { tenantService } from "@/modules/tenants/services/tenantService";
import { Button } from "@/components/ui/Button";
import { DEFAULT_PROPERTY } from "@/lib/constants";

interface RoomManagementProps {
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onViewTenantProfile?: (tenantName: string) => void;
}

// Komponen modular manajemen properti & kamar kos untuk portal pemilik
export const RoomManagement: React.FC<RoomManagementProps> = ({
  onShowToast,
  onViewTenantProfile,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<RoomFilterTab>("all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"room_number" | "price_asc" | "price_desc">("room_number");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Status modal tambah/edit kamar
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Status modal konfirmasi hapus kamar
  const [deletingRoom, setDeletingRoom] = useState<{ id: string; roomNumber: string } | null>(null);

  // Status modal bagikan kode undangan
  const [inviteModalData, setInviteModalData] = useState<{
    roomNumber: string;
    code: string;
    inviteLink: string;
  } | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Memuat data kamar via roomService
  const loadRooms = async () => {
    setIsLoading(true);
    try {
      const [data, tenants] = await Promise.all([roomService.getRooms("all"), tenantService.getTenants("active")]);
      // Nama penghuni diambil dari tabel tenants (sumber kebenaran), bukan teks rooms.tenant_name yang bisa usang
      setRooms(
        (data || []).map((r) => {
          const occupant = tenants.find(
            (t) => (t.room_id && t.room_id === r.id) || (!t.room_id && t.room_number === r.room_number)
          );
          return { ...r, tenant_name: occupant?.full_name ?? null };
        })
      );
    } catch (err: any) {
      console.error("Gagal memuat kamar:", err);
      onShowToast(`Gagal memuat data kamar: ${err?.message || "kesalahan jaringan"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Menghitung statistik KPI kamar
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
      availableUnitName: availableUnit ? `Kamar ${availableUnit.room_number}` : "-",
      maintenanceUnitName: maintenanceUnit
        ? `Kamar ${maintenanceUnit.room_number} (${maintenanceUnit.maintenance_title || "Servis"})`
        : "-",
    };
  }, [rooms]);

  // Daftar lantai yang tersedia untuk filter lantai
  const availableFloors = useMemo(() => {
    const floors = new Set<string>();
    rooms.forEach((r) => {
      if (r.floor) floors.add(r.floor);
    });
    return Array.from(floors);
  }, [rooms]);

  // Filter daftar kamar berdasarkan tab aktif, lantai, dan kata kunci pencarian
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((r) => {
        // Filter status kamar
        if (activeFilter === "occupied") {
          if (r.status !== "occupied" && r.status !== "terisi") return false;
        } else if (activeFilter === "available") {
          if (r.status !== "available" && r.status !== "kosong") return false;
        } else if (activeFilter === "maintenance") {
          if (r.status !== "maintenance" && r.status !== "perbaikan") return false;
        }

        // Filter lantai
        if (selectedFloor !== "all" && r.floor !== selectedFloor) {
          return false;
        }

        // Filter kata kunci pencarian
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchNumber = r.room_number.toLowerCase().includes(q);
          const matchTenant = (r.tenant_name || "").toLowerCase().includes(q);
          const matchType = (r.room_type || "").toLowerCase().includes(q);
          const matchFloor = (r.floor || "").toLowerCase().includes(q);
          if (!matchNumber && !matchTenant && !matchType && !matchFloor) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return Number(a.price) - Number(b.price);
        if (sortBy === "price_desc") return Number(b.price) - Number(a.price);
        return a.room_number.localeCompare(b.room_number, undefined, { numeric: true });
      });
  }, [rooms, activeFilter, selectedFloor, searchQuery, sortBy]);

  // Perhitungan halaman / pagination
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

  // Simpan perubahan kamar (tambah baru atau update)
  const handleSaveRoom = async (formData: RoomFormData, roomId?: string) => {
    try {
      if (roomId) {
        await roomService.updateRoom(roomId, {
          room_number: formData.room_number,
          floor: formData.floor,
          room_type: formData.room_type,
          price: formData.price,
          status: formData.status,
          facilities: formData.facilities,
          description: formData.description,
        });
        onShowToast(`Kamar ${formData.room_number} berhasil diperbarui!`, "success");
      } else {
        await roomService.createRoom(formData);
        onShowToast(`Kamar ${formData.room_number} berhasil ditambahkan!`, "success");
      }
      setIsEditModalOpen(false);
      loadRooms();
    } catch (err: any) {
      console.error("Gagal menyimpan kamar:", err.message);
      onShowToast(`Gagal menyimpan kamar: ${err.message}`, "error");
    }
  };

  // Menyelesaikan status perbaikan kamar menjadi siap huni
  const handleCompleteMaintenance = async (roomId: string) => {
    try {
      await roomService.updateRoom(roomId, {
        status: "available",
        maintenance_title: null,
        maintenance_note: null,
      });
      onShowToast("Perbaikan unit kamar telah ditandai selesai!", "success");
      loadRooms();
    } catch (err: any) {
      onShowToast("Gagal memperbarui status perbaikan.", "error");
    }
  };

  // Menghapus data kamar
  const confirmDeleteRoom = async () => {
    if (!deletingRoom) return;
    try {
      await roomService.deleteRoom(deletingRoom.id);
      onShowToast(`Kamar ${deletingRoom.roomNumber} berhasil dihapus.`, "info");
      setDeletingRoom(null);
      loadRooms();
    } catch (err: any) {
      onShowToast(`Gagal menghapus kamar: ${err?.message}`, "error");
    }
  };

  // Membuat tautan undangan untuk kamar kosong
  const handleGenerateInvite = async (room: Room) => {
    try {
      const code = await tenantService.generateInviteCode(room.id);
      const link = typeof window !== "undefined"
        ? `${window.location.origin}/?code=${code}`
        : `https://kostyusi.com/?code=${code}`;

      setInviteModalData({
        roomNumber: room.room_number,
        code,
        inviteLink: link,
      });
      setCopiedInvite(false);
    } catch (err: any) {
      onShowToast(`Gagal membuat kode undangan: ${err?.message || "kesalahan jaringan"}`, "error");
    }
  };

  const handleCopyInviteLink = () => {
    if (!inviteModalData) return;
    navigator.clipboard.writeText(inviteModalData.inviteLink);
    setCopiedInvite(true);
    onShowToast("Link undangan pendaftaran kamar berhasil disalin!", "success");
    setTimeout(() => setCopiedInvite(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 4 Kartu KPI Interaktif (Dapat diklik langsung untuk memfilter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Kamar (Netral Slate) */}
        <div
          onClick={() => {
            setActiveFilter("all");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeFilter === "all"
              ? "border-slate-800 ring-2 ring-slate-800/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Kamar</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h4>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5 inline-block">100% kapasitas</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs">
              <Building className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 2: Terisi (Biru / Occupied) */}
        <div
          onClick={() => {
            setActiveFilter("occupied");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeFilter === "occupied"
              ? "border-blue-500 ring-2 ring-blue-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Terisi</p>
              <h4 className="text-2xl font-black text-blue-600 mt-1">{stats.occupied}</h4>
              <span className="text-[10px] text-blue-700 font-bold mt-0.5 inline-block">
                {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}% terhuni
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-2xs">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 3: Tersedia (Emerald / Ready) */}
        <div
          onClick={() => {
            setActiveFilter("available");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeFilter === "available"
              ? "border-emerald-500 ring-2 ring-emerald-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Tersedia</p>
              <h4 className="text-2xl font-black text-emerald-600 mt-1">{stats.available}</h4>
              <span className="text-[10px] text-emerald-700 font-bold mt-0.5 inline-block truncate max-w-[120px]">
                {stats.availableUnitName}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-2xs">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 4: Perbaikan (Amber / Maintenance) */}
        <div
          onClick={() => {
            setActiveFilter("maintenance");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
            activeFilter === "maintenance"
              ? "border-amber-500 ring-2 ring-amber-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Perbaikan</p>
              <h4 className="text-2xl font-black text-amber-600 mt-1">{stats.maintenance}</h4>
              <span className="text-[10px] text-amber-700 font-bold mt-0.5 inline-block truncate max-w-[120px]">
                {stats.maintenanceUnitName}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-2xs">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Pencarian, Filter Status & Aksi Tambah Kamar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Kolom Pencarian Cepat */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nomor kamar, nama penghuni, atau tipe..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tombol Aksi Kanan: Refresh & Tambah Kamar (Aksi Utama Brand Indigo) */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadRooms}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Segarkan
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNewRoom}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Tambah Kamar Baru
            </Button>
          </div>
        </div>

        {/* Filter Pills: Status Kamar, Lantai, dan Pengurutan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Filter Status dengan warna aktif spesifik tiap hierarki */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { key: "all", label: "Semua", count: stats.total, activeColor: "bg-slate-900 text-white shadow-xs" },
                { key: "occupied", label: "Terisi", count: stats.occupied, activeColor: "bg-blue-600 text-white shadow-xs shadow-blue-500/20" },
                { key: "available", label: "Tersedia", count: stats.available, activeColor: "bg-emerald-600 text-white shadow-xs shadow-emerald-500/20" },
                { key: "maintenance", label: "Perbaikan", count: stats.maintenance, activeColor: "bg-amber-600 text-white shadow-xs shadow-amber-500/20" },
              ] as const
            ).map((tab) => {
              const isCurrentActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveFilter(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isCurrentActive
                      ? tab.activeColor
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isCurrentActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Lantai & Urutan */}
          <div className="flex items-center gap-2 shrink-0">
            {availableFloors.length > 1 && (
              <select
                value={selectedFloor}
                onChange={(e) => {
                  setSelectedFloor(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">Semua Lantai</option>
                {availableFloors.map((fl) => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="room_number">Urut: No. Kamar</option>
              <option value="price_asc">Harga: Termurah</option>
              <option value="price_desc">Harga: Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Kartu Kamar */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse h-64" />
          ))}
        </div>
      ) : paginatedRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={handleEditRoom}
              onDelete={(id, num) => setDeletingRoom({ id, roomNumber: num })}
              onCompleteMaintenance={handleCompleteMaintenance}
              onViewTenantProfile={onViewTenantProfile}
              onGenerateInvite={handleGenerateInvite}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h5 className="font-bold text-slate-800 text-sm">Tidak ada kamar yang sesuai kriteria</h5>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ditemukan kamar yang cocok dengan kata kunci "${searchQuery}".`
              : "Tidak ada unit kamar pada kategori filter ini."}
          </p>
          {(searchQuery || activeFilter !== "all" || selectedFloor !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
                setSelectedFloor("all");
              }}
              className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      )}

      {/* Pagination Kontrol */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">
            Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari{" "}
            <span className="font-bold text-slate-800">{totalPages}</span> (Total {filteredRooms.length} Kamar)
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Modal Edit/Tambah Kamar */}
      {isEditModalOpen && (
        <RoomEditModal
          isOpen={isEditModalOpen}
          room={editingRoom}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveRoom}
        />
      )}

      {/* Modal Konfirmasi Hapus Kamar */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Hapus Kamar {deletingRoom.roomNumber}?
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tindakan ini akan menghapus data unit kamar dari sistem secara permanen.
            </p>

            <div className="flex items-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setDeletingRoom(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteRoom}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bagikan Tautan Undangan Kamar */}
      {inviteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Undangan Kamar {inviteModalData.roomNumber}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Kirim link ini ke calon penghuni baru
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              {/* Tampilan Kode Undangan */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  KODE UNDANGAN PENDAFTARAN
                </span>
                <span className="text-2xl font-black text-indigo-600 tracking-wider font-mono block mt-1">
                  {inviteModalData.code}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Calon penghuni otomatis terdaftar ke Kamar {inviteModalData.roomNumber}
                </span>
              </div>

              {/* Tautan Lengkap */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tautan Langsung (Direct Link)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteModalData.inviteLink}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    {copiedInvite ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tombol Bagikan WhatsApp */}
            <div className="pt-2 flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Halo, berikut adalah tautan pendaftaran sewa Kamar ${inviteModalData.roomNumber} di ${DEFAULT_PROPERTY.name} (Ibu ${DEFAULT_PROPERTY.ownerName}):\n${inviteModalData.inviteLink}\n\nAtau gunakan kode undangan: ${inviteModalData.code}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Bagikan ke WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
