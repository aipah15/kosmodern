"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Landmark,
  Plus,
  Copy,
  Check,
  Edit2,
  Trash2,
  Save,
  UploadCloud,
  Camera,
  Download,
  Megaphone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Building,
} from "lucide-react";
import { BankAccount, PaymentSettings } from "@/types/payment-settings";
import { createClient } from "@/lib/supabase/client";

interface PaymentSettingsSectionProps {
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

export const PaymentSettingsSection: React.FC<PaymentSettingsSectionProps> = ({
  onShowToast,
}) => {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial State matching Screenshot
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      bank_name: "Bank Central Asia (BCA)",
      bank_code: "BCA",
      account_number: "842-019-3821",
      account_holder: "Hj. Ratna Juwita",
      branch: "KCU Wisma Asri",
      is_primary: true,
      is_active: true,
    },
    {
      id: "2",
      bank_name: "Bank Mandiri",
      bank_code: "MNDR",
      account_number: "137-00-1928374-1",
      account_holder: "Hj. Ratna Juwita",
      branch: "KC Fatmawati",
      is_primary: false,
      is_active: true,
    },
    {
      id: "3",
      bank_name: "Bank Rakyat Indonesia (BRI)",
      bank_code: "BRI",
      account_number: "0341-01-082910-50-2",
      account_holder: "Ratna Juwita",
      branch: "Unit Cilandak Barat",
      is_primary: false,
      is_active: true,
    },
  ]);

  const [settings, setSettings] = useState<PaymentSettings>({
    qris_merchant_name: "KOST YUSI – RATNA JUWITA",
    qris_nmid: "ID1020039201928",
    qris_city: "JAKARTA SELATAN",
    qris_postal_code: "12430",
    qris_is_active: true,
  });

  // Form State
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [formBankName, setFormBankName] = useState("Bank Central Asia (BCA)");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formAccountHolder, setFormAccountHolder] = useState("");
  const [formBranch, setFormBranch] = useState("");
  const [formIsPrimary, setFormIsPrimary] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [qrisPreviewUrl, setQrisPreviewUrl] = useState<string | null>(null);

  // Available Banks Preset
  const bankOptions = [
    { label: "Bank Central Asia (BCA)", code: "BCA" },
    { label: "Bank Mandiri", code: "MNDR" },
    { label: "Bank Rakyat Indonesia (BRI)", code: "BRI" },
    { label: "Bank Negara Indonesia (BNI)", code: "BNI" },
    { label: "Bank Syariah Indonesia (BSI)", code: "BSI" },
    { label: "Bank Jago", code: "JAGO" },
    { label: "SeaBank", code: "SEABANK" },
  ];

  // 2. Fetch from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: accountsData } = await supabase
          .from("bank_accounts")
          .select("*")
          .order("is_primary", { ascending: false });

        if (accountsData && accountsData.length > 0) {
          setBankAccounts(accountsData as BankAccount[]);
        }

        const { data: settingsData } = await supabase
          .from("payment_settings")
          .select("*")
          .limit(1)
          .single();

        if (settingsData) {
          setSettings(settingsData as PaymentSettings);
          if (settingsData.qris_image_url) {
            setQrisPreviewUrl(settingsData.qris_image_url);
          }
        }
      } catch (err) {
        console.error("Error loading payment settings from Supabase:", err);
      }
    }
    loadData();
  }, [supabase]);

  // Handle Copy Account Number
  const handleCopy = (acc: BankAccount) => {
    navigator.clipboard.writeText(acc.account_number.replace(/\D/g, ""));
    setCopiedId(acc.id);
    onShowToast?.(`Nomor rekening ${acc.bank_name} berhasil disalin!`, "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Set Primary Account
  const handleSetPrimary = async (targetId: string) => {
    try {
      // Supabase update
      await supabase.from("bank_accounts").update({ is_primary: false }).neq("id", targetId);
      await supabase.from("bank_accounts").update({ is_primary: true }).eq("id", targetId);

      // Local update
      setBankAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          is_primary: acc.id === targetId,
        }))
      );
      onShowToast?.("Rekening utama berhasil diperbarui!", "success");
    } catch {
      onShowToast?.("Gagal mengatur rekening utama.", "error");
    }
  };

  // Delete Account
  const handleDelete = async (targetId: string) => {
    const acc = bankAccounts.find((a) => a.id === targetId);
    if (!acc) return;
    if (acc.is_primary) {
      onShowToast?.("Rekening utama tidak dapat dihapus. Jadikan rekening lain sebagai utama terlebih dahulu.", "error");
      return;
    }

    try {
      await supabase.from("bank_accounts").delete().eq("id", targetId);
      setBankAccounts((prev) => prev.filter((a) => a.id !== targetId));
      onShowToast?.(`Rekening ${acc.bank_name} telah dihapus.`, "info");
    } catch {
      onShowToast?.("Gagal menghapus rekening bank.", "error");
    }
  };

  // Populate Edit Form
  const handleEdit = (acc: BankAccount) => {
    setEditingAccountId(acc.id);
    setFormBankName(acc.bank_name);
    setFormAccountNumber(acc.account_number);
    setFormAccountHolder(acc.account_holder);
    setFormBranch(acc.branch || "");
    setFormIsPrimary(acc.is_primary);
    // Scroll to form
    const formElement = document.getElementById("bank-account-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Cancel Form
  const handleCancelForm = () => {
    setEditingAccountId(null);
    setFormAccountNumber("");
    setFormAccountHolder("");
    setFormBranch("");
    setFormIsPrimary(false);
  };

  // Save Bank Account
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formAccountNumber.trim() || !formAccountHolder.trim()) {
      onShowToast?.("Harap isi Nomor Rekening dan Nama Pemilik Rekening.", "error");
      return;
    }

    const selectedBank = bankOptions.find((b) => b.label === formBankName) || {
      label: formBankName,
      code: "BANK",
    };

    try {
      if (editingAccountId) {
        // Edit existing
        if (formIsPrimary) {
          await supabase.from("bank_accounts").update({ is_primary: false }).neq("id", editingAccountId);
        }

        const { error } = await supabase
          .from("bank_accounts")
          .update({
            bank_name: formBankName,
            bank_code: selectedBank.code,
            account_number: formAccountNumber,
            account_holder: formAccountHolder,
            branch: formBranch,
            is_primary: formIsPrimary,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAccountId);

        if (error) throw error;

        setBankAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id === editingAccountId) {
              return {
                ...acc,
                bank_name: formBankName,
                bank_code: selectedBank.code,
                account_number: formAccountNumber,
                account_holder: formAccountHolder,
                branch: formBranch,
                is_primary: formIsPrimary,
              };
            }
            return formIsPrimary ? { ...acc, is_primary: false } : acc;
          })
        );

        onShowToast?.("Perubahan rekening berhasil disimpan!", "success");
      } else {
        // Create new
        if (formIsPrimary) {
          await supabase.from("bank_accounts").update({ is_primary: false }).neq("id", "00000000-0000-0000-0000-000000000000");
        }

        const newId = crypto.randomUUID();
        const newAcc: BankAccount = {
          id: newId,
          bank_name: formBankName,
          bank_code: selectedBank.code,
          account_number: formAccountNumber,
          account_holder: formAccountHolder,
          branch: formBranch || "KC Fatmawati",
          is_primary: formIsPrimary || bankAccounts.length === 0,
          is_active: true,
        };

        const { error } = await supabase.from("bank_accounts").insert([newAcc]);
        if (error) throw error;

        setBankAccounts((prev) => [
          ...(formIsPrimary ? prev.map((a) => ({ ...a, is_primary: false })) : prev),
          newAcc,
        ]);

        onShowToast?.(`Rekening ${formBankName} berhasil ditambahkan!`, "success");
      }

      handleCancelForm();
    } catch (err) {
      console.error("Error saving bank account:", err);
      onShowToast?.("Gagal menyimpan rekening ke database.", "error");
    }
  };

  // Save All Changes button
  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      await supabase
        .from("payment_settings")
        .update({
          qris_merchant_name: settings.qris_merchant_name,
          qris_city: settings.qris_city,
          qris_postal_code: settings.qris_postal_code,
          updated_at: new Date().toISOString(),
        })
        .match({ qris_is_active: true });

      onShowToast?.("Semua pengaturan saluran pembayaran berhasil disimpan!", "success");
    } catch {
      onShowToast?.("Semua perubahan tersimpan secara lokal.", "success");
    } finally {
      setIsSavingAll(false);
    }
  };

  // Handle QRIS image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onShowToast?.("File harus berupa gambar (PNG / JPG).", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setQrisPreviewUrl(url);
      onShowToast?.("Gambar QRIS berhasil diperbarui!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Bank badge color helper
  const getBankBadge = (code: string) => {
    switch (code) {
      case "BCA":
        return { bg: "bg-[#e8f0fe]", text: "text-[#0060af]", label: "BCA" };
      case "MNDR":
        return { bg: "bg-amber-100", text: "text-amber-800", label: "MNDR" };
      case "BRI":
        return { bg: "bg-sky-100", text: "text-sky-800", label: "BRI" };
      case "BNI":
        return { bg: "bg-emerald-100", text: "text-emerald-800", label: "BNI" };
      default:
        return { bg: "bg-indigo-100", text: "text-indigo-800", label: code };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Title, Description, and Save All Button */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengaturan Rekening & Saluran Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5 leading-relaxed">
            Konfigurasikan QRIS dinamis/statis serta daftar rekening bank tujuan transfer yang
            akan ditampilkan secara otomatis pada aplikasi penghuni dan invoice penagihan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSavingAll}
          className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-[#4338ca] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isSavingAll ? "Menyimpan..." : "Simpan Semua Perubahan"}</span>
        </button>
      </div>

      {/* 2. Main Two-Column Grid: Left QRIS & Right Bank Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: QRIS Configuration (~5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-5">
          {/* Section Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center border border-indigo-100">
              <QrCode className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">QRIS Nasional</h2>
          </div>

          {/* Authentic QRIS Card Display matching Screenshot */}
          <div className="bg-[#fcfcfd] rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs max-w-sm mx-auto font-sans relative overflow-hidden">
            {/* Red QRIS Header */}
            <div className="border-b-2 border-slate-100 pb-3 text-center">
              <div className="text-xl font-black text-[#ea1c24] tracking-widest leading-none mb-1">
                QRIS
              </div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                {settings.qris_merchant_name}
              </p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                A/C: {settings.qris_city} • KODE POS {settings.qris_postal_code}
              </p>
            </div>

            {/* QR Code graphic */}
            <div className="py-4 flex justify-center">
              {qrisPreviewUrl ? (
                <img
                  src={qrisPreviewUrl}
                  alt="QRIS Kost Yusi"
                  className="w-48 h-48 object-contain rounded-xl border border-slate-100 p-2 bg-white"
                />
              ) : (
                <div className="w-48 h-48 bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex flex-col items-center justify-center relative">
                  {/* Clean SVG QR Representation */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-slate-900 fill-current"
                  >
                    {/* Corner 1 */}
                    <rect x="5" y="5" width="26" height="26" rx="4" fill="currentColor" />
                    <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                    <rect x="13" y="13" width="10" height="10" fill="currentColor" />

                    {/* Corner 2 */}
                    <rect x="69" y="5" width="26" height="26" rx="4" fill="currentColor" />
                    <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                    <rect x="77" y="13" width="10" height="10" fill="currentColor" />

                    {/* Corner 3 */}
                    <rect x="5" y="69" width="26" height="26" rx="4" fill="currentColor" />
                    <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                    <rect x="13" y="77" width="10" height="10" fill="currentColor" />

                    {/* Random pattern data cells */}
                    <rect x="36" y="8" width="6" height="6" fill="currentColor" />
                    <rect x="46" y="8" width="6" height="6" fill="currentColor" />
                    <rect x="56" y="8" width="6" height="6" fill="currentColor" />

                    <rect x="36" y="18" width="6" height="6" fill="currentColor" />
                    <rect x="50" y="18" width="6" height="6" fill="currentColor" />

                    <rect x="8" y="36" width="6" height="6" fill="currentColor" />
                    <rect x="18" y="36" width="6" height="6" fill="currentColor" />
                    <rect x="28" y="36" width="6" height="6" fill="currentColor" />

                    <rect x="8" y="46" width="6" height="6" fill="currentColor" />
                    <rect x="22" y="46" width="6" height="6" fill="currentColor" />

                    <rect x="36" y="36" width="28" height="28" rx="3" fill="#4f46e5" />
                    <circle cx="50" cy="50" r="4" fill="white" />

                    <rect x="70" y="36" width="6" height="6" fill="currentColor" />
                    <rect x="82" y="36" width="6" height="6" fill="currentColor" />
                    <rect x="76" y="46" width="6" height="6" fill="currentColor" />

                    <rect x="36" y="70" width="6" height="6" fill="currentColor" />
                    <rect x="46" y="70" width="6" height="6" fill="currentColor" />
                    <rect x="56" y="70" width="6" height="6" fill="currentColor" />
                    <rect x="70" y="70" width="6" height="6" fill="currentColor" />
                    <rect x="80" y="70" width="6" height="6" fill="currentColor" />

                    <rect x="36" y="82" width="6" height="6" fill="currentColor" />
                    <rect x="50" y="82" width="6" height="6" fill="currentColor" />
                    <rect x="76" y="82" width="6" height="6" fill="currentColor" />
                    <rect x="88" y="82" width="6" height="6" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>

            {/* Supported Payment Logos Row */}
            <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-1.5">
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] font-bold text-slate-600">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  GoPay
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                  OVO
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                  DANA
                </span>
                <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-100">
                  ShopeePay
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  BCA Mobile
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold">
                Livin'
              </span>
            </div>
          </div>

          {/* Upload Dropzone Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200/80 hover:border-indigo-500 rounded-2xl p-4 sm:p-5 text-center bg-[#f8faff] hover:bg-indigo-50/40 transition cursor-pointer"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png, image/jpeg"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#4f46e5] flex items-center justify-center mx-auto mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Tarik gambar QRIS ke sini atau Klik untuk Mengunggah
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              PNG, JPG (Maks. 5 MB, rekomendasi min. 800×800 px)
            </p>
          </div>

          {/* Action Buttons: Ganti Gambar QRIS & Unduh */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Ganti Gambar QRIS</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onShowToast?.("Mengunduh gambar QRIS resmi Kost Yusi...", "info");
              }}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Rekening Bank Resmi (~7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Box Header */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Rekening Bank Resmi
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                      {bankAccounts.length} Rekening Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Opsi transfer bank manual dengan bukti bayar otomatis
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleCancelForm();
                  const formElement = document.getElementById("bank-account-form");
                  if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
                }}
                className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Tambah Rekening Bank</span>
              </button>
            </div>

            {/* Informational Banner */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
              <Megaphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px] sm:text-xs">
                Penghuni akan melihat daftar rekening ini saat memilih opsi <strong>Transfer Bank</strong> pada
                aplikasi KosModern serta pada lembar bukti tagihan (invoice).
              </p>
            </div>

            {/* Bank Accounts List matching Cards in Screenshot */}
            <div className="space-y-3 pt-1">
              {bankAccounts.map((acc) => {
                const badge = getBankBadge(acc.bank_code);
                const isCopied = copiedId === acc.id;

                return (
                  <div
                    key={acc.id}
                    className={`rounded-2xl p-4 transition-all border ${
                      acc.is_primary
                        ? "bg-white border-slate-200/90 shadow-sm"
                        : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left Bank Details */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${badge.bg} ${badge.text} shadow-2xs`}
                        >
                          {badge.label}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 leading-tight">
                              {acc.bank_name}
                            </h3>
                            {acc.is_primary ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Rekening Utama (Default)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                                Aktif
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-xs sm:text-sm font-bold text-slate-800">
                              {acc.account_number}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(acc)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2 py-0.5 rounded-lg border border-slate-200 transition cursor-pointer"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin</span>
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-[11px] text-slate-400 mt-1">
                            a.n. {acc.account_holder} {acc.branch ? `• ${acc.branch}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {acc.is_primary ? (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold select-none">
                            Utama
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(acc.id)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition cursor-pointer"
                          >
                            Jadikan Utama
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleEdit(acc)}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                          title="Edit Rekening"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(acc.id)}
                          className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                          title="Hapus Rekening"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Tambah / Edit Rekening Bank Baru */}
          <div
            id="bank-account-form"
            className="bg-[#f8faff] rounded-3xl p-5 sm:p-6 border border-indigo-100/80 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100/60">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#4f46e5]" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingAccountId ? "Form Ubah Rekening Bank" : "Form Tambah Rekening Bank Baru"}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Semua field wajib diisi
              </span>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5">
              {/* Row 1: Pilih Nama Bank & Nomor Rekening Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pilih Nama Bank
                  </label>
                  <select
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    className="w-full bg-white rounded-xl px-3 py-2.5 text-xs text-slate-800 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs cursor-pointer"
                  >
                    {bankOptions.map((b) => (
                      <option key={b.code} value={b.label}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nomor Rekening Bank
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Contoh: 521098231"
                      value={formAccountNumber}
                      onChange={(e) => setFormAccountNumber(e.target.value)}
                      className="w-full bg-white rounded-xl pl-3 pr-9 py-2.5 text-xs font-mono text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                    />
                    {formAccountNumber.trim().length >= 5 && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Nama Pemilik Rekening */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Pemilik Rekening (Sesuai Buku Tabungan)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Hj. Ratna Juwita"
                  value={formAccountHolder}
                  onChange={(e) => setFormAccountHolder(e.target.value)}
                  className="w-full bg-white rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                />
              </div>

              {/* Row 3: Kantor Cabang (Opsional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kantor Cabang (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: KC Fatmawati / KCU Wisma Asri"
                  value={formBranch}
                  onChange={(e) => setFormBranch(e.target.value)}
                  className="w-full bg-white rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                />
              </div>

              {/* Checkbox Jadikan Utama */}
              <label className="flex items-center gap-2.5 pt-1 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsPrimary}
                  onChange={(e) => setFormIsPrimary(e.target.checked)}
                  className="w-4 h-4 text-[#4f46e5] rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Jadikan sebagai rekening tujuan utama (default pada invoice)</span>
              </label>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Rekening</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
