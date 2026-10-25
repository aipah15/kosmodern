"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Zap,
  Droplets,
  Ban,
  Lock,
  MoreHorizontal,
  Check,
  Send,
  Save,
  Trash2,
  Users,
  Building,
  Calculator,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Tenant } from "@/types/tenant";
import { BillCategory, CreateExtraBillFormData } from "@/types/bill";

interface ExtraBillFormSectionProps {
  tenants: Tenant[];
  onBack: () => void;
  onSubmit: (formData: CreateExtraBillFormData) => Promise<void>;
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
}

export const ExtraBillFormSection: React.FC<ExtraBillFormSectionProps> = ({
  tenants,
  onBack,
  onSubmit,
  onShowToast,
}) => {
  // Preselect 4 tenants matching Image 1
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>(() => {
    // Try to find matching names from Image 1: Azka, Riana, Alya, Fitria
    const targetNames = ["Azka Andya Safira", "Riana", "Alya Syarifah", "Fitria Ramadhani"];
    const matched = tenants.filter((t) =>
      targetNames.some((name) => t.full_name.toLowerCase().includes(name.toLowerCase()))
    );
    if (matched.length > 0) return matched.map((t) => t.id);
    return tenants.slice(0, 4).map((t) => t.id);
  });

  const [category, setCategory] = useState<BillCategory>("listrik");
  const [title, setTitle] = useState("Iuran Pemakaian Listrik Tambahan");
  const [amount, setAmount] = useState<number>(50000);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate an invoice number matching Image 1 e.g. "INV-MAN-202505-081"
  const invoiceNumber = useMemo(() => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `INV-MAN-202610-${randomSuffix}`;
  }, []);

  const totalNominal = amount * selectedTenantIds.length;

  const toggleTenant = (id: string) => {
    setSelectedTenantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedTenantIds(tenants.map((t) => t.id));
  };

  const handleResetSelection = () => {
    setSelectedTenantIds([]);
  };

  const categoryPresets: { [key in BillCategory]: string } = {
    listrik: "Iuran Pemakaian Listrik Tambahan",
    air: "Tagihan Meteran Air Bersih / PAM",
    denda: "Denda Keterlambatan Pembayaran Sewa",
    deposit: "Penambahan Deposit Jaminan Sewa",
    lainnya: "Iuran Tambahan Laundry / Parkir",
    sewa: "Biaya Sewa Tambahan",
  };

  const handleCategorySelect = (cat: BillCategory) => {
    setCategory(cat);
    setTitle(categoryPresets[cat] || "Tagihan Tambahan");
  };

  const handleFormSubmit = async (isDraft = false) => {
    if (selectedTenantIds.length === 0) {
      onShowToast("Pilih minimal satu penghuni penerima tagihan.", "error");
      return;
    }
    if (amount <= 0) {
      onShowToast("Nominal tagihan harus lebih besar dari 0.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const today = new Date();
      const dueDate = new Date(today.setDate(today.getDate() + 7)).toISOString().slice(0, 10);

      await onSubmit({
        selected_tenant_ids: selectedTenantIds,
        bill_category: category,
        title,
        amount_per_tenant: amount,
        due_date: dueDate,
        send_whatsapp: sendWhatsApp,
        is_draft: isDraft,
      });
      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Formulir Tagihan Tambahan
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Terbitkan tagihan utilitas, denda keterlambatan, atau iuran insidental untuk penghuni tunggal maupun massal dalam satu klik otomatis.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Riwayat</span>
        </button>
      </div>

      {/* Main Grid: Form Steps (Left 8 cols) & Ringkasan (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): 3 Steps */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Pilih Penghuni Target */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pilih Penghuni Target
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pilih satu atau beberapa kamar penerima tagihan secara kolektif
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Pilih Semua</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSelection}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer px-2"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Selected Pills Container */}
            {selectedTenantIds.length > 0 && (
              <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 mr-1">
                  Terpilih:
                </span>
                {tenants
                  .filter((t) => selectedTenantIds.includes(t.id))
                  .map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-indigo-900 border border-indigo-200/80 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      <span>
                        {t.full_name} ({t.room_number})
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleTenant(t.id)}
                        className="text-slate-400 hover:text-rose-500 transition cursor-pointer ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {/* Tenant Selection List matching Image 1 */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {tenants.map((t) => {
                const isSelected = selectedTenantIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTenant(t.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/40 border-indigo-200/80 shadow-xs"
                        : "bg-slate-50/60 border-slate-100 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {t.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {t.full_name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                            Kamar {t.room_number} • {t.floor || "Lt 1"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {t.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Klasifikasi & Jenis Tagihan */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Klasifikasi &amp; Jenis Tagihan
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pilih kategori pos biaya untuk pembukuan laporan keuangan otomatis
                </p>
              </div>
            </div>

            {/* 5 Interactive Category Cards matching Image 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Listrik */}
              <button
                type="button"
                onClick={() => handleCategorySelect("listrik")}
                className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  category === "listrik"
                    ? "border-amber-400 bg-amber-50/70 text-amber-900 shadow-xs"
                    : "border-slate-100 bg-slate-50/60 hover:bg-slate-100 text-slate-600"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Listrik</span>
                  <span className="text-[9px] text-slate-400 block">Token / KWH</span>
                </div>
              </button>

              {/* Air Bersih */}
              <button
                type="button"
                onClick={() => handleCategorySelect("air")}
                className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  category === "air"
                    ? "border-sky-400 bg-sky-50/70 text-sky-900 shadow-xs"
                    : "border-slate-100 bg-slate-50/60 hover:bg-slate-100 text-slate-600"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Droplets className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Air Bersih</span>
                  <span className="text-[9px] text-slate-400 block">Meteran PAM</span>
                </div>
              </button>

              {/* Denda */}
              <button
                type="button"
                onClick={() => handleCategorySelect("denda")}
                className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  category === "denda"
                    ? "border-rose-400 bg-rose-50/70 text-rose-900 shadow-xs"
                    : "border-slate-100 bg-slate-50/60 hover:bg-slate-100 text-slate-600"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Denda</span>
                  <span className="text-[9px] text-slate-400 block">Keterlambatan</span>
                </div>
              </button>

              {/* Deposit */}
              <button
                type="button"
                onClick={() => handleCategorySelect("deposit")}
                className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  category === "deposit"
                    ? "border-purple-400 bg-purple-50/70 text-purple-900 shadow-xs"
                    : "border-slate-100 bg-slate-50/60 hover:bg-slate-100 text-slate-600"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Deposit</span>
                  <span className="text-[9px] text-slate-400 block">Jaminan Sewa</span>
                </div>
              </button>

              {/* Lainnya */}
              <button
                type="button"
                onClick={() => handleCategorySelect("lainnya")}
                className={`p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  category === "lainnya"
                    ? "border-emerald-400 bg-emerald-50/70 text-emerald-900 shadow-xs"
                    : "border-slate-100 bg-slate-50/60 hover:bg-slate-100 text-slate-600"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MoreHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block">Lainnya</span>
                  <span className="text-[9px] text-slate-400 block">Laundry / Parkir</span>
                </div>
              </button>
            </div>

            {/* Judul / Subjek Tagihan Field */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Judul / Subjek Tagihan
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Iuran Pemakaian Listrik Tambahan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          {/* STEP 3: Nominal & Batas Pembayaran */}
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Nominal &amp; Batas Pembayaran
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tentukan besaran tagihan per penghuni dan tenggat waktu pelunasan
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Nominal per Penghuni
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">Rupiah (IDR)</span>
              </div>

              {/* Large Input with "Rp" prefix */}
              <div className="relative flex items-center">
                <span className="absolute left-4 text-base font-extrabold text-slate-600">
                  Rp
                </span>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              {/* Quick Preset Chips matching Image 1 */}
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {[50000, 100000, 150000, 250000, 500000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      amount === preset
                        ? "bg-[#4f46e5] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    Rp {preset.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>
            </div>

            {/* Accumulation Summary Card matching Image 1 */}
            <div className="bg-indigo-50/60 border border-indigo-100/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-indigo-100 text-[#4f46e5] flex items-center justify-center shrink-0 shadow-xs">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Akumulasi Penagihan Kolektif:
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    Rp {amount.toLocaleString("id-ID")} × {selectedTenantIds.length} Penghuni Terpilih
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  TOTAL TAGIHAN DITERBITKAN
                </span>
                <span className="text-lg font-black text-[#4f46e5]">
                  Rp {totalNominal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Ringkasan Tagihan matching Image 1 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ringkasan Tagihan
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                DRAF OTOMATIS
              </span>
            </div>

            {/* Breakdown rows */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Jenis Tagihan</span>
                <span className="font-bold text-slate-800 capitalize">{category}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Jumlah Penerima</span>
                <span className="font-bold text-slate-800">
                  {selectedTenantIds.length} Penghuni Terpilih
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Tarif per Kamar</span>
                <span className="font-bold text-slate-800">
                  Rp {amount.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Nomor Tagihan</span>
                <span className="font-mono text-[11px] font-bold text-slate-600">
                  {invoiceNumber}
                </span>
              </div>
            </div>

            {/* Total Box */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase block">
                TOTAL NOMINAL PIUTANG BARU
              </span>
              <div className="text-2xl font-black text-[#4f46e5] mt-1">
                Rp {totalNominal.toLocaleString("id-ID")}
              </div>
            </div>

            {/* WhatsApp notification checkbox */}
            <label className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl cursor-pointer transition">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kirim Notifikasi WhatsApp</span>
              </span>
            </label>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting || selectedTenantIds.length === 0}
                onClick={() => handleFormSubmit(false)}
                className="w-full py-3 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menerbitkan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Buat Tagihan (Kirim ke {selectedTenantIds.length} Penghuni)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting || selectedTenantIds.length === 0}
                onClick={() => handleFormSubmit(true)}
                className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Simpan sebagai Draf</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-1 text-xs text-slate-400 hover:text-rose-600 transition cursor-pointer text-center block font-medium"
              >
                Batalkan dan Buang Draf
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
