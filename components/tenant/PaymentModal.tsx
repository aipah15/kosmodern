"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  Copy,
  Check,
  Upload,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount?: number;
  invoiceNumber?: string;
  onPaymentSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount = 1575000,
  invoiceNumber = "INV-202611-B04",
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"qris" | "va" | "manual">("qris");
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Manual transfer state
  const [senderBank, setSenderBank] = useState("BCA");
  const [senderName, setSenderName] = useState("Azka Andya");
  const [proofFile, setProofFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(id);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onPaymentSuccess?.();
        onClose();
      }, 1500);
    }, 1200);
  };

  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] bg-white rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Pembayaran Tagihan Kos
              </h3>
              <p className="text-[11px] text-slate-400">{invoiceNumber}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Amount Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-[#eef2ff] to-blue-50 border border-indigo-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">
              Total yang harus dibayar:
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#4f46e5] tracking-tight">
              {formattedAmount}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(totalAmount.toString(), "amount")}
            className="px-2.5 py-1.5 bg-white border border-indigo-200 hover:border-indigo-300 text-[#4f46e5] rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs transition cursor-pointer"
          >
            {copiedBank === "amount" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Disalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Breakdown Items */}
        <div className="mt-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 space-y-1.5 border border-slate-100">
          <div className="flex justify-between">
            <span>Sewa Kamar B-04 (Nov 2026)</span>
            <span className="font-semibold text-slate-800">Rp 1.500.000</span>
          </div>
          <div className="flex justify-between text-amber-700">
            <span>Listrik Kulkas Tambahan</span>
            <span className="font-semibold">Rp 50.000</span>
          </div>
          <div className="flex justify-between text-rose-700">
            <span>Denda Terlambat Okt</span>
            <span className="font-semibold">Rp 25.000</span>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("qris")}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === "qris"
                ? "bg-white text-[#4f46e5] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            QRIS Instan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("va")}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === "va"
                ? "bg-white text-[#4f46e5] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Virtual Account
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === "manual"
                ? "bg-white text-[#4f46e5] shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Transfer Bank
          </button>
        </div>

        {/* Tab 1: QRIS */}
        {activeTab === "qris" && (
          <div className="mt-4 flex flex-col items-center text-center">
            <div className="w-52 h-52 bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-md relative flex flex-col items-center justify-center">
              {/* Fake QRIS SVG illustration */}
              <div className="w-full flex justify-between items-center px-1 mb-1 text-[9px] font-bold text-slate-700 tracking-wider">
                <span className="text-rose-600">QRIS</span>
                <span>GPN</span>
              </div>
              <div className="w-40 h-40 bg-slate-900 rounded-lg p-2 flex flex-wrap items-center justify-center gap-1">
                {/* SVG pattern representing realistic QR Code */}
                <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm13-2h3v3h-3v-3zm0 5h5v3h-5v-3zm3-2h2v2h-2v-2zm-6-3h2v4h-2v-4zm0 6h4v2h-4v-2z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-slate-800 mt-1">
                KOST YUSI - RATNA JUWITA
              </span>
              <span className="text-[8px] text-slate-400 font-mono">
                NMID: ID1020039201928
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-3 font-medium">
              Scan dengan aplikasi BCA, Mandiri, GoPay, OVO, ShopeePay, atau DANA
            </p>

            <button
              type="button"
              onClick={() => {
                setIsDone(true);
                setTimeout(() => {
                  setIsDone(false);
                  onPaymentSuccess?.();
                  onClose();
                }, 1500);
              }}
              className="w-full mt-4 py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Simulasikan Pembayaran Berhasil</span>
            </button>
          </div>
        )}

        {/* Tab 2: Virtual Account */}
        {activeTab === "va" && (
          <div className="mt-4 space-y-2.5">
            {/* BCA */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 block">
                  BCA VIRTUAL ACCOUNT
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                  80777 08129876543
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  a.n Kost Yusi - Azka Andya
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy("8077708129876543", "bca")}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
              >
                {copiedBank === "bca" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedBank === "bca" ? "Disalin" : "Salin"}</span>
              </button>
            </div>

            {/* Mandiri */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-600 block">
                  MANDIRI VIRTUAL ACCOUNT
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                  89201 08129876543
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  a.n Kost Yusi - Azka Andya
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy("8920108129876543", "mandiri")}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
              >
                {copiedBank === "mandiri" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedBank === "mandiri" ? "Disalin" : "Salin"}</span>
              </button>
            </div>

            {/* BRI */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-600 block">
                  BRI VIRTUAL ACCOUNT (BRIVA)
                </span>
                <span className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                  12800 08129876543
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  a.n Kost Yusi - Azka Andya
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy("1280008129876543", "bri")}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
              >
                {copiedBank === "bri" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedBank === "bri" ? "Disalin" : "Salin"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Manual Bank Transfer & Upload Proof */}
        {activeTab === "manual" && (
          <form onSubmit={handleSubmitProof} className="mt-4 space-y-3">
            <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Rekening Resmi Pemilik Kos:</span>
              <div className="font-mono text-sm font-bold text-slate-900">
                Mandiri: 137-001928374-1
              </div>
              <span className="text-[11px] text-slate-600">
                a.n Hj. Ratna Juwita (Kost Yusi)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Bank Pengirim
              </label>
              <select
                value={senderBank}
                onChange={(e) => setSenderBank(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
              >
                <option value="BCA">BCA</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="BRI">BRI</option>
                <option value="BNI">BNI</option>
                <option value="BSI">BSI</option>
                <option value="Jago">Bank Jago / Seabank</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nama Pengirim di Rekening
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Unggah Bukti Transfer
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition cursor-pointer">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-[#4f46e5] font-semibold block">
                  Pilih file bukti transfer (JPG / PNG)
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Maksimal 5 MB
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <span>Mengirim bukti pembayaran...</span>
              ) : isDone ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Bukti Berhasil Dikirim!</span>
                </>
              ) : (
                <>
                  <span>Kirim Bukti Pembayaran</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
