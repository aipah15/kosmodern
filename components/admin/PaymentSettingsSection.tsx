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
  Shield,
  Settings,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  DollarSign,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { BankAccount, PaymentSettings } from "@/types/payment-settings";
import { createClient } from "@/lib/supabase/client";
import { uploadImageToStorage } from "@/lib/utils/storage";
import { DEFAULT_PROPERTY } from "@/lib/constants";

interface PaymentSettingsSectionProps {
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

type SettingsSubTab = "payment" | "property" | "policies";

export const PaymentSettingsSection: React.FC<PaymentSettingsSectionProps> = ({
  onShowToast,
}) => {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sub-tab aktif: Rekening & Saluran Pembayaran | Profil Properti | Kebijakan Sewa
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("payment");

  // 1. Data Rekening Bank Resmi
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Data QRIS Nasional
  const [settings, setSettings] = useState<PaymentSettings>({
    qris_merchant_name: "",
    qris_nmid: "",
    qris_city: "",
    qris_postal_code: "",
    qris_is_active: true,
  });

  // 3. Data Profil Properti & Pemilik Kos
  const [propertyProfile, setPropertyProfile] = useState({
    propertyName: DEFAULT_PROPERTY.name,
    tagline: DEFAULT_PROPERTY.tagline,
    ownerName: DEFAULT_PROPERTY.ownerName,
    ownerPhone: DEFAULT_PROPERTY.ownerPhone,
    ownerEmail: DEFAULT_PROPERTY.ownerEmail,
    address: DEFAULT_PROPERTY.address,
    totalFloors: 1,
    totalRooms: 0,
    googleMapsUrl: "",
    wifiName: "",
    wifiPassword: "",
  });

  // 4. Data Aturan & Kebijakan Sewa
  const [policies, setPolicies] = useState({
    billingCycle: "Tiap Tanggal 1 Awal Bulan",
    gracePeriodDays: 3,
    lateFeeAmount: 0,
    depositAmount: 0,
    visitingHoursEnd: "22:00 WIB",
    petPolicy: "Tidak diperbolehkan",
    smokingPolicy: "Hanya di balkon & area terbuka bersama",
    autoReminderWhatsapp: true,
  });
  const [propertySettingsId, setPropertySettingsId] = useState<string | null>(null);

  // Form State Tambah/Ubah Rekening Bank
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [formBankName, setFormBankName] = useState("Bank Central Asia (BCA)");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formAccountHolder, setFormAccountHolder] = useState(DEFAULT_PROPERTY.ownerName);
  const [formBranch, setFormBranch] = useState("");
  const [formIsPrimary, setFormIsPrimary] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [qrisPreviewUrl, setQrisPreviewUrl] = useState<string | null>(null);

  const bankOptions = [
    { label: "Bank Central Asia (BCA)", code: "BCA" },
    { label: "Bank Mandiri", code: "MNDR" },
    { label: "Bank Rakyat Indonesia (BRI)", code: "BRI" },
    { label: "Bank Negara Indonesia (BNI)", code: "BNI" },
    { label: "Bank Syariah Indonesia (BSI)", code: "BSI" },
    { label: "Bank Jago", code: "JAGO" },
    { label: "SeaBank", code: "SEABANK" },
  ];

  // Memuat data pengaturan dari database
  useEffect(() => {
    async function loadData() {
      try {
        const [accountsRes, settingsRes, propertyRes] = await Promise.all([
          supabase.from("bank_accounts").select("*").order("is_primary", { ascending: false }),
          supabase.from("payment_settings").select("*").limit(1).maybeSingle(),
          supabase.from("property_settings").select("*").limit(1).maybeSingle(),
        ]);
        if (accountsRes.error) throw accountsRes.error;
        if (settingsRes.error) throw settingsRes.error;

        setBankAccounts((accountsRes.data || []) as BankAccount[]);
        if (settingsRes.data) {
          setSettings(settingsRes.data as PaymentSettings);
          if (settingsRes.data.qris_image_url) {
            setQrisPreviewUrl(settingsRes.data.qris_image_url);
          }
        }

        // Jumlah kamar & lantai default diambil dari data kamar nyata
        const { data: roomRows } = await supabase.from("rooms").select("floor");
        if (roomRows && roomRows.length > 0) {
          const floors = new Set(roomRows.map((r: { floor: string | null }) => r.floor).filter(Boolean)).size;
          setPropertyProfile((prev) => ({ ...prev, totalRooms: roomRows.length, totalFloors: floors || prev.totalFloors }));
        }

        if (propertyRes.error) {
          onShowToast?.(
            `Profil properti & kebijakan belum bisa dimuat (${propertyRes.error.message}). Jalankan scripts/migrate-property-settings.mjs.`,
            "error"
          );
        } else if (propertyRes.data) {
          setPropertySettingsId(propertyRes.data.id);
          setPropertyProfile((prev) => ({ ...prev, ...(propertyRes.data.profile || {}) }));
          setPolicies((prev) => ({ ...prev, ...(propertyRes.data.policies || {}) }));
        }
      } catch (err: any) {
        console.error("Gagal memuat pengaturan pembayaran:", err);
        onShowToast?.(`Gagal memuat pengaturan pembayaran: ${err?.message || "kesalahan jaringan"}`, "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Salin nomor rekening bank
  const handleCopy = (acc: BankAccount) => {
    navigator.clipboard.writeText(acc.account_number.replace(/\D/g, ""));
    setCopiedId(acc.id);
    onShowToast?.(`Nomor rekening ${acc.bank_name} berhasil disalin!`, "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Atur rekening bank menjadi rekening utama (default)
  const handleSetPrimary = async (targetId: string) => {
    const reset = await supabase.from("bank_accounts").update({ is_primary: false }).neq("id", targetId);
    if (reset.error) {
      onShowToast?.(`Gagal memperbarui rekening utama: ${reset.error.message}`, "error");
      return;
    }
    const set = await supabase.from("bank_accounts").update({ is_primary: true }).eq("id", targetId);
    if (set.error) {
      onShowToast?.(`Gagal memperbarui rekening utama: ${set.error.message}`, "error");
      return;
    }
    setBankAccounts((prev) => prev.map((acc) => ({ ...acc, is_primary: acc.id === targetId })));
    onShowToast?.("Rekening utama berhasil diperbarui!", "success");
  };

  // Hapus rekening bank
  const handleDelete = async (targetId: string) => {
    const acc = bankAccounts.find((a) => a.id === targetId);
    if (!acc) return;
    if (acc.is_primary) {
      onShowToast?.("Rekening utama tidak dapat dihapus. Jadikan rekening lain sebagai utama terlebih dahulu.", "error");
      return;
    }

    const { error } = await supabase.from("bank_accounts").delete().eq("id", targetId);
    if (error) {
      onShowToast?.(`Gagal menghapus rekening: ${error.message}`, "error");
      return;
    }
    setBankAccounts((prev) => prev.filter((a) => a.id !== targetId));
    onShowToast?.(`Rekening ${acc.bank_name} telah dihapus.`, "info");
  };

  // Buka form edit rekening bank
  const handleEdit = (acc: BankAccount) => {
    setEditingAccountId(acc.id);
    setFormBankName(acc.bank_name);
    setFormAccountNumber(acc.account_number);
    setFormAccountHolder(acc.account_holder);
    setFormBranch(acc.branch || "");
    setFormIsPrimary(acc.is_primary);

    const formElement = document.getElementById("bank-account-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCancelForm = () => {
    setEditingAccountId(null);
    setFormAccountNumber("");
    setFormAccountHolder(DEFAULT_PROPERTY.ownerName);
    setFormBranch("");
    setFormIsPrimary(false);
  };

  // Simpan tambah / ubah rekening bank
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
        if (formIsPrimary) {
          const { error: resetError } = await supabase
            .from("bank_accounts")
            .update({ is_primary: false })
            .neq("id", editingAccountId);
          if (resetError) throw resetError;
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
        const makePrimary = formIsPrimary || bankAccounts.length === 0;
        if (makePrimary && bankAccounts.length > 0) {
          const { error: resetError } = await supabase
            .from("bank_accounts")
            .update({ is_primary: false })
            .eq("is_primary", true);
          if (resetError) throw resetError;
        }

        const { data, error } = await supabase
          .from("bank_accounts")
          .insert({
            bank_name: formBankName,
            bank_code: selectedBank.code,
            account_number: formAccountNumber,
            account_holder: formAccountHolder,
            branch: formBranch || null,
            is_primary: makePrimary,
            is_active: true,
          })
          .select()
          .single();
        if (error) throw error;

        setBankAccounts((prev) => [
          ...(makePrimary ? prev.map((a) => ({ ...a, is_primary: false })) : prev),
          data as BankAccount,
        ]);

        onShowToast?.(`Rekening ${formBankName} berhasil ditambahkan!`, "success");
      }

      handleCancelForm();
    } catch (err: any) {
      onShowToast?.(`Gagal menyimpan rekening bank: ${err?.message || "kesalahan jaringan"}`, "error");
    }
  };

  // Simpan seluruh konfigurasi pengaturan (QRIS, profil properti, kebijakan)
  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      const qrisPayload = {
        qris_merchant_name: settings.qris_merchant_name,
        qris_nmid: settings.qris_nmid,
        qris_city: settings.qris_city,
        qris_postal_code: settings.qris_postal_code,
        qris_is_active: settings.qris_is_active,
        updated_at: new Date().toISOString(),
      };
      const qrisRes = settings.id
        ? await supabase.from("payment_settings").update(qrisPayload).eq("id", settings.id).select().single()
        : await supabase.from("payment_settings").insert(qrisPayload).select().single();
      if (qrisRes.error) throw qrisRes.error;
      setSettings(qrisRes.data as PaymentSettings);

      const propertyPayload = {
        profile: propertyProfile,
        policies,
        updated_at: new Date().toISOString(),
      };
      const propertyRes = propertySettingsId
        ? await supabase.from("property_settings").update(propertyPayload).eq("id", propertySettingsId).select().single()
        : await supabase.from("property_settings").insert(propertyPayload).select().single();
      if (propertyRes.error) throw propertyRes.error;
      setPropertySettingsId(propertyRes.data.id);

      onShowToast?.("Semua pengaturan berhasil disimpan ke sistem!", "success");
    } catch (err: any) {
      onShowToast?.(`Gagal menyimpan pengaturan: ${err?.message || "kesalahan jaringan"}`, "error");
    } finally {
      setIsSavingAll(false);
    }
  };

  // Unggah gambar QRIS baru ke Storage lalu simpan URL-nya
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onShowToast?.("File harus berupa gambar (PNG / JPG).", "error");
      return;
    }

    const { publicUrl, error } = await uploadImageToStorage({ file, folder: "qris" });
    if (error || !publicUrl) {
      onShowToast?.(`Gagal mengunggah gambar QRIS: ${error?.message || "kesalahan tidak diketahui"}`, "error");
      return;
    }

    const payload = { qris_image_url: publicUrl, updated_at: new Date().toISOString() };
    const res = settings.id
      ? await supabase.from("payment_settings").update(payload).eq("id", settings.id).select().single()
      : await supabase.from("payment_settings").insert({ ...settings, ...payload }).select().single();
    if (res.error) {
      onShowToast?.(`Gambar terunggah tetapi gagal disimpan: ${res.error.message}`, "error");
      return;
    }
    setSettings(res.data as PaymentSettings);
    setQrisPreviewUrl(publicUrl);
    onShowToast?.("Gambar QRIS berhasil diperbarui!", "success");
  };

  // Helper badge warna bank
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Halaman: Judul, Deskripsi, dan Tombol Simpan Semua */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
            KONFIGURASI SISTEM •
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Pengaturan &amp; Saluran Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
            Kelola saluran rekening pembayaran, profil identitas properti, serta kebijakan penagihan &amp; sewa secara terpusat.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSavingAll}
          className="self-start sm:self-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isSavingAll ? "Menyimpan..." : "Simpan Semua Perubahan"}</span>
        </button>
      </div>

      {/* 2. Sub-Tab Navigator: 3 Kategori Pengaturan */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab("payment")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === "payment"
              ? "bg-[#4f46e5] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Rekening &amp; Pembayaran</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("property")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === "property"
              ? "bg-[#4f46e5] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Profil Properti &amp; Kos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("policies")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === "policies"
              ? "bg-[#4f46e5] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Kebijakan &amp; Aturan Sewa</span>
        </button>
      </div>

      {/* 3. KONTEN TAB 1: REKENING & SALURAN PEMBAYARAN */}
      {activeSubTab === "payment" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Konfigurasi QRIS Nasional (~5 kolom di lg) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-5">
            {/* Header Bagian QRIS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center border border-indigo-100">
                  <QrCode className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">QRIS Nasional</h2>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Saluran Aktif
              </span>
            </div>

            {/* Tampilan Visual Kartu QRIS Resmi */}
            <div className="bg-[#fcfcfd] rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs max-w-sm mx-auto font-sans relative overflow-hidden">
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

              {/* Area Gambar QR Code */}
              <div className="py-4 flex justify-center">
                {qrisPreviewUrl ? (
                  <img
                    src={qrisPreviewUrl}
                    alt="QRIS Kost Yusi"
                    className="w-48 h-48 object-contain rounded-xl border border-slate-100 p-2 bg-white shadow-2xs"
                  />
                ) : (
                  <div className="w-48 h-48 bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex flex-col items-center justify-center relative">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full text-slate-900 fill-current"
                    >
                      <rect x="5" y="5" width="26" height="26" rx="4" fill="currentColor" />
                      <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                      <rect x="13" y="13" width="10" height="10" fill="currentColor" />

                      <rect x="69" y="5" width="26" height="26" rx="4" fill="currentColor" />
                      <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                      <rect x="77" y="13" width="10" height="10" fill="currentColor" />

                      <rect x="5" y="69" width="26" height="26" rx="4" fill="currentColor" />
                      <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                      <rect x="13" y="77" width="10" height="10" fill="currentColor" />

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

              {/* Logo Pembayaran yang Didukung */}
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
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                    Livin'
                  </span>
                </div>
              </div>
            </div>

            {/* Dropzone Unggah Gambar QRIS */}
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
                Tarik gambar QRIS ke sini atau Klik untuk Unggah
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Format PNG atau JPG (Maks. 5 MB)
              </p>
            </div>

            {/* Tombol Aksi QRIS */}
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
                  onShowToast?.("Gambar QRIS resmi Kost Yusi siap diunduh.", "info");
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Rekening Bank Resmi (~7 kolom di lg) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Box Daftar Rekening Bank */}
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
                      Daftar rekening tujuan transfer sewa yang tampil di aplikasi penghuni &amp; invoice
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
                  className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Tambah Rekening</span>
                </button>
              </div>

              {/* Banner Informasi Penerima Rekening */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
                <Megaphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px] sm:text-xs">
                  Semua rekening di bawah ini tercatat atas nama <strong>Arifa Andya Nafiisa (Pemilik Kos)</strong> dan otomatis diverifikasi saat penghuni mengunggah bukti bayar.
                </p>
              </div>

              {/* Daftar Rekening Bank */}
              <div className="space-y-3 pt-1">
                {bankAccounts.map((acc) => {
                  const badge = getBankBadge(acc.bank_code);
                  const isCopied = copiedId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className={`rounded-2xl p-4 transition-all border ${
                        acc.is_primary
                          ? "bg-white border-blue-300 ring-2 ring-blue-500/10 shadow-sm"
                          : "bg-white border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
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

                        {/* Tombol Aksi Rekening */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {acc.is_primary ? (
                            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold select-none">
                              Utama
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(acc.id)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition cursor-pointer"
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

            {/* Form Tambah / Edit Rekening Bank */}
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
                  Semua kolom wajib diisi
                </span>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-3.5">
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
                        placeholder="Contoh: 8420193821"
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

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Pemilik Rekening (Sesuai Buku Tabungan)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Arifa Andya Nafiisa"
                    value={formAccountHolder}
                    onChange={(e) => setFormAccountHolder(e.target.value)}
                    className="w-full bg-white rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kantor Cabang (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: KCU Wisma Asri / KC Malang"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full bg-white rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <label className="flex items-center gap-2.5 pt-1 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPrimary}
                    onChange={(e) => setFormIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-[#4f46e5] rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Jadikan sebagai rekening tujuan utama (default pada invoice)</span>
                </label>

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
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Rekening</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. KONTEN TAB 2: PROFIL PROPERTI & KONTAK KOS */}
      {activeSubTab === "property" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Identitas Properti &amp; Kontak Pengelola
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Informasi ini ditampilkan di aplikasi penghuni, kuitansi resmi, dan pengumuman kos
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Properti Aktif
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveAll();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Properti Kos
                </label>
                <input
                  type="text"
                  value={propertyProfile.propertyName}
                  onChange={(e) => setPropertyProfile({ ...propertyProfile, propertyName: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tagline / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={propertyProfile.tagline}
                  onChange={(e) => setPropertyProfile({ ...propertyProfile, tagline: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pemilik Properti
                </label>
                <input
                  type="text"
                  value={propertyProfile.ownerName}
                  onChange={(e) => setPropertyProfile({ ...propertyProfile, ownerName: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp Pengelola
                </label>
                <input
                  type="text"
                  value={propertyProfile.ownerPhone}
                  onChange={(e) => setPropertyProfile({ ...propertyProfile, ownerPhone: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Resmi Properti
                </label>
                <input
                  type="email"
                  value={propertyProfile.ownerEmail}
                  onChange={(e) => setPropertyProfile({ ...propertyProfile, ownerEmail: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Lengkap Kos
              </label>
              <textarea
                rows={2}
                value={propertyProfile.address}
                onChange={(e) => setPropertyProfile({ ...propertyProfile, address: e.target.value })}
                className="w-full bg-slate-50 rounded-xl p-3 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Lantai
                </label>
                <input
                  type="number"
                  value={propertyProfile.totalFloors}
                  onChange={(e) => setPropertyProfile({ ...propertyProfile, totalFloors: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Unit Kamar
                </label>
                <input
                  type="number"
                  value={propertyProfile.totalRooms}
                  onChange={(e) => setPropertyProfile({ ...propertyProfile, totalRooms: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Wi-Fi (SSID)</label>
                <input
                  type="text"
                  value={propertyProfile.wifiName}
                  onChange={(e) => setPropertyProfile({ ...propertyProfile, wifiName: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Wi-Fi</label>
                <input
                  type="text"
                  value={propertyProfile.wifiPassword}
                  onChange={(e) => setPropertyProfile({ ...propertyProfile, wifiPassword: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Profil Properti</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. KONTEN TAB 3: KEBIJAKAN & ATURAN SEWA */}
      {activeSubTab === "policies" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kebijakan Penagihan &amp; Ketentuan Tinggal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasi siklus jatuh tempo sewa, toleransi keterlambatan, dan tata tertib penghuni
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Kebijakan Aktif
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveAll();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Siklus Penagihan Bulanan
                </label>
                <select
                  value={policies.billingCycle}
                  onChange={(e) => setPolicies({ ...policies, billingCycle: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer font-semibold"
                >
                  <option value="Tiap Tanggal 1 Awal Bulan">Tiap Tanggal 1 Awal Bulan</option>
                  <option value="Fleksibel Sesuai Tanggal Masuk">Fleksibel Sesuai Tanggal Masuk (Check-In)</option>
                  <option value="Tiap Tanggal 10">Tiap Tanggal 10</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Masa Tenggang Keterlambatan (Hari)
                </label>
                <input
                  type="number"
                  value={policies.gracePeriodDays}
                  onChange={(e) => setPolicies({ ...policies, gracePeriodDays: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Hari toleransi setelah jatuh tempo sebelum denda otomatis berlaku
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Denda Keterlambatan (Rp)
                </label>
                <input
                  type="number"
                  step={10000}
                  value={policies.lateFeeAmount}
                  onChange={(e) => setPolicies({ ...policies, lateFeeAmount: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deposit Jaminan Kamar (Rp)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={policies.depositAmount}
                  onChange={(e) => setPolicies({ ...policies, depositAmount: Number(e.target.value) })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jam Malam Kunjungan Tamu
                </label>
                <input
                  type="text"
                  value={policies.visitingHoursEnd}
                  onChange={(e) => setPolicies({ ...policies, visitingHoursEnd: e.target.value })}
                  placeholder="22:00 WIB"
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aturan Hewan Peliharaan
                </label>
                <select
                  value={policies.petPolicy}
                  onChange={(e) => setPolicies({ ...policies, petPolicy: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="Tidak diperbolehkan">Tidak Diperbolehkan</option>
                  <option value="Hanya hewan kecil (kucing/hamster)">Hanya Hewan Kecil</option>
                  <option value="Diperbolehkan dengan izin">Diperbolehkan dengan Izin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aturan Merokok
                </label>
                <select
                  value={policies.smokingPolicy}
                  onChange={(e) => setPolicies({ ...policies, smokingPolicy: e.target.value })}
                  className="w-full bg-slate-50 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 border border-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="Hanya di balkon & area terbuka bersama">Hanya di Balkon / Area Terbuka</option>
                  <option value="Dilarang merokok di seluruh area kos">Dilarang di Seluruh Area Kos</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={policies.autoReminderWhatsapp}
                  onChange={(e) => setPolicies({ ...policies, autoReminderWhatsapp: e.target.checked })}
                  className="w-4 h-4 text-[#4f46e5] rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Kirimkan pengingat otomatis via WhatsApp H-3 dan Hari-H jatuh tempo</span>
              </label>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Kebijakan Sewa</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
