"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  Check,
  Search,
  Filter,
  X,
  Eye,
  RefreshCw,
  Copy,
  CheckCircle,
  Building,
  CreditCard,
  Send,
} from "lucide-react";
import Image from "next/image";
import { Bill, BillFilterTab, BillStatus } from "@/types/bill";
import { createClient } from "@/lib/supabase/client";
import { billingService } from "@/modules/billing/services/billingService";
import { tenantService } from "@/modules/tenants/services/tenantService";

interface BillingManagementSectionProps {
  onShowCreateExtraBill: () => void;
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onNavigateToProof?: () => void;
}

// Komponen modular pengelolaan tagihan & pembayaran dengan hierarki warna semantik
export const BillingManagementSection: React.FC<BillingManagementSectionProps> = ({
  onShowCreateExtraBill,
  onShowToast,
  onNavigateToProof,
}) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<BillFilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // Oktober 2026
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal pratinjau kwitansi resmi
  const [kwitansiBill, setKwitansiBill] = useState<Bill | null>(null);

  // Modal pratinjau cepat bukti transfer
  const [previewProofBill, setPreviewProofBill] = useState<Bill | null>(null);

  // Status dropdown opsi aksi per baris
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const months = [
    "Januari 2026",
    "Februari 2026",
    "Maret 2026",
    "April 2026",
    "Mei 2026",
    "Juni 2026",
    "Juli 2026",
    "Agustus 2026",
    "September 2026",
    "Oktober 2026",
    "November 2026",
    "Desember 2026",
  ];

  const supabase = createClient();

  // Menutup dropdown menu aksi saat klik di luar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [activeMenuId]);

  // Memuat data tagihan dari Supabase dengan fallback data lengkap
  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("due_date", { ascending: false });

      if (error) throw error;
      // Data penghuni diambil dari tabel tenants (sumber kebenaran), bukan salinan lama di baris tagihan
      const tenants = await tenantService.getTenants();
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      setBills(
        ((data || []) as Bill[]).map((b) => {
          const t = tenants.find((x) => x.id === b.tenant_id);
          const pastDue = !!b.due_date && new Date(b.due_date).getTime() < startOfToday;
          const status = (b.status === "unpaid" || b.status === "belum_bayar") && pastDue ? "overdue" : b.status;
          return t
            ? {
                ...b,
                status,
                tenant_name: t.full_name,
                tenant_code: t.tenant_code,
                tenant_phone: t.phone,
                room_number: t.room_number,
                floor: t.floor,
                room_type: t.room_type,
              }
            : { ...b, status };
        })
      );
    } catch (err: any) {
      console.error("Gagal memuat tagihan:", err?.message);
      onShowToast(`Gagal memuat data tagihan: ${err?.message || "kesalahan jaringan"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Perhitungan statistik KPI tagihan dengan hierarki semantik
  const stats = useMemo(() => {
    const paidBills = bills.filter((b) => b.status === "paid" || b.status === "lunas");
    const totalPaidAmount = paidBills.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const pendingBills = bills.filter((b) => b.status === "pending" || b.status === "menunggu_verifikasi");
    const totalPendingAmount = pendingBills.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const unpaidBills = bills.filter((b) => b.status === "unpaid" || b.status === "belum_bayar");
    const totalUnpaidAmount = unpaidBills.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const overdueBills = bills.filter((b) => b.status === "overdue" || b.status === "terlambat");
    const totalOverdueAmount = overdueBills.reduce((acc, curr) => acc + Number(curr.amount), 0);

    return {
      totalCount: bills.length,
      paidCount: paidBills.length,
      paidAmount: totalPaidAmount,
      pendingCount: pendingBills.length,
      pendingAmount: totalPendingAmount,
      unpaidCount: unpaidBills.length,
      unpaidAmount: totalUnpaidAmount,
      overdueCount: overdueBills.length,
      overdueAmount: totalOverdueAmount,
    };
  }, [bills]);

  // Filter tagihan berdasarkan tab status, kategori pos, dan kata kunci pencarian
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      // Filter status
      if (activeFilter === "paid" && b.status !== "paid" && b.status !== "lunas") return false;
      if (activeFilter === "pending" && b.status !== "pending" && b.status !== "menunggu_verifikasi") return false;
      if (activeFilter === "unpaid" && b.status !== "unpaid" && b.status !== "belum_bayar") return false;
      if (activeFilter === "overdue" && b.status !== "overdue" && b.status !== "terlambat") return false;

      // Filter kategori
      if (selectedCategory !== "all" && b.bill_category !== selectedCategory) return false;

      // Filter kata kunci pencarian
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.tenant_name?.toLowerCase().includes(q);
        const matchRoom = b.room_number?.toLowerCase().includes(q);
        const matchInvoice = b.invoice_number?.toLowerCase().includes(q);
        const matchTitle = b.title?.toLowerCase().includes(q);
        if (!matchName && !matchRoom && !matchInvoice && !matchTitle) return false;
      }

      return true;
    });
  }, [bills, activeFilter, selectedCategory, searchQuery]);

  // Perhitungan pagination halaman
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage) || 1;
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBills.slice(start, start + itemsPerPage);
  }, [filteredBills, currentPage]);

  // Menandai tagihan lunas secara manual (misal pembayaran tunai langsung)
  const handleMarkAsPaid = async (bill: Bill) => {
    try {
      const updated = await billingService.updateBillStatus(bill.id, "paid");
      setBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, ...updated } : b)));
      setActiveMenuId(null);
      onShowToast(`Tagihan ${bill.invoice_number} berhasil ditandai Lunas!`, "success");
    } catch (err: any) {
      onShowToast(`Gagal menandai lunas: ${err?.message || "kesalahan jaringan"}`, "error");
    }
  };

  // Ekspor daftar tagihan ke format CSV / Excel
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["No. Invoice,Penghuni,Kamar,Jenis Tagihan,Periode,Nominal,Metode,Status"]
        .concat(
          filteredBills.map(
            (b) =>
              `"${b.invoice_number}","${b.tenant_name}","${b.room_number}","${b.title}","${b.period}","${b.amount}","${b.payment_method || "-"}","${b.status}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap_tagihan_${months[currentMonthIndex].replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("Laporan tagihan (CSV) berhasil diunduh!", "success");
  };

  // Ekspor / Cetak Rekap Resmi
  const handleExportPDF = () => {
    onShowToast(`Menyiapkan Rekap Tagihan Resmi ${months[currentMonthIndex]}...`, "info");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-indigo-100 text-indigo-700",
      "bg-emerald-100 text-emerald-700",
      "bg-blue-100 text-blue-700",
      "bg-amber-100 text-amber-700",
      "bg-teal-100 text-teal-700",
      "bg-purple-100 text-purple-700",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" ref={menuContainerRef}>
      {/* Header Halaman: Judul, Pemilih Bulan, dan Tombol Tambah Tagihan Manual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kelola Tagihan &amp; Pembayaran Penghuni
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Pantau arus kas sewa bulanan, jatuh tempo penghuni, dan verifikasi bukti transfer
          </p>
        </div>

        {/* Pemilih Periode Bulan & Aksi Utama Brand Indigo */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-center">
          {/* Navigator Bulan */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl px-2 py-1 shadow-xs">
            <button
              type="button"
              onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 px-2.5 text-xs font-bold text-slate-800 select-none">
              <Calendar className="w-3.5 h-3.5 text-[#4f46e5]" />
              <span>{months[currentMonthIndex]}</span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tombol Utama: + Tambah Tagihan Manual (Indigo Brand) */}
          <button
            type="button"
            onClick={onShowCreateExtraBill}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Tagihan Manual</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu KPI Interaktif dengan Hierarki Semantik Jelas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Total Masuk / Lunas (Emerald) */}
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
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Total Masuk / Lunas</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              • {stats.paidCount} Tagihan
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rp {stats.paidAmount.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            ✅ Pembayaran sewa terverifikasi
          </div>
        </div>

        {/* KPI 2: Menunggu Verifikasi (Biru / Pending) */}
        <div
          onClick={() => {
            setActiveFilter("pending");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            activeFilter === "pending"
              ? "border-blue-500 ring-2 ring-blue-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Menunggu Verifikasi</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
              • {stats.pendingCount} Tagihan
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rp {stats.pendingAmount.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">
              ⏰ {stats.pendingCount} bukti masuk
            </span>
            {onNavigateToProof && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToProof();
                }}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Cek Bukti &rarr;
              </button>
            )}
          </div>
        </div>

        {/* KPI 3: Belum Bayar (Amber / Menunggu) */}
        <div
          onClick={() => {
            setActiveFilter("unpaid");
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            activeFilter === "unpaid"
              ? "border-amber-500 ring-2 ring-amber-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Belum Bayar</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
              {stats.unpaidCount} Tagihan
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rp {stats.unpaidAmount.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            🗓️ Menjelang batas jatuh tempo
          </div>
        </div>

        {/* KPI 4: Terlambat (Rose / Keterlambatan) */}
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
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Terlambat</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
              • {stats.overdueCount} Tagihan
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              Rp {stats.overdueAmount.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] text-rose-500 font-medium">
            ⚠️ Memerlukan follow-up pengingat
          </div>
        </div>
      </div>

      {/* Toolbar Filter Cepat, Pencarian, & Kategori */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Kolom Pencarian Cepat (Nama, Kamar, No Invoice) */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari penghuni, no. kamar, atau no. invoice..."
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

          {/* Filter Kategori Pos & Segarkan Data */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="sewa">Sewa Kamar</option>
              <option value="listrik">Listrik Tambahan</option>
              <option value="air">Air PAM</option>
              <option value="denda">Denda Keterlambatan</option>
              <option value="deposit">Deposit</option>
              <option value="lainnya">Lainnya</option>
            </select>

            <button
              type="button"
              onClick={fetchBills}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Segarkan data tagihan"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>

        {/* Tab Pills Status Tagihan dengan Hierarki Warna Semantik */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-2 border-t border-slate-100">
          {(
            [
              { key: "all", label: "Semua", count: stats.totalCount, activeClass: "bg-slate-900 text-white shadow-xs" },
              { key: "paid", label: "Lunas", count: stats.paidCount, activeClass: "bg-emerald-600 text-white shadow-xs shadow-emerald-500/20" },
              { key: "pending", label: "Menunggu Verifikasi", count: stats.pendingCount, activeClass: "bg-blue-600 text-white shadow-xs shadow-blue-500/20" },
              { key: "unpaid", label: "Belum Bayar", count: stats.unpaidCount, activeClass: "bg-amber-600 text-white shadow-xs shadow-amber-500/20" },
              { key: "overdue", label: "Terlambat", count: stats.overdueCount, activeClass: "bg-rose-600 text-white shadow-xs shadow-rose-500/20" },
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

      {/* Tabel Utama Daftar Tagihan & Pembayaran */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.06),0_4px_12px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider bg-slate-50/50">
                <th className="py-3.5 pl-5 pr-4 uppercase">PENGHUNI</th>
                <th className="py-3.5 px-4 uppercase">KAMAR</th>
                <th className="py-3.5 px-4 uppercase">JENIS TAGIHAN</th>
                <th className="py-3.5 px-4 uppercase">PERIODE &amp; JATUH TEMPO</th>
                <th className="py-3.5 px-4 uppercase">NOMINAL</th>
                <th className="py-3.5 px-4 uppercase">STATUS PEMBAYARAN</th>
                <th className="py-3.5 pr-5 pl-4 uppercase text-right">AKSI</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <span>Memuat data tagihan...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Receipt className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="font-bold text-slate-700 text-xs">Tidak ada tagihan yang cocok</span>
                      <span className="text-[11px] text-slate-400">
                        {searchQuery
                          ? `Tidak ditemukan tagihan dengan kata kunci "${searchQuery}".`
                          : "Tidak ada tagihan pada filter status ini."}
                      </span>
                      {(searchQuery || selectedCategory !== "all" || activeFilter !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                            setActiveFilter("all");
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
                paginatedBills.map((bill, idx) => {
                  const isPaid = bill.status === "paid" || bill.status === "lunas";
                  const isPending = bill.status === "pending" || bill.status === "menunggu_verifikasi";
                  const isUnpaid = bill.status === "unpaid" || bill.status === "belum_bayar";
                  const isOverdue = bill.status === "overdue" || bill.status === "terlambat";

                  return (
                    <tr key={bill.id} className="hover:bg-[#f8faff] transition-colors">
                      {/* Kolom 1: Penghuni */}
                      <td className="py-4 pl-5 pr-4 min-w-[190px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${getAvatarColor(
                              idx
                            )}`}
                          >
                            {getInitials(bill.tenant_name)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs block leading-tight">
                              {bill.tenant_name}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {bill.tenant_code || "KM-P084"} • {bill.tenant_phone || "0812-9844-1201"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kolom 2: Kamar */}
                      <td className="py-4 px-4 min-w-[140px]">
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">
                            Kamar {bill.room_number.replace(/^Kamar\s*/i, "")}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {bill.floor || "Lt. 1"} • {bill.room_type || "Deluxe AC"}
                          </span>
                        </div>
                      </td>

                      {/* Kolom 3: Jenis Tagihan */}
                      <td className="py-4 px-4 min-w-[170px]">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            bill.bill_category === "denda"
                              ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                              : bill.bill_category === "listrik"
                              ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                              : bill.bill_category === "air"
                              ? "bg-sky-50 text-sky-800 border border-sky-200/80"
                              : "bg-indigo-50 text-[#4f46e5] border border-indigo-100"
                          }`}
                        >
                          {bill.title}
                        </span>
                      </td>

                      {/* Kolom 4: Periode & Jatuh Tempo */}
                      <td className="py-4 px-4 min-w-[170px]">
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">
                            {bill.period}
                          </span>
                          {isPaid ? (
                            <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                              Dibayar {bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long" }) : "Lunas"}
                            </span>
                          ) : isPending ? (
                            <span className="text-[10px] font-semibold text-blue-600 block mt-0.5">
                              Tempo: {bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </span>
                          ) : isUnpaid ? (
                            <span className="text-[10px] font-semibold text-amber-700 block mt-0.5">
                              Jatuh Tempo: {bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                              Lewat Tempo ({bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kolom 5: Nominal */}
                      <td className="py-4 px-4 min-w-[150px]">
                        <div>
                          <span className="font-black text-slate-900 text-xs block">
                            Rp {Number(bill.amount).toLocaleString("id-ID")}
                          </span>
                          {isOverdue && bill.fine_amount > 0 ? (
                            <span className="text-[10px] font-bold text-rose-500 block mt-0.5">
                              + Denda Rp {Number(bill.fine_amount).toLocaleString("id-ID")}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {bill.payment_method || "Transfer Bank BCA"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kolom 6: Status Pembayaran (Hierarki Semantik) */}
                      <td className="py-4 px-4 min-w-[150px]">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Lunas
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            Menunggu Verifikasi
                          </span>
                        )}
                        {isUnpaid && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Belum Bayar
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Terlambat
                          </span>
                        )}
                      </td>

                      {/* Kolom 7: Aksi Interaktif */}
                      <td className="py-4 pr-5 pl-4 text-right min-w-[140px] relative">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPaid ? (
                            <button
                              type="button"
                              onClick={() => setKwitansiBill(bill)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer shadow-xs"
                              title="Lihat & cetak kwitansi"
                            >
                              <FileText className="w-3 h-3 text-slate-500" />
                              <span>Kwitansi</span>
                            </button>
                          ) : isPending ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToProof) {
                                  onNavigateToProof();
                                } else if (bill.proof_url) {
                                  setPreviewProofBill(bill);
                                } else {
                                  onShowToast("Bukti pembayaran sedang diverifikasi.", "info");
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              title="Periksa bukti transfer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Cek Bukti</span>
                            </button>
                          ) : (
                            <a
                              href={`https://wa.me/${(bill.tenant_phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Halo Kak ${bill.tenant_name}, mengingatkan pembayaran tagihan ${bill.title} untuk Kamar ${bill.room_number} sebesar Rp ${Number(bill.amount).toLocaleString("id-ID")}. Pembayaran dapat ditransfer ke BCA 8465-201-998 a.n Arifa Andya Nafiisa. Terima kasih!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                              title="Kirim pengingat via WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Kirim WA</span>
                            </a>
                          )}

                          {/* Tombol Titik Tiga Dropdown Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(activeMenuId === bill.id ? null : bill.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                              title="Opsi lainnya"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu Aksi Baris */}
                            {activeMenuId === bill.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setKwitansiBill(bill);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium transition cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Lihat Kwitansi</span>
                                </button>

                                {!isPaid && (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsPaid(bill)}
                                    className="w-full px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-semibold transition cursor-pointer"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Tandai Lunas Manual</span>
                                  </button>
                                )}

                                {bill.proof_url && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewProofBill(bill);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 font-medium transition cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Pratinjau Bukti</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(bill.invoice_number);
                                    onShowToast(`Nomor ${bill.invoice_number} disalin!`, "success");
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium transition cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Salin No. Invoice</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel dengan Pagination Fungsional */}
        <div className="py-3.5 px-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium bg-slate-50/30">
          <span>
            Menampilkan{" "}
            <strong className="text-slate-800">
              {filteredBills.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredBills.length)}
            </strong>{" "}
            dari <strong className="text-slate-800">{filteredBills.length}</strong> tagihan
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center text-slate-600 transition cursor-pointer"
                title="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                    currentPage === page
                      ? "bg-[#4f46e5] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white flex items-center justify-center text-slate-600 transition cursor-pointer"
                title="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bar Aksi Bawah: Ekspor Excel, PDF Resmi, & Cetak Rekap */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Ekspor Excel/CSV</span>
        </button>

        <button
          type="button"
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
        >
          <FileText className="w-4 h-4 text-rose-500" />
          <span>Ekspor Rekap Resmi</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Rekap</span>
        </button>
      </div>

      {/* Modal Kwitansi Resmi Kost Yusi */}
      {kwitansiBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header Kwitansi */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Kwitansi Resmi Kost Yusi</h3>
                  <p className="text-[10px] text-slate-400">Bukti Pembayaran Sah Sistem Kos Modern</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setKwitansiBill(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Rincian Kwitansi */}
            <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>No. Invoice:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                  {kwitansiBill.invoice_number}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Diterima Dari:</span>
                <span className="font-bold text-slate-800">{kwitansiBill.tenant_name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Alokasi Unit:</span>
                <span className="font-bold text-slate-800">
                  Kamar {kwitansiBill.room_number} ({kwitansiBill.floor || "Lt. 1"})
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Peruntukan:</span>
                <span className="font-bold text-slate-800">{kwitansiBill.title}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Periode:</span>
                <span className="font-bold text-slate-800">{kwitansiBill.period}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Metode Pembayaran:</span>
                <span className="font-bold text-slate-800">
                  {kwitansiBill.payment_method || "Transfer Bank BCA"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-black pt-3 border-t border-slate-200/80 text-slate-900">
                <span>Jumlah Lunas:</span>
                <span className="text-[#4f46e5] text-base">
                  Rp {Number(kwitansiBill.amount).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Catatan Kaki & Pengelola */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Pemilik: Arifa Andya Nafiisa</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Lunas Terverifikasi
              </span>
            </div>

            {/* Aksi Tombol Kwitansi */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setKwitansiBill(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setKwitansiBill(null);
                }}
                className="px-4 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kwitansi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Cepat Bukti Transfer */}
      {previewProofBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Bukti Transfer Masuk</h3>
                <p className="text-[11px] text-slate-400">
                  {previewProofBill.tenant_name} • Kamar {previewProofBill.room_number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProofBill(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image
                src={previewProofBill.proof_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80"}
                alt="Bukti Transfer"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs flex justify-between items-center text-slate-700">
              <span>Nominal Tagihan:</span>
              <span className="font-black text-slate-900 text-sm">
                Rp {Number(previewProofBill.amount).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPreviewProofBill(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  handleMarkAsPaid(previewProofBill);
                  setPreviewProofBill(null);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Verifikasi &amp; Tandai Lunas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
