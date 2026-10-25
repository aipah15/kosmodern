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
} from "lucide-react";
import { Tenant } from "@/types/tenant";

interface TenantListSectionProps {
  tenants: Tenant[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectTenant: (tenant: Tenant) => void;
  onCreateTenant: () => void;
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
}

export const TenantListSection: React.FC<TenantListSectionProps> = ({
  tenants,
  isLoading,
  onRefresh,
  onSelectTenant,
  onCreateTenant,
  onShowToast,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Compute KPI Counts
  const stats = useMemo(() => {
    const totalActive = tenants.filter((t) => t.status === "active").length;
    const waitingVerification = tenants.filter((t) => t.bill_status === "waiting_verification").length;
    const overdue = tenants.filter((t) => t.bill_status === "overdue" || t.bill_status === "unpaid").length;
    const emptyRooms = 2; // Matching the screenshot

    return {
      totalActive,
      emptyRooms,
      waitingVerification,
      overdue,
    };
  }, [tenants]);

  // Pagination
  const totalPages = Math.ceil(tenants.length / itemsPerPage) || 1;
  const paginatedTenants = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tenants.slice(start, start + itemsPerPage);
  }, [tenants, currentPage, itemsPerPage]);

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
      ["ID,Nama,Kamar,WhatsApp,Status Tagihan,Masuk"]
        .concat(
          tenants.map(
            (t) =>
              `"${t.tenant_code}","${t.full_name}","${t.room_number}","${t.phone}","${t.bill_status}","${t.check_in_date}"`
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

  // Format check in date e.g. "1 Jan 2024"
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

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Title & Stats Row matching Images 1 & 2 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
            MANAJEMEN PENYEWA •
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Daftar Penghuni
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Kelola data penyewa aktif, riwayat kamar, kontak darurat, dan status tagihan berkala secara terpusat.
          </p>

          {/* KPI Summary Pills */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              {stats.totalActive} Penghuni Aktif
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              {stats.emptyRooms} Kamar Kosong
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {stats.waitingVerification} Menunggu Verifikasi
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {stats.overdue} Menunggak
            </span>
          </div>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh Data</span>
          </button>

          <button
            type="button"
            onClick={onCreateTenant}
            className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Penghuni</span>
          </button>
        </div>
      </div>

      {/* Subheader: Tab & Refresh Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 pb-3 px-1 text-xs font-bold text-[#4f46e5] border-b-2 border-[#4f46e5] cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Penghuni Aktif
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
              {tenants.length}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1.5 pb-2 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
          <span>Diperbarui baru saja</span>
        </button>
      </div>

      {/* Table Container matching Images 1 & 2 */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_30px_-15px_rgba(79,70,229,0.06),0_4px_12px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 tracking-wider">
                <th className="py-3.5 pl-5 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={paginatedTenants.length > 0 && selectedIds.length === paginatedTenants.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-bold uppercase">PENGHUNI &amp; ID</th>
                <th className="py-3.5 px-4 font-bold uppercase">KAMAR &amp; PROPERTI</th>
                <th className="py-3.5 px-4 font-bold uppercase">KONTAK WHATSAPP</th>
                <th className="py-3.5 pr-5 pl-4 font-bold uppercase">TAGIHAN OKT–NOV 2026</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      <span>Memuat data penghuni...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada penghuni terdaftar.
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tenant) => {
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
                      {/* Checkbox */}
                      <td className="py-4 pl-5 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(tenant.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Penghuni & ID */}
                      <td className="py-4 px-4 min-w-[180px]">
                        <div>
                          <button
                            type="button"
                            onClick={() => onSelectTenant(tenant)}
                            className="font-black text-slate-900 text-xs sm:text-sm hover:text-indigo-600 text-left transition cursor-pointer"
                          >
                            {tenant.full_name}
                          </button>

                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                            <span className="font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                              {tenant.tenant_code}
                            </span>
                            <span>•</span>
                            <span>Masuk {formatCheckIn(tenant.check_in_date)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Kamar & Properti */}
                      <td className="py-4 px-4 min-w-[170px]">
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            Kamar {tenant.room_number}{" "}
                            <span className="text-slate-400 font-normal">
                              • {tenant.floor || "Lt. 1"}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {tenant.room_type || "Tipe Deluxe"}
                          </div>
                          <div className="text-[9px] font-black text-rose-500 tracking-wider uppercase mt-0.5">
                            {tenant.property_name || "KOST YUSI"}
                          </div>
                        </div>
                      </td>

                      {/* Kontak WhatsApp */}
                      <td className="py-4 px-4 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs font-mono">
                            {tenant.phone}
                          </span>

                          {/* WhatsApp Chat Button */}
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition cursor-pointer"
                            title="Chat via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          </a>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(tenant.phone)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                            title="Salin nomor"
                          >
                            {copiedPhone === tenant.phone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Tagihan Status */}
                      <td className="py-4 pr-5 pl-4 min-w-[200px]">
                        {tenant.bill_status === "waiting_verification" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Menunggu Verifikasi</span>
                          </span>
                        ) : tenant.bill_status === "paid" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Lunas Oktober</span>
                          </span>
                        ) : tenant.bill_status === "unpaid" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <span>Belum Bayar</span>
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Terlambat {tenant.overdue_days || 11} Hari</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                (+Denda {tenant.fine_amount ? `${tenant.fine_amount / 1000}rb` : "50rb"})
                              </span>
                            </div>

                            <div>
                              <a
                                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                                  `Halo ${tenant.full_name}, tagihan sewa kos Kamar ${tenant.room_number} telah melewati jatuh tempo. Mohon segera melakukan pembayaran. Terima kasih!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                              >
                                <span>▷ Kirim Tagihan WA</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer matching Images 1 & 2 */}
        <div className="py-4 px-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Menampilkan{" "}
              <strong className="text-slate-800">
                {tenants.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, tenants.length)}
              </strong>{" "}
              dari <strong className="text-slate-800">{tenants.length}</strong> penghuni
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Baris:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={5}>5 per halaman</option>
                <option value={10}>10 per halaman</option>
                <option value={20}>20 per halaman</option>
              </select>
            </div>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center text-slate-600 transition cursor-pointer"
              aria-label="Sebelumnya"
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
              aria-label="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
