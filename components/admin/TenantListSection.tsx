"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  UserPlus,
  RefreshCw,
  Phone,
  Copy,
  Check,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  X,
  Building,
  Users,
  Eye,
  Send,
  MoreVertical,
} from "lucide-react";
import { Tenant } from "@/types/tenant";

interface TenantListSectionProps {
  tenants: Tenant[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectTenant: (tenant: Tenant) => void;
  onCreateTenant: () => void;
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onNavigateToVerification?: () => void;
}

export type TenantFilterTab = "all" | "paid" | "waiting_verification" | "unpaid" | "overdue";

// Komponen daftar penghuni kos dengan fitur pencarian real-time, filter status semantik, dan kartu KPI interaktif
export const TenantListSection: React.FC<TenantListSectionProps> = ({
  tenants,
  isLoading,
  onRefresh,
  onSelectTenant,
  onCreateTenant,
  onShowToast,
  onNavigateToVerification,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TenantFilterTab>("all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");

  // Perhitungan statistik KPI penghuni
  const stats = useMemo(() => {
    const totalActive = tenants.filter((t) => t.status === "active").length;
    const paidCount = tenants.filter((t) => t.bill_status === "paid").length;
    const waitingVerification = tenants.filter((t) => t.bill_status === "waiting_verification").length;
    const unpaidCount = tenants.filter((t) => t.bill_status === "unpaid").length;
    const overdueCount = tenants.filter((t) => t.bill_status === "overdue").length;
    const emptyRooms = Math.max(0, 10 - totalActive);

    return {
      totalActive,
      emptyRooms,
      paidCount,
      waitingVerification,
      unpaidCount,
      overdueCount,
    };
  }, [tenants]);

  // Daftar lantai unik
  const availableFloors = useMemo(() => {
    const floors = new Set<string>();
    tenants.forEach((t) => {
      if (t.floor) floors.add(t.floor);
    });
    return Array.from(floors);
  }, [tenants]);

  // Filter daftar penghuni berdasarkan kata kunci pencarian, tab status, dan lantai
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      // Filter status tagihan
      if (activeFilter === "paid" && t.bill_status !== "paid") return false;
      if (activeFilter === "waiting_verification" && t.bill_status !== "waiting_verification") return false;
      if (activeFilter === "unpaid" && t.bill_status !== "unpaid") return false;
      if (activeFilter === "overdue" && t.bill_status !== "overdue") return false;

      // Filter lantai
      if (selectedFloor !== "all" && t.floor !== selectedFloor) return false;

      // Filter pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.full_name?.toLowerCase().includes(q);
        const matchRoom = t.room_number?.toLowerCase().includes(q);
        const matchCode = t.tenant_code?.toLowerCase().includes(q);
        const matchPhone = t.phone?.toLowerCase().includes(q);
        const matchJob = t.occupation?.toLowerCase().includes(q) || t.institution?.toLowerCase().includes(q);
        if (!matchName && !matchRoom && !matchCode && !matchPhone && !matchJob) return false;
      }

      return true;
    });
  }, [tenants, activeFilter, selectedFloor, searchQuery]);

  // Pagination daftar penghuni
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTenants.slice(start, start + itemsPerPage);
  }, [filteredTenants, currentPage, itemsPerPage]);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedTenants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTenants.map((t) => t.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    onShowToast(`Nomor ${phone} disalin ke clipboard!`, "success");
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleExportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Nama,Kamar,WhatsApp,Pekerjaan,Status Tagihan,Masuk"]
        .concat(
          filteredTenants.map(
            (t) =>
              `"${t.tenant_code}","${t.full_name}","${t.room_number}","${t.phone}","${t.occupation || "-"}","${t.bill_status}","${t.check_in_date}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daftar_penghuni_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("Data penghuni berhasil diunduh (CSV)!", "success");
  };

  const formatCheckIn = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-blue-100 text-blue-700",
      "bg-emerald-100 text-emerald-700",
      "bg-indigo-100 text-indigo-700",
      "bg-purple-100 text-purple-700",
      "bg-amber-100 text-amber-700",
      "bg-teal-100 text-teal-700",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Halaman: Judul, Deskripsi, dan Tombol Tambah Penghuni */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
            MANAJEMEN PENYEWA •
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Daftar Penghuni Kos
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Kelola data identitas penyewa aktif, alokasi unit kamar, kontak darurat, dan status pembayaran sewa bulanan
          </p>
        </div>

        {/* Tombol Aksi Kanan: Unduh Data & Tambah Penghuni Baru */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh CSV</span>
          </button>

          <button
            type="button"
            onClick={onCreateTenant}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Penghuni</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu KPI Interaktif dengan Hierarki Semantik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Penghuni Aktif (Biru Stabil) */}
        <div
          onClick={() => {
            setActiveFilter("all");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            activeFilter === "all"
              ? "border-blue-500 ring-2 ring-blue-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              PENGHUNI AKTIF
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {stats.totalActive}
              </span>
              <span className="text-xs font-medium text-slate-500">orang</span>
            </div>
            <p className="text-xs text-blue-700 font-semibold mt-1">
              {stats.emptyRooms} unit kamar siap huni
            </p>
          </div>
        </div>

        {/* KPI 2: Lunas Bulan Ini (Fresh Emerald) */}
        <div
          onClick={() => {
            setActiveFilter("paid");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            activeFilter === "paid"
              ? "border-emerald-500 ring-2 ring-emerald-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              LUNAS OKTOBER
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {stats.paidCount}
              </span>
              <span className="text-xs font-medium text-slate-500">penghuni</span>
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              Sewa bulan ini telah lunas
            </p>
          </div>
        </div>

        {/* KPI 3: Menunggu Verifikasi (Royal Blue) */}
        <div
          onClick={() => {
            setActiveFilter("waiting_verification");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            activeFilter === "waiting_verification"
              ? "border-blue-500 ring-2 ring-blue-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              MENUNGGU VERIFIKASI
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {stats.waitingVerification}
              </span>
              <span className="text-xs font-medium text-slate-500">penghuni</span>
            </div>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              Bukti transfer perlu dicek
            </p>
          </div>
        </div>

        {/* KPI 4: Menunggak / Terlambat (Alert Rose) */}
        <div
          onClick={() => {
            setActiveFilter("overdue");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            activeFilter === "overdue"
              ? "border-rose-500 ring-2 ring-rose-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              MENUNGGAK
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60 shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-rose-600 leading-none">
                {stats.overdueCount}
              </span>
              <span className="text-xs font-medium text-slate-500">penghuni</span>
            </div>
            <p className="text-xs text-rose-600 font-semibold mt-1">
              Lewat jatuh tempo sewa
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Pencarian Real-Time & Filter Status Semantik */}
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
              placeholder="Cari nama penghuni, kamar, kode ID, no. WA, atau instansi..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Lantai & Tombol Segarkan */}
          <div className="flex items-center gap-2 shrink-0">
            {availableFloors.length > 0 && (
              <select
                value={selectedFloor}
                onChange={(e) => {
                  setSelectedFloor(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="all">Semua Lantai</option>
                {availableFloors.map((fl) => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Segarkan data penghuni"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Status Tagihan Penghuni */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-2 border-t border-slate-100">
          {(
            [
              { key: "all", label: "Semua Penghuni", count: stats.totalActive, activeClass: "bg-slate-900 text-white shadow-xs" },
              { key: "paid", label: "Lunas", count: stats.paidCount, activeClass: "bg-emerald-600 text-white shadow-xs shadow-emerald-500/20" },
              { key: "waiting_verification", label: "Menunggu Verifikasi", count: stats.waitingVerification, activeClass: "bg-blue-600 text-white shadow-xs shadow-blue-500/20" },
              { key: "unpaid", label: "Belum Bayar", count: stats.unpaidCount, activeClass: "bg-amber-600 text-white shadow-xs shadow-amber-500/20" },
              { key: "overdue", label: "Menunggak", count: stats.overdueCount, activeClass: "bg-rose-600 text-white shadow-xs shadow-rose-500/20" },
            ] as const
          ).map((tab) => {
            const isTabActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isTabActive
                    ? tab.activeClass
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isTabActive
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
      </div>

      {/* Tabel Utama Daftar Penghuni Kos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.06),0_4px_12px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider bg-slate-50/50">
                <th className="py-3.5 pl-5 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedTenants.length > 0 && selectedIds.length === paginatedTenants.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-bold uppercase">PENGHUNI &amp; PROFIL</th>
                <th className="py-3.5 px-4 font-bold uppercase">UNIT KAMAR</th>
                <th className="py-3.5 px-4 font-bold uppercase">KONTAK WHATSAPP</th>
                <th className="py-3.5 px-4 font-bold uppercase">STATUS TAGIHAN SEWA</th>
                <th className="py-3.5 pr-5 pl-4 font-bold uppercase text-right">AKSI</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <span>Memuat data penghuni...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Users className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="font-bold text-slate-700 text-xs">Tidak ada penghuni yang cocok</span>
                      <span className="text-[11px] text-slate-400">
                        {searchQuery
                          ? `Tidak ditemukan penghuni dengan kata kunci "${searchQuery}".`
                          : "Tidak ada data pada kategori filter ini."}
                      </span>
                      {(searchQuery || activeFilter !== "all" || selectedFloor !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setActiveFilter("all");
                            setSelectedFloor("all");
                          }}
                          className="mt-3 px-3.5 py-1.5 bg-indigo-50 text-[#4f46e5] text-xs font-bold rounded-xl hover:bg-indigo-100 transition cursor-pointer"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tenant, idx) => {
                  const isChecked = selectedIds.includes(tenant.id);
                  const rawPhone = tenant.phone.replace(/[^0-9]/g, "");
                  const waNumber = rawPhone.startsWith("0") ? `62${rawPhone.substring(1)}` : rawPhone.startsWith("62") ? rawPhone : `62${rawPhone}`;

                  return (
                    <tr
                      key={tenant.id}
                      className={`hover:bg-[#f8faff] transition-colors ${
                        isChecked ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      {/* Checkbox Baris */}
                      <td className="py-4 pl-5 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(tenant.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Kolom 1: Penghuni & Profil */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${getAvatarColor(
                              idx
                            )}`}
                          >
                            {getInitials(tenant.full_name)}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => onSelectTenant(tenant)}
                              className="font-extrabold text-slate-900 text-xs sm:text-sm hover:text-indigo-600 text-left transition cursor-pointer block leading-tight"
                            >
                              {tenant.full_name}
                            </button>

                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                              <span className="font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                {tenant.tenant_code}
                              </span>
                              <span>•</span>
                              <span>Masuk {formatCheckIn(tenant.check_in_date)}</span>
                            </div>
                            {tenant.occupation && (
                              <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[160px]">
                                {tenant.occupation} {tenant.institution ? `(${tenant.institution})` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Kolom 2: Unit Kamar & Properti */}
                      <td className="py-4 px-4 min-w-[150px]">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            Kamar {tenant.room_number.replace(/^Kamar\s*/i, "")}{" "}
                            <span className="text-slate-400 font-normal">
                              • {tenant.floor || "Lt. 1"}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {tenant.room_type || "Deluxe AC"}
                          </div>
                          <div className="text-[9px] font-black text-rose-500 tracking-wider uppercase mt-0.5">
                            {tenant.property_name || "KOST YUSI"}
                          </div>
                        </div>
                      </td>

                      {/* Kolom 3: Kontak WhatsApp */}
                      <td className="py-4 px-4 min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs font-mono">
                            {tenant.phone}
                          </span>

                          <a
                            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                              `Halo Kak ${tenant.full_name}, salam dari pengelola Kost Yusi. Semoga nyaman tinggal di Kamar ${tenant.room_number} ya!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition cursor-pointer"
                            title="Chat via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleCopyPhone(tenant.phone)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                            title="Salin nomor WhatsApp"
                          >
                            {copiedPhone === tenant.phone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Kolom 4: Status Tagihan Sewa (Hierarki Semantik) */}
                      <td className="py-4 px-4 min-w-[190px]">
                        {tenant.bill_status === "waiting_verification" ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                              Menunggu Verifikasi
                            </span>
                            {onNavigateToVerification && (
                              <button
                                type="button"
                                onClick={onNavigateToVerification}
                                className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                                title="Periksa bukti transfer"
                              >
                                Cek Bukti &rarr;
                              </button>
                            )}
                          </div>
                        ) : tenant.bill_status === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Lunas Oktober</span>
                          </span>
                        ) : tenant.bill_status === "unpaid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Belum Bayar (Jatuh Tempo tgl {tenant.due_date_day})</span>
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                <span>Terlambat {tenant.overdue_days || 11} Hari</span>
                              </span>
                              <span className="text-[10px] text-rose-500 font-semibold">
                                (+Denda {tenant.fine_amount ? `${tenant.fine_amount / 1000}rb` : "50rb"})
                              </span>
                            </div>

                            <div>
                              <a
                                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                                  `Halo Kak ${tenant.full_name}, mengingatkan tagihan sewa kos Kamar ${tenant.room_number} telah melewati jatuh tempo. Pembayaran dapat ditransfer ke BCA 8465-201-998 a.n Arifa Andya Nafiisa. Terima kasih!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
                              >
                                <span>&rarr; Kirim Pengingat WA</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Kolom 5: Aksi Interaktif */}
                      <td className="py-4 pr-5 pl-4 text-right min-w-[120px]">
                        <button
                          type="button"
                          onClick={() => onSelectTenant(tenant)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 text-[11px] font-bold rounded-lg transition cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>Profil</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel dengan Pagination Fungsional */}
        <div className="py-3.5 px-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium bg-slate-50/30">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Menampilkan{" "}
              <strong className="text-slate-800">
                {filteredTenants.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredTenants.length)}
              </strong>{" "}
              dari <strong className="text-slate-800">{filteredTenants.length}</strong> penghuni
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Baris:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={5}>5 per halaman</option>
                <option value={10}>10 per halaman</option>
                <option value={20}>20 per halaman</option>
              </select>
            </div>
          </div>

          {/* Kontrol Navigasi Halaman */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-slate-600 transition cursor-pointer"
                title="Halaman sebelumnya"
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
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
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
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-slate-600 transition cursor-pointer"
                title="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
