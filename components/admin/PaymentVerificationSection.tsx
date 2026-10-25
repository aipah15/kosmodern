"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Smartphone,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PaymentProofItem } from "@/types/proof";
import { DEFAULT_PROPERTY } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils/currency";

interface PaymentVerificationSectionProps {
  initialProofs?: PaymentProofItem[];
  onApproveProof?: (id: string) => Promise<boolean>;
  onRejectProof?: (id: string) => Promise<boolean>;
  onRefresh?: () => void;
}

// Komponen peninjauan bukti bayar transfer pada halaman admin dasbor
export const PaymentVerificationSection: React.FC<PaymentVerificationSectionProps> = ({
  initialProofs,
  onApproveProof,
  onRejectProof,
  onRefresh,
}) => {
  const [proofs, setProofs] = useState<PaymentProofItem[]>(
    (initialProofs ?? []).filter((p) => p.status === "pending")
  );
  const [activeTab, setActiveTab] = useState<"all" | "bca" | "other">("all");
  const [visibleCount, setVisibleCount] = useState<number>(5); // Tampilkan 5 item pertama
  const [selectedProof, setSelectedProof] = useState<PaymentProofItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sinkronisasi data saat props initialProofs diperbarui dari server
  useEffect(() => {
    if (initialProofs) {
      setProofs(initialProofs.filter((p) => p.status === "pending"));
    }
  }, [initialProofs]);

  // Filter bukti transfer berdasarkan bank tujuan / pengirim
  const filteredProofs = proofs.filter((p) => {
    const bank = (p.bank_name || p.bank_sender || "").toUpperCase();
    if (activeTab === "bca") return bank.includes("BCA");
    if (activeTab === "other") return !bank.includes("BCA");
    return true;
  });

  // Potong daftar bukti transfer sesuai jumlah visibleCount (5 per halaman/tampilan)
  const displayedProofs = filteredProofs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProofs.length;

  // Ganti tab filter dan reset kembali ke 5 item pertama
  const handleTabChange = (tab: "all" | "bca" | "other") => {
    setActiveTab(tab);
    setVisibleCount(5);
  };

  // Aksi persetujuan bukti transfer
  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      if (onApproveProof && !(await onApproveProof(id))) return;
      setProofs((prev) => prev.filter((p) => p.id !== id));
      setSelectedProof(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Aksi penolakan bukti transfer
  const handleReject = async (id: string) => {
    setIsProcessing(true);
    try {
      if (onRejectProof && !(await onRejectProof(id))) return;
      setProofs((prev) => prev.filter((p) => p.id !== id));
      setSelectedProof(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06),0_5px_15px_-5px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
      {/* Header Bagian */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Perlu Tindakan: Verifikasi Bukti Pembayaran
              </h3>
              <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                Validasi struk transfer penghuni sebelum penerbitan kwitansi resmi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Segarkan data bukti"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/80">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {proofs.length} Menunggu Konfirmasi
            </span>
          </div>
        </div>

        {/* Tab Filter Bank */}
        <div className="flex items-center gap-2 my-4 flex-wrap">
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "all"
                ? "bg-[#4f46e5] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua Menunggu ({proofs.length})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("bca")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "bca"
                ? "bg-[#4f46e5] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Transfer BCA (
            {
              proofs.filter((p) =>
                (p.bank_name || p.bank_sender || "").toUpperCase().includes("BCA")
              ).length
            }
            )
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("other")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "other"
                ? "bg-[#4f46e5] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Mandiri / Lainnya (
            {
              proofs.filter(
                (p) =>
                  !(p.bank_name || p.bank_sender || "").toUpperCase().includes("BCA")
              ).length
            }
            )
          </button>
        </div>

        {/* Daftar Bukti Bayar (Menampilkan 5 per halaman) */}
        <div className="space-y-3">
          {displayedProofs.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedProof(item)}
              className="bg-[#f8faff] hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 rounded-2xl p-3.5 flex items-center justify-between gap-3.5 transition-all duration-150 cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Visual Kartu Transfer */}
                <div className="w-11 h-14 rounded-xl bg-slate-900/90 border border-slate-700 text-white flex flex-col items-center justify-center shrink-0 p-1 relative overflow-hidden group-hover:scale-105 transition-transform">
                  <div className="w-full text-[7px] text-center bg-indigo-600 text-white font-mono uppercase py-0.5 rounded-xs leading-none font-bold">
                    {item.bank_name || "BANK"}
                  </div>
                  <Smartphone className="w-4 h-4 text-slate-300 mt-1" />
                  <span className="text-[7px] text-emerald-400 font-mono mt-0.5 font-bold">
                    SUCCESS
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-[#4f46e5] bg-[#eeeffe] px-2 py-0.5 rounded-md border border-[#d6d8fe]">
                      Kamar {item.room_number}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {item.resident_name || item.tenant_name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">
                      {formatRupiah(item.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.bank_name || item.bank_sender} • {item.time_transfer || "Baru saja"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic truncate mt-0.5 font-normal">
                    &ldquo;{item.note || item.tenant_message || "Konfirmasi transfer sewa bulanan"}&rdquo;
                  </p>
                </div>
              </div>

              {/* Tautan Pratinjau */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-[#4f46e5] group-hover:underline hidden sm:inline">
                  Tinjau Struk
                </span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#4f46e5] transition" />
              </div>
            </div>
          ))}

          {filteredProofs.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Tidak ada bukti transfer yang menunggu konfirmasi pada kategori ini.
            </div>
          )}
        </div>

        {/* Tombol Tampilkan Lebih Banyak (Show More bertahap 5 per klik) */}
        {filteredProofs.length > 5 && (
          <div className="pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 mt-3.5">
            <span className="text-[11px] text-slate-500 font-medium text-center sm:text-left">
              Menampilkan <strong className="text-slate-800 font-bold">{displayedProofs.length}</strong> dari{" "}
              <strong className="text-slate-800 font-bold">{filteredProofs.length}</strong> bukti transfer
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasMore ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#eef2ff] hover:bg-indigo-100 text-[#4f46e5] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Tampilkan 5 Lagi</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setVisibleCount(5)}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>Tampilkan Lebih Sedikit (5 Awal)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Pratinjau Struk Transfer */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#4f46e5] bg-[#eeeffe] px-2.5 py-1 rounded-lg">
                  Kamar {selectedProof.room_number}
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Verifikasi Pembayaran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mockup Struk Transfer */}
            <div className="my-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
              <div className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full mb-2">
                Transfer Berhasil ({selectedProof.bank_name || selectedProof.bank_sender || "Bank Transfer"})
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {formatRupiah(selectedProof.amount)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Waktu: {selectedProof.time_transfer || "Tercatat di sistem"}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-left text-xs space-y-2 text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Pengirim:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedProof.resident_name || selectedProof.tenant_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Penerima Resmi:</span>
                  <span className="font-semibold text-slate-800">
                    {DEFAULT_PROPERTY.name} ({DEFAULT_PROPERTY.ownerName})
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-400 shrink-0">Catatan:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {selectedProof.note || selectedProof.tenant_message || "Transfer sewa kamar"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol Tindakan Persetujuan & Penolakan */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleReject(selectedProof.id)}
                className="flex-1 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak Bukti</span>
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleApprove(selectedProof.id)}
                className="flex-1 py-2.5 px-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Setujui & Terbitkan Kwitansi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
