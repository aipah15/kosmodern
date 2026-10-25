"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Smartphone,
  ExternalLink,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";

export interface PaymentProof {
  id: string;
  room_number: string;
  resident_name: string;
  amount: number;
  bank_name: string;
  time_transfer: string;
  note: string;
  status: "pending" | "approved" | "rejected";
}

interface PaymentVerificationSectionProps {
  initialProofs?: PaymentProof[];
  onApproveProof?: (id: string) => void;
  onRejectProof?: (id: string) => void;
}

export const PaymentVerificationSection: React.FC<PaymentVerificationSectionProps> = ({
  initialProofs = [
    {
      id: "1",
      room_number: "B-04",
      resident_name: "Azka Andya",
      amount: 1575000,
      bank_name: "BCA",
      time_transfer: "14:15 WIB",
      note: "Transfer via BCA Mobile a.n Azka Andya...",
      status: "pending",
    },
    {
      id: "2",
      room_number: "B-01",
      resident_name: "Sarah Nabilla",
      amount: 1500000,
      bank_name: "BCA",
      time_transfer: "13:40 WIB",
      note: "Sewa kamar kost putri bulan November Sarah...",
      status: "pending",
    },
    {
      id: "3",
      room_number: "A-01",
      resident_name: "Riana",
      amount: 1350000,
      bank_name: "Mandiri",
      time_transfer: "11:20 WIB",
      note: "Sewa kamar bulan November",
      status: "pending",
    },
    {
      id: "4",
      room_number: "B-05",
      resident_name: "Salma Ramadhani",
      amount: 1500000,
      bank_name: "BRI",
      time_transfer: "09:10 WIB",
      note: "Transfer langsung via BRIMO a.n Salma.R",
      status: "pending",
    },
  ],
  onApproveProof,
  onRejectProof,
}) => {
  const [proofs, setProofs] = useState<PaymentProof[]>(initialProofs);
  const [activeTab, setActiveTab] = useState<"all" | "bca" | "other">("all");
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);

  const filteredProofs = proofs.filter((p) => {
    if (activeTab === "bca") return p.bank_name.toUpperCase().includes("BCA");
    if (activeTab === "other") return !p.bank_name.toUpperCase().includes("BCA");
    return true;
  });

  const handleApprove = (id: string) => {
    setProofs((prev) => prev.filter((p) => p.id !== id));
    setSelectedProof(null);
    onApproveProof?.(id);
  };

  const handleReject = (id: string) => {
    setProofs((prev) => prev.filter((p) => p.id !== id));
    setSelectedProof(null);
    onRejectProof?.(id);
  };

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06),0_5px_15px_-5px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <ShieldCheck className="w-4 h-4" />
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
          <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/80">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {proofs.length} Menunggu Konfirmasi
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 my-4">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
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
            onClick={() => setActiveTab("bca")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "bca"
                ? "bg-[#4f46e5] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Transfer BCA ({proofs.filter((p) => p.bank_name === "BCA").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("other")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "other"
                ? "bg-[#4f46e5] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Mandiri / Lainnya ({proofs.filter((p) => p.bank_name !== "BCA").length})
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {filteredProofs.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedProof(item)}
              className="bg-[#f8faff] hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 rounded-2xl p-3.5 flex items-center justify-between gap-3.5 transition-all duration-150 cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Thumbnail simulation */}
                <div className="w-11 h-14 rounded-xl bg-slate-900/90 border border-slate-700 text-white flex flex-col items-center justify-center shrink-0 p-1 relative overflow-hidden group-hover:scale-105 transition-transform">
                  <div className="w-full text-[7px] text-center bg-indigo-600 text-white font-mono uppercase py-0.5 rounded-xs leading-none">
                    {item.bank_name}
                  </div>
                  <Smartphone className="w-4 h-4 text-slate-300 mt-1" />
                  <span className="text-[7px] text-emerald-400 font-mono mt-0.5">
                    SUCCESS
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-[#4f46e5] bg-[#eeeffe] px-2 py-0.5 rounded-md border border-[#d6d8fe]">
                      Kamar {item.room_number}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {item.resident_name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">
                      Rp {item.amount.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.bank_name} • {item.time_transfer}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic truncate mt-0.5 font-normal">
                    &ldquo;{item.note}&rdquo;
                  </p>
                </div>
              </div>

              {/* View / Action arrow */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-[#4f46e5] group-hover:underline hidden sm:inline">
                  Tinjau Struk
                </span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#4f46e5] transition" />
              </div>
            </div>
          ))}

          {filteredProofs.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada bukti transfer yang menunggu konfirmasi pada kategori ini.
            </div>
          )}
        </div>
      </div>

      {/* Modal Preview Struk Transfer */}
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
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Transfer Receipt Mockup */}
            <div className="my-4 bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-center">
              <div className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full mb-2">
                Transfer Berhasil ({selectedProof.bank_name})
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                Rp {selectedProof.amount.toLocaleString("id-ID")}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Waktu: {selectedProof.time_transfer}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-left text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pengirim:</span>
                  <span className="font-semibold text-slate-800">{selectedProof.resident_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tujuan:</span>
                  <span className="font-semibold text-slate-800">Kost Yusi (BCA 882019281)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Catatan:</span>
                  <span className="font-semibold text-slate-800">{selectedProof.note}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleReject(selectedProof.id)}
                className="flex-1 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak Bukti</span>
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedProof.id)}
                className="flex-1 py-2.5 px-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
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
