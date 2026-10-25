"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Hourglass,
  CheckCircle2,
  Ban,
  Search,
  Clock,
  Landmark,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Download,
  X,
  Check,
  AlertTriangle,
  Receipt,
  FileText,
  Printer,
  Sparkles,
  MessageSquare,
  Eye,
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  User,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { PaymentProofItem, ProofFilterTab } from "@/types/proof";
import { proofService } from "@/modules/billing/services/proofService";
import { formatRupiah } from "@/lib/utils/currency";

interface ProofVerificationPageProps {
  initialProofs?: PaymentProofItem[];
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
  onNavigateToBills?: () => void;
}

// Komponen halaman Verifikasi Bukti Pembayaran dengan UX responsif & hierarki semantik
export const ProofVerificationPage: React.FC<ProofVerificationPageProps> = ({
  initialProofs,
  onShowToast,
  onNavigateToBills,
}) => {
  const [proofs, setProofs] = useState<PaymentProofItem[]>(initialProofs ?? []);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProofId, setSelectedProofId] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<ProofFilterTab>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"digital" | "photo">("digital");
  const [mobileView, setMobileView] = useState<"queue" | "detail">("queue");

  // Modal Penolakan Bukti
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("Struk tidak terlihat jelas / buram");
  const [customRejectNote, setCustomRejectNote] = useState("");

  // Modal Kwitansi Resmi Diterbitkan
  const [isKwitansiModalOpen, setIsKwitansiModalOpen] = useState(false);
  const [issuedKwitansi, setIssuedKwitansi] = useState<PaymentProofItem | null>(null);

  // Memuat data dari Supabase jika tersedia
  useEffect(() => {
    async function fetchFromSupabase() {
      try {
        const data = await proofService.getPaymentProofs();
        setProofs(data);
        const firstPending = data.find((p) => p.status === "pending") || data[0];
        if (firstPending) {
          setSelectedProofId(firstPending.id);
        }
      } catch (err: any) {
        console.error("Gagal memuat bukti pembayaran:", err);
        onShowToast?.(`Gagal memuat bukti pembayaran: ${err?.message || "kesalahan jaringan"}`, "error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchFromSupabase();
  }, []);

  // Perhitungan statistik bukti pembayaran (KPI semantik)
  const pendingProofs = useMemo(() => proofs.filter((p) => p.status === "pending"), [proofs]);
  const approvedProofs = useMemo(() => proofs.filter((p) => p.status === "approved"), [proofs]);
  const rejectedProofs = useMemo(() => proofs.filter((p) => p.status === "rejected"), [proofs]);

  const totalPendingAmount = useMemo(
    () => pendingProofs.reduce((sum, item) => sum + Number(item.amount), 0),
    [pendingProofs]
  );

  const totalApprovedAmount = useMemo(
    () => approvedProofs.reduce((sum, item) => sum + Number(item.amount), 0),
    [approvedProofs]
  );

  const totalRejectedAmount = useMemo(
    () => rejectedProofs.reduce((sum, item) => sum + Number(item.amount), 0),
    [rejectedProofs]
  );

  // Filter antrean bukti berdasarkan tab aktif dan kata kunci pencarian
  const filteredQueue = useMemo(() => {
    return proofs.filter((item) => {
      // Filter tab status
      if (activeFilter === "pending" && item.status !== "pending") return false;
      if (activeFilter === "approved" && item.status !== "approved") return false;
      if (activeFilter === "rejected" && item.status !== "rejected") return false;

      // Filter pencarian
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = item.tenant_name?.toLowerCase().includes(q) || item.resident_name?.toLowerCase().includes(q);
        const matchesRoom = item.room_number?.toLowerCase().includes(q);
        const matchesInvoice = item.invoice_number?.toLowerCase().includes(q);
        const matchesBank = item.bank_name?.toLowerCase().includes(q) || item.bank_sender?.toLowerCase().includes(q);
        return matchesName || matchesRoom || matchesInvoice || matchesBank;
      }
      return true;
    });
  }, [proofs, activeFilter, searchQuery]);

  // Bukti yang sedang dipilih untuk ditinjau
  const selectedProof = useMemo(() => {
    return proofs.find((p) => p.id === selectedProofId) || filteredQueue[0] || proofs[0];
  }, [proofs, selectedProofId, filteredQueue]);

  // Indeks antrean saat ini untuk pagination navigasi
  const currentIndex = useMemo(() => {
    return filteredQueue.findIndex((p) => p.id === selectedProof?.id);
  }, [filteredQueue, selectedProof]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedProofId(filteredQueue[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQueue.length - 1) {
      setSelectedProofId(filteredQueue[currentIndex + 1].id);
    }
  };

  const handleSelectProof = (id: string) => {
    setSelectedProofId(id);
    setMobileView("detail");
  };

  // Avatar inisial penghuni
  const getAvatarProps = (name: string, index: number) => {
    const parts = name.trim().split(" ");
    const initials =
      parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();

    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700" },
      { bg: "bg-purple-100", text: "text-purple-700" },
      { bg: "bg-rose-100", text: "text-rose-700" },
      { bg: "bg-emerald-100", text: "text-emerald-700" },
      { bg: "bg-amber-100", text: "text-amber-700" },
    ];
    return { initials, ...colors[index % colors.length] };
  };

  // Aksi persetujuan bukti bayar & terbitkan kwitansi resmi
  const handleApprove = async () => {
    if (!selectedProof) return;

    try {
      await proofService.approveProof(selectedProof.id, selectedProof.invoice_number);

      setProofs((prev) =>
        prev.map((item) =>
          item.id === selectedProof.id ? { ...item, status: "approved" } : item
        )
      );

      setIssuedKwitansi(selectedProof);
      setIsKwitansiModalOpen(true);
      onShowToast?.(`Bukti bayar ${selectedProof.tenant_name} disetujui & kwitansi resmi diterbitkan!`, "success");

      // Beralih otomatis ke antrean pending berikutnya jika ada
      const remainingPending = proofs.filter(
        (p) => p.status === "pending" && p.id !== selectedProof.id
      );
      if (remainingPending.length > 0) {
        setSelectedProofId(remainingPending[0].id);
      }
    } catch (err: any) {
      onShowToast?.(`Gagal menyetujui bukti bayar: ${err?.message || "kesalahan jaringan"}`, "error");
    }
  };

  // Aksi penolakan bukti pembayaran
  const handleConfirmReject = async () => {
    if (!selectedProof) return;

    const finalReason = customRejectNote ? `${rejectReason}: ${customRejectNote}` : rejectReason;

    try {
      await proofService.rejectProof(selectedProof.id, finalReason);

      setProofs((prev) =>
        prev.map((item) =>
          item.id === selectedProof.id
            ? { ...item, status: "rejected", rejection_reason: finalReason }
            : item
        )
      );

      setIsRejectModalOpen(false);
      setCustomRejectNote("");
      onShowToast?.(`Bukti pembayaran ditolak. Alasan: ${finalReason}`, "info");

      const remainingPending = proofs.filter(
        (p) => p.status === "pending" && p.id !== selectedProof.id
      );
      if (remainingPending.length > 0) {
        setSelectedProofId(remainingPending[0].id);
      }
    } catch (err: any) {
      onShowToast?.(`Gagal menolak bukti pembayaran: ${err?.message || "kesalahan jaringan"}`, "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Verifikasi Bukti Pembayaran Penghuni
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Validasi struk transfer bank dan QRIS dari penghuni secara real-time sebelum kwitansi diterbitkan
          </p>
        </div>

        {/* Badge Status Menunggu Tindakan (Biru Semantik) */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            {pendingProofs.length} BUKTI PERLU TINDAKAN
          </span>

          {onNavigateToBills && (
            <button
              type="button"
              onClick={onNavigateToBills}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-xs font-bold transition cursor-pointer"
            >
              Lihat Tagihan &rarr;
            </button>
          )}
        </div>
      </div>

      {/* 2. 3 Kartu KPI Interaktif dengan Hierarki Semantik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* KPI 1: Menunggu Verifikasi (Biru) */}
        <div
          onClick={() => {
            setActiveFilter("pending");
            setMobileView("queue");
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            activeFilter === "pending"
              ? "border-blue-500 ring-2 ring-blue-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              MENUNGGU VERIFIKASI
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shadow-2xs">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {pendingProofs.length}
              </span>
              <span className="text-xs font-medium text-slate-500">transaksi</span>
            </div>
            <p className="text-xs text-blue-700 font-semibold mt-1">
              Total {formatRupiah(totalPendingAmount)}
            </p>
          </div>
        </div>

        {/* KPI 2: Diverifikasi Bulan Ini (Emerald) */}
        <div
          onClick={() => {
            setActiveFilter("approved");
            setMobileView("queue");
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            activeFilter === "approved"
              ? "border-emerald-500 ring-2 ring-emerald-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              DIVERIFIKASI / LUNAS
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {approvedProofs.length}
              </span>
              <span className="text-xs font-medium text-slate-500">transaksi</span>
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              Total {formatRupiah(totalApprovedAmount)} sah diterima
            </p>
          </div>
        </div>

        {/* KPI 3: Ditolak (Rose) */}
        <div
          onClick={() => {
            setActiveFilter("rejected");
            setMobileView("queue");
          }}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between ${
            activeFilter === "rejected"
              ? "border-rose-500 ring-2 ring-rose-500/15"
              : "border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              DITOLAK / TIDAK VALID
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-200/60 shadow-2xs">
              <Ban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                {rejectedProofs.length}
              </span>
              <span className="text-xs font-medium text-slate-500">transaksi</span>
            </div>
            <p className="text-xs text-rose-600 font-semibold mt-1 truncate">
              Total {formatRupiah(totalRejectedAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Switcher Tampilan Mobile: Antrean vs Detail Bukti */}
      <div className="lg:hidden flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileView("queue")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
            mobileView === "queue"
              ? "bg-[#4f46e5] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Daftar Antrean ({filteredQueue.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileView("detail")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
            mobileView === "detail"
              ? "bg-[#4f46e5] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Detail &amp; Struk ({selectedProof?.tenant_name.split(" ")[0] || "Bukti"})
        </button>
      </div>

      {/* 3. Layout Dua Kolom Master-Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Kolom Kiri: Daftar Antrean Bukti (5 kolom di lg) */}
        <div className={`lg:col-span-5 space-y-3.5 ${mobileView === "detail" ? "hidden lg:block" : "block"}`}>
          {/* Kolom Pencarian */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari penghuni, kamar, ID invoice, atau bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-2xl pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills Semantik */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveFilter("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === "pending"
                  ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Menunggu ({pendingProofs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua ({proofs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("approved")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === "approved"
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-500/20"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100"
              }`}
            >
              Diverifikasi ({approvedProofs.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("rejected")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === "rejected"
                  ? "bg-rose-600 text-white shadow-xs shadow-rose-500/20"
                  : "bg-rose-50 text-rose-700 border border-rose-200/60 hover:bg-rose-100"
              }`}
            >
              Ditolak ({rejectedProofs.length})
            </button>
          </div>

          {/* Daftar Kartu Antrean Bukti */}
          <div className="space-y-3">
            {filteredQueue.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Tidak ada antrean bukti</p>
                <p className="text-xs text-slate-400 mt-0.5">Semua bukti telah selesai diproses.</p>
              </div>
            ) : (
              filteredQueue.map((item, idx) => {
                const isSelected = selectedProof?.id === item.id;
                const avatar = getAvatarProps(item.tenant_name, idx);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProof(item.id)}
                    className={`bg-white rounded-2xl p-4 transition-all cursor-pointer border ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/15 shadow-md shadow-blue-500/5 bg-[#fbfdff]"
                        : "border-slate-100 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    {/* Header Baris: Avatar, Nama, Kamar, Badge Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${avatar.bg} ${avatar.text}`}
                        >
                          {avatar.initials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {item.tenant_name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Kamar {item.room_number.replace(/^Kamar\s*/i, "")} ({item.floor || "Lt. 1"}) • {item.property_name || "Kost Yusi"}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge Semantik */}
                      <div>
                        {item.status === "pending" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            Menunggu
                          </span>
                        )}
                        {item.status === "approved" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Lunas
                          </span>
                        )}
                        {item.status === "rejected" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Ditolak
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rincian Tengah: Nominal & Waktu Transfer */}
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          NOMINAL TRANSFER
                        </span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">
                          {formatRupiah(Number(item.amount))}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          WAKTU UNGGAH
                        </span>
                        <span className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {item.time_transfer}
                        </span>
                      </div>
                    </div>

                    {/* Footer Kartu: Bank Pengirim & Tombol Navigasi */}
                    <div className="flex items-center justify-between text-xs mt-3 pt-2 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Landmark className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[11px] truncate max-w-[180px]">
                          {item.bank_sender || `Bank ${item.bank_name}`}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="text-blue-600 font-bold text-xs flex items-center gap-0.5">
                          Terkini <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          Periode: {item.period || "Oktober 2026"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <p className="text-xs text-slate-400 text-center py-2 font-medium">
              Menampilkan {filteredQueue.length} dari {proofs.length} bukti pembayaran
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Detail Pemeriksaan Struk Transfer & Aksi Validasi (7 kolom di lg) */}
        {selectedProof && (
          <div className={`lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06)] space-y-5 ${mobileView === "queue" ? "hidden lg:block" : "block"}`}>
            {/* Tombol Kembali ke Antrean untuk Layar Mobile */}
            <div className="lg:hidden pb-3 border-b border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileView("queue")}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>&larr; Kembali ke Daftar Antrean</span>
              </button>
              <span className="text-[11px] text-slate-400 font-medium">
                Antrean {currentIndex + 1} dari {filteredQueue.length}
              </span>
            </div>

            {/* Header Detail Atas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                  DETAIL PEMBAYARAN • {selectedProof.invoice_number || "INV-2026-06-B04"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {selectedProof.tenant_name}
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Kamar {selectedProof.room_number.replace(/^Kamar\s*/i, "")} ({selectedProof.floor || "Lantai 1"}) • {selectedProof.property_name || "Kost Yusi"}
                </p>
              </div>

              {/* Navigator Antrean (Prev / Next) */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Antrean {currentIndex + 1} dari {filteredQueue.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex <= 0}
                    className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Antrean sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex >= filteredQueue.length - 1}
                    className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Antrean berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Checklist Validasi Cepat (Quick Checkpoint Widget) */}
            <div className="bg-[#f8faff] rounded-2xl p-4 border border-blue-100/70 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CHECKLIST VALIDASI SISTEM:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700">Nominal: <strong className="text-slate-900">{formatRupiah(Number(selectedProof.amount))}</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700 truncate">Penerima: <strong className="text-slate-900">Arifa Andya Nafiisa</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700">Unit: <strong className="text-slate-900">Kamar {selectedProof.room_number}</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700">Periode: <strong className="text-slate-900">{selectedProof.period || "Oktober 2026"}</strong></span>
                </div>
              </div>
            </div>

            {/* Kotak Pratinjau Struk Transfer */}
            <div className="bg-[#f0f6ff]/60 rounded-2xl p-4 sm:p-5 border border-indigo-100/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>PRATINJAU BUKTI STRUK TRANSFER</span>
                </div>

                {/* Mode Pratinjau & Aksi Layar Penuh */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("digital")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        previewMode === "digital"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Struk Digital
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("photo")}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        previewMode === "photo"
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Foto Struk
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullScreen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                    title="Perbesar struk ke layar penuh"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Perbesar</span>
                  </button>
                </div>
              </div>

              {/* Tampilan 1: Struk Digital Otentik Mobile Banking */}
              {previewMode === "digital" ? (
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100 max-w-md mx-auto relative overflow-hidden font-sans">
                  {/* Watermark bank transparan */}
                  <div className="absolute inset-0 pointer-events-none opacity-5 flex flex-wrap gap-8 items-center justify-center font-black text-2xl rotate-[-20deg]">
                    <span>{selectedProof.bank_name || "BCA"}</span>
                    <span>{selectedProof.bank_name || "BCA"}</span>
                    <span>{selectedProof.bank_name || "BCA"}</span>
                  </div>

                  {/* Header Struk Digital */}
                  <div className="flex flex-col items-center text-center relative z-10 pb-4 border-b border-dashed border-slate-200">
                    <div className="text-xl font-black text-[#0060af] tracking-wider mb-2">
                      {selectedProof.bank_name || "BANK BCA"}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 mb-2">
                      <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Transfer Berhasil</h3>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      {selectedProof.transfer_date_time || "02 Mei 2026 09:56:27"}
                    </span>
                    <div className="mt-2 text-xl font-black text-slate-900 tracking-tight">
                      {formatRupiah(Number(selectedProof.amount))}
                    </div>
                  </div>

                  {/* Rincian Baris Struk Digital */}
                  <div className="mt-4 space-y-2.5 text-xs relative z-10">
                    <div className="flex items-start justify-between">
                      <span className="text-slate-400 font-medium">Nama Pengirim</span>
                      <span className="text-slate-900 font-bold text-right">
                        {selectedProof.sender_name || selectedProof.tenant_name}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-slate-400 font-medium">Rekening Tujuan</span>
                      <span className="text-slate-900 font-bold text-right font-mono">
                        {selectedProof.account_receiver || "137-001928374-1"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-slate-400 font-medium">Penerima</span>
                      <span className="text-slate-900 font-semibold text-right">
                        {selectedProof.receiver_name || "Arifa Andya Nafiisa (Kost Yusi)"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-slate-400 font-medium">Dari Rekening</span>
                      <span className="text-slate-900 font-bold text-right font-mono">
                        {selectedProof.account_sender || "630 - 01*-**26"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-slate-400 font-medium">Nominal Transaksi</span>
                      <span className="text-slate-900 font-black text-right">
                        {formatRupiah(Number(selectedProof.amount))}
                      </span>
                    </div>
                    <div className="flex items-start justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-400 font-medium">No. Referensi</span>
                      <span className="text-slate-700 font-mono text-[10px] break-all text-right max-w-[200px]">
                        {selectedProof.reference_number || "B09D0932-2521-4ASE-A74E-EB081D18B667"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tampilan 2: Foto Struk Asli yang Diunggah */
                <div className="relative w-full max-w-md h-80 mx-auto rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
                  <Image
                    src={selectedProof.proof_image_url || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"}
                    alt="Foto Struk Transfer"
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-contain"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] flex justify-between items-center">
                    <span>Dokumen Unggahan Penghuni</span>
                    <button
                      type="button"
                      onClick={() => setIsFullScreen(true)}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" /> Perbesar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Kotak Informasi Rekening Tujuan & Pesan Penghuni */}
            <div className="bg-[#f8faff] rounded-2xl p-4 sm:p-5 border border-blue-100/60 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedProof.bank_receiver || "Bank Mandiri"} {selectedProof.account_receiver || "137-001928374-1"}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    a.n. {selectedProof.receiver_name || "Arifa Andya Nafiisa (Kost Yusi)"}
                  </p>
                </div>
              </div>

              {/* Pesan Tambahan dari Penghuni */}
              <div className="bg-white rounded-xl p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  PESAN DARI PENGHUNI:
                </span>
                <p className="text-xs text-slate-700 font-medium italic mt-1 leading-relaxed">
                  "{selectedProof.tenant_message || "Sudah ditransfer dari rekening ya bu, terima kasih banyak 🙏"}"
                </p>
              </div>

              {/* Tampilan Alasan jika Sebelumnya Ditolak */}
              {selectedProof.status === "rejected" && (
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-200 text-xs text-rose-700">
                  <span className="font-bold">Alasan Penolakan: </span>
                  {selectedProof.rejection_reason || "Struk tidak terlihat jelas"}
                </div>
              )}

              {/* Tampilan Konfirmasi jika Sudah Disetujui */}
              {selectedProof.status === "approved" && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Bukti ini telah disetujui &amp; kwitansi resmi telah diterbitkan.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIssuedKwitansi(selectedProof);
                      setIsKwitansiModalOpen(true);
                    }}
                    className="text-emerald-700 underline font-bold cursor-pointer"
                  >
                    Buka Kwitansi
                  </button>
                </div>
              )}
            </div>

            {/* Baris Tombol Aksi Verifikasi */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {/* Tombol Tolak Bukti Bayar */}
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-xs sm:text-sm border border-rose-200/80 hover:bg-rose-100 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Tolak Bukti</span>
              </button>

              {/* Tombol Hubungi Penghuni via WhatsApp */}
              <a
                href={`https://wa.me/6281298441201?text=${encodeURIComponent(
                  `Halo ${selectedProof.tenant_name}, terkait bukti transfer sewa Kamar ${selectedProof.room_number} (${formatRupiah(Number(selectedProof.amount))}) ke rekening Kost Yusi. Mohon konfirmasi kembali ya. Terima kasih!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 font-bold text-xs sm:text-sm border border-emerald-200/80 hover:bg-emerald-100 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hubungi WA</span>
              </a>

              {/* Tombol Terima & Terbitkan Kwitansi */}
              <button
                type="button"
                onClick={handleApprove}
                className="w-full sm:flex-1 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Terima &amp; Terbitkan Kwitansi</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Modal Pratinjau Layar Penuh (Zoom) */}
      {isFullScreen && selectedProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Pratinjau Struk Pembayaran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-sans">
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="text-2xl font-black text-[#0060af]">{selectedProof.bank_name || "BANK BCA"}</div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto my-2">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Transfer Berhasil</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedProof.transfer_date_time || "02 Mei 2026 09:56:27"}
                </p>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {formatRupiah(Number(selectedProof.amount))}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Pengirim</span>
                  <span className="font-bold text-slate-800">{selectedProof.tenant_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Kamar</span>
                  <span className="font-bold text-slate-800">Kamar {selectedProof.room_number}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Penerima</span>
                  <span className="font-bold text-slate-800">{selectedProof.receiver_name || "Arifa Andya Nafiisa (Kost Yusi)"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Rekening Tujuan</span>
                  <span className="font-mono font-bold text-slate-800">{selectedProof.account_receiver || "137-001928374-1"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Bank Pengirim</span>
                  <span className="font-semibold text-slate-800">{selectedProof.bank_sender || selectedProof.bank_name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Nomor Referensi</span>
                  <span className="font-mono text-[10px] text-slate-600 break-all">{selectedProof.reference_number}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak
              </button>
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Konfirmasi Penolakan Bukti */}
      {isRejectModalOpen && selectedProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Tolak Bukti Pembayaran
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedProof.tenant_name} • Kamar {selectedProof.room_number}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Pilih alasan penolakan untuk dikirimkan secara otomatis via notifikasi ke penghuni:
            </p>

            <div className="space-y-2">
              {[
                "Struk tidak terlihat jelas / buram",
                "Nominal transfer tidak sesuai tagihan sewa",
                "Rekening tujuan salah / bukan rekening kost",
                "Bukti transfer duplikat / sudah pernah dipakai",
                "Tanggal atau jam transfer mencurigakan",
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                    rejectReason === reason
                      ? "border-rose-400 bg-rose-50/50 text-rose-900 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="reject_reason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="accent-rose-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Catatan Tambahan (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Tuliskan petunjuk bagi penghuni untuk transfer ulang..."
                value={customRejectNote}
                onChange={(e) => setCustomRejectNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Kwitansi Resmi Kost Yusi yang Berhasil Diterbitkan */}
      {isKwitansiModalOpen && issuedKwitansi && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Kwitansi Resmi Diterbitkan!
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    No. KWT-{issuedKwitansi.invoice_number?.replace("INV-", "") || Date.now()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsKwitansiModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Desain Kwitansi Resmi */}
            <div className="bg-[#fcfdfa] border-2 border-dashed border-emerald-300 rounded-2xl p-5 space-y-3 font-sans relative">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div>
                  <h4 className="font-black text-sm text-slate-900 tracking-tight">KOST YUSI RESIDENCE</h4>
                  <p className="text-[10px] text-slate-500">Jl. Sigura - Gura IV No.6, Malang</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    LUNAS / VERIFIED
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Telah terima dari:</span>
                  <span className="font-bold text-slate-900">{issuedKwitansi.tenant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Untuk sewa kamar:</span>
                  <span className="font-semibold text-slate-900">
                    Kamar {issuedKwitansi.room_number} ({issuedKwitansi.period || "Oktober 2026"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Metode Pembayaran:</span>
                  <span className="font-semibold text-slate-900">{issuedKwitansi.bank_sender || issuedKwitansi.bank_name}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-bold">Jumlah Pembayaran:</span>
                  <span className="text-base font-black text-emerald-600">
                    {formatRupiah(Number(issuedKwitansi.amount))}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-100 flex justify-between items-end text-[10px] text-slate-400">
                <div>
                  <span>Diverifikasi oleh:</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">Ibu Arifa Andya Nafiisa</p>
                </div>
                <span className="italic">Kwitansi sah diterbitkan secara digital</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Kwitansi
              </button>
              <button
                type="button"
                onClick={() => setIsKwitansiModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
