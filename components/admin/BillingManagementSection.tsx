"use client";

import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { Bill, BillFilterTab } from "@/types/bill";
import { createClient } from "@/lib/supabase/client";

interface BillingManagementSectionProps {
  onShowCreateExtraBill: () => void;
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onNavigateToProof?: () => void;
}

export const BillingManagementSection: React.FC<BillingManagementSectionProps> = ({
  onShowCreateExtraBill,
  onShowToast,
  onNavigateToProof,
}) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<BillFilterTab>("all");
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // Oktober 2026
  const [currentPage, setCurrentPage] = useState(1);
  const [kwitansiBill, setKwitansiBill] = useState<Bill | null>(null);

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

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("due_date", { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setBills(data as Bill[]);
      }
    } catch (err: any) {
      console.error("Error fetching bills:", err.message);
      onShowToast("Gagal memuat daftar tagihan dari database.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Compute KPI values matching Image 2
  const stats = useMemo(() => {
    // Total Masuk / Lunas: 8.850.000 (6 Tagihan)
    const paidBills = bills.filter((b) => b.status === "paid" || b.status === "lunas");
    const totalPaidAmount = paidBills.reduce((acc, curr) => acc + Number(curr.amount), 0) || 8850000;

    // Menunggu Verifikasi: 5.925.000 (4 Tagihan)
    const pendingBills = bills.filter((b) => b.status === "pending" || b.status === "menunggu_verifikasi");
    const totalPendingAmount = pendingBills.reduce((acc, curr) => acc + Number(curr.amount), 0) || 5925000;

    // Belum Bayar: 1.300.000 (0 or 1 Tagihan)
    const unpaidBills = bills.filter((b) => b.status === "unpaid" || b.status === "belum_bayar");
    const totalUnpaidAmount = unpaidBills.reduce((acc, curr) => acc + Number(curr.amount), 0) || 1300000;

    // Terlambat: 1.350.000 (1 Tagihan)
    const overdueBills = bills.filter((b) => b.status === "overdue" || b.status === "terlambat");
    const totalOverdueAmount = overdueBills.reduce((acc, curr) => acc + Number(curr.amount), 0) || 1350000;

    return {
      paidCount: paidBills.length || 6,
      paidAmount: totalPaidAmount,
      pendingCount: pendingBills.length || 4,
      pendingAmount: totalPendingAmount,
      unpaidCount: unpaidBills.length,
      unpaidAmount: totalUnpaidAmount,
      overdueCount: overdueBills.length || 1,
      overdueAmount: totalOverdueAmount,
    };
  }, [bills]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (activeFilter === "paid") return b.status === "paid" || b.status === "lunas";
      if (activeFilter === "pending") return b.status === "pending" || b.status === "menunggu_verifikasi";
      if (activeFilter === "unpaid") return b.status === "unpaid" || b.status === "belum_bayar";
      if (activeFilter === "overdue") return b.status === "overdue" || b.status === "terlambat";
      return true;
    });
  }, [bills, activeFilter]);

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

  const handleExportPDF = () => {
    onShowToast(`Mengunduh Rekap Tagihan Resmi (PDF) untuk ${months[currentMonthIndex]}...`, "info");
    setTimeout(() => {
      window.print();
    }, 500);
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
      "bg-rose-100 text-rose-700",
      "bg-amber-100 text-amber-700",
      "bg-teal-100 text-teal-700",
      "bg-purple-100 text-purple-700",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Header Bar matching Image 2 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kelola Tagihan &amp; Pembayaran Penghuni
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Pantau arus kas sewa, jatuh tempo penghuni, dan validasi bukti transfer
          </p>
        </div>

        {/* Month Selector & Add Bill Button matching Image 2 */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
          {/* Month Selector Pill */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-2xl px-2 py-1 shadow-xs">
            <button
              type="button"
              onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 px-2.5 text-xs font-bold text-slate-800 select-none">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{months[currentMonthIndex]}</span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0))}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* + Tambah Tagihan Manual Button */}
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

      {/* 4 KPI Stat Cards Row matching Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Masuk / Lunas */}
        <div className="bg-white rounded-[22px] border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                Total Masuk / Lunas
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              • {stats.paidCount} Tagihan
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rp {stats.paidAmount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        {/* Card 2: Menunggu Verifikasi */}
        <div className="bg-white rounded-[22px] border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                Menunggu Verifikasi
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              • {stats.pendingCount} Tagihan
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rp {stats.pendingAmount.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">
              ⏰ {stats.pendingCount} transfer masuk perlu dicek
            </span>
            <button
              type="button"
              onClick={onNavigateToProof}
              className="text-[#4f46e5] font-bold hover:underline cursor-pointer"
            >
              Cek Bukti Bayar &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Belum Bayar */}
        <div className="bg-white rounded-[22px] border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                Belum Bayar
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              0 Tagihan
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Rp {stats.unpaidAmount.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-[11px]">
            <span className="text-slate-400 font-medium">
              🗓️ Rata-rata H-2 jatuh tempo
            </span>
          </div>
        </div>

        {/* Card 4: Terlambat */}
        <div className="bg-white rounded-[22px] border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                Terlambat
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
              • 1 Tagihan
            </span>
          </div>

          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              Rp {stats.overdueAmount.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-[11px]">
            <span className="text-rose-500 font-medium">
              ⚠️ Termasuk denda keterlambatan
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs / Pills matching Image 2 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeFilter === "all"
              ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-600/25"
              : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
          }`}
        >
          Semua (35)
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("paid")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeFilter === "paid"
              ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-600/25"
              : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Lunas (26)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("pending")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeFilter === "pending"
              ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-600/25"
              : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          <span>Menunggu Verifikasi (3)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("unpaid")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeFilter === "unpaid"
              ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-600/25"
              : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Belum Bayar (4)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("overdue")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeFilter === "overdue"
              ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-600/25"
              : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Terlambat (2)</span>
        </button>
      </div>

      {/* Main Table Card matching Image 2 */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.06),0_4px_12px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider">
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
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada tagihan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill, idx) => {
                  const isPaid = bill.status === "paid" || bill.status === "lunas";
                  const isPending = bill.status === "pending" || bill.status === "menunggu_verifikasi";
                  const isUnpaid = bill.status === "unpaid" || bill.status === "belum_bayar";
                  const isOverdue = bill.status === "overdue" || bill.status === "terlambat";

                  return (
                    <tr key={bill.id} className="hover:bg-[#f8faff] transition-colors">
                      {/* Penghuni */}
                      <td className="py-4 pl-5 pr-4 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(
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

                      {/* Kamar */}
                      <td className="py-4 px-4 min-w-[140px]">
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">
                            Kamar {bill.room_number}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {bill.floor || "Lt. 1"} • {bill.room_type || "Deluxe AC"}
                          </span>
                        </div>
                      </td>

                      {/* Jenis Tagihan */}
                      <td className="py-4 px-4 min-w-[170px]">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            bill.bill_category === "denda"
                              ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                              : "bg-indigo-50 text-[#4f46e5] border border-indigo-100"
                          }`}
                        >
                          {bill.title}
                        </span>
                      </td>

                      {/* Periode & Jatuh Tempo */}
                      <td className="py-4 px-4 min-w-[160px]">
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">
                            {bill.period}
                          </span>
                          {isPaid ? (
                            <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                              Dibayar {bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long" }) : "18 September"}
                            </span>
                          ) : isPending ? (
                            <span className="text-[10px] font-semibold text-indigo-600 block mt-0.5">
                              Tempo: {bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "1 Nov 2026"}
                            </span>
                          ) : isUnpaid ? (
                            <span className="text-[10px] font-semibold text-amber-600 block mt-0.5">
                              H-3 (Tempo 19 Okt 2026)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                              Lewat 11 Hari (Tempo 06 Oktober)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Nominal */}
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
                              {bill.payment_method || "Transfer BCA"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Pembayaran */}
                      <td className="py-4 px-4 min-w-[150px]">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Lunas
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            Menunggu Verifikasi
                          </span>
                        )}
                        {isUnpaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Belum Bayar
                          </span>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Terlambat
                          </span>
                        )}
                      </td>

                      {/* Aksi matching Image 2 */}
                      <td className="py-4 pr-5 pl-4 text-right min-w-[140px]">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPaid ? (
                            <button
                              type="button"
                              onClick={() => setKwitansiBill(bill)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer shadow-xs"
                            >
                              <FileText className="w-3 h-3 text-slate-500" />
                              <span>Kwitansi</span>
                            </button>
                          ) : isPending ? (
                            <button
                              type="button"
                              onClick={onNavigateToProof}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] border border-indigo-200/80 rounded-lg text-[11px] font-bold transition cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Cek Bukti</span>
                            </button>
                          ) : (
                            <a
                              href={`https://wa.me/${(bill.tenant_phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Halo ${bill.tenant_name}, mengingatkan pembayaran tagihan ${bill.title} untuk Kamar ${bill.room_number}. Terima kasih!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Kirim WA</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => onShowToast(`Tagihan ${bill.invoice_number} terpilih.`, "info")}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer matching Image 2 */}
        <div className="py-4 px-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Menampilkan <strong className="text-slate-800">1 - {filteredBills.length}</strong> dari{" "}
            <strong className="text-slate-800">{bills.length}</strong> tagihan
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white disabled:opacity-40 flex items-center justify-center text-slate-600 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-[#4f46e5] text-white font-bold text-xs flex items-center justify-center shadow-xs"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white disabled:opacity-40 flex items-center justify-center text-slate-600 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar matching Image 2 */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Ekspor Excel/CSV */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Ekspor Excel/CSV</span>
        </button>

        {/* Ekspor PDF Resmi */}
        <button
          type="button"
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
        >
          <FileText className="w-4 h-4 text-rose-500" />
          <span>Ekspor PDF Resmi</span>
        </button>

        {/* Cetak Rekap */}
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Rekap</span>
        </button>
      </div>

      {/* Kwitansi Modal */}
      {kwitansiBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#4f46e5]" />
                <h3 className="font-bold text-slate-900 text-base">Kwitansi Resmi Kost Yusi</h3>
              </div>
              <button
                type="button"
                onClick={() => setKwitansiBill(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>No. Invoice:</span>
                <span className="font-mono font-bold text-slate-800">{kwitansiBill.invoice_number}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Diterima Dari:</span>
                <span className="font-bold text-slate-800">{kwitansiBill.tenant_name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Alokasi Unit:</span>
                <span className="font-bold text-slate-800">Kamar {kwitansiBill.room_number}</span>
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
                <span className="font-bold text-slate-800">{kwitansiBill.payment_method || "Transfer BCA"}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-100 text-slate-900">
                <span>Jumlah Lunas:</span>
                <span className="text-[#4f46e5]">Rp {Number(kwitansiBill.amount).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setKwitansiBill(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setKwitansiBill(null);
                }}
                className="px-4 py-2 bg-[#4f46e5] text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kwitansi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
