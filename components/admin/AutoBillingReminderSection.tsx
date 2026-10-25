"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Check,
  Cpu,
  Moon,
  Ban,
  MessageSquare,
  Smartphone,
  Phone,
  Video,
  Send,
  Sparkles,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  Play,
  History,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Eye,
  Copy,
  Info,
  Calendar,
  User,
  Search,
  Filter,
  CheckCheck,
  Share2,
} from "lucide-react";
import { AutoReminderSettings, ReminderCadenceStep } from "@/types/reminder";
import { createClient } from "@/lib/supabase/client";
import { billingService } from "@/modules/billing/services/billingService";
import { DEFAULT_PROPERTY } from "@/lib/constants";

interface AutoBillingReminderSectionProps {
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

// Preset gaya bahasa pesan
interface TonePreset {
  id: string;
  name: string;
  description: string;
  template: string;
}

// Riwayat pengiriman pengingat
interface DeliveryLog {
  id: string;
  recipient_name: string;
  room_number: string;
  phone_number: string;
  step_code: string;
  sent_at: string;
  status: "read" | "delivered" | "paid" | "failed";
  amount: number;
}

// Penerima untuk simulasi pratinjau pesan (diambil dari tagihan nyata)
interface MockRecipient {
  name: string;
  room: string;
  amount: number;
  dueDate: string;
  period: string;
  phone: string;
}

// Tahapan pengingat bawaan, hanya dimasukkan ke database saat pengelola menekan "Buat Tahapan Bawaan"
const DEFAULT_CADENCE_STEPS: Omit<ReminderCadenceStep, "id">[] = [
  {
    step_code: "H-7",
    title: "Pemberitahuan Tagihan Terbit",
    badge_text: "Awal Siklus",
    description:
      "Memberi tahu penghuni bahwa invoice periode baru siap dicek & dibayarkan secara santai.",
    scheduled_time: "Pukul 09:00 WIB",
    is_active: true,
    template_message:
      "Halo kak {nama} ({kamar}), invoice sewa kos di {nama_kos} periode {periode} sebesar {nominal} telah terbit. Jatuh tempo: {jatuh_tempo}. Bayar di: {link_pembayaran}. Terima kasih! 🙏",
    sort_order: 1,
  },
  {
    step_code: "H-3",
    title: "Pengingat Awal Bersahabat",
    badge_text: "Dipilih di Editor",
    description:
      "Mengingatkan penghuni untuk menyiapkan saldo pembayaran sebelum jatuh tempo mendekat.",
    scheduled_time: "Pukul 09:00 WIB",
    is_active: true,
    template_message:
      "Halo kak {nama} ({kamar}), sekadar mengingatkan tagihan sewa kos di {nama_kos} periode {periode} sebesar {nominal} akan jatuh tempo pada {jatuh_tempo}. Mohon lakukan pembayaran melalui tautan berikut: {link_pembayaran}. Terima kasih! 🙏",
    sort_order: 2,
  },
  {
    step_code: "H-1",
    title: "Pengingat Batas Akhir Besok",
    badge_text: "Penting",
    description:
      "Penegasan tanggal pembayaran sebelum terkena sanksi atau administrasi denda keterlambatan.",
    scheduled_time: "Pukul 10:00 WIB",
    is_active: true,
    template_message:
      "Halo kak {nama} ({kamar}), besok ({jatuh_tempo}) adalah batas akhir pembayaran sewa kamar {kamar} sebesar {nominal}. Mohon segera bayar via {link_pembayaran} agar terhindar dari denda. Terima kasih!",
    sort_order: 3,
  },
  {
    step_code: "Hari-H",
    title: "Peringatan Jatuh Tempo Hari Ini",
    badge_text: "Mendesak",
    description:
      "Notifikasi urgent batas pelunasan tagihan sewa kos adalah hari ini sebelum pukul 23:59 WIB.",
    scheduled_time: "Pukul 08:30 WIB",
    is_active: true,
    template_message:
      "PENTING: Halo kak {nama}, hari ini adalah JATUH TEMPO pembayaran sewa {kamar} ({nominal}). Batas pelunasan sebelum pukul 23:59 WIB. Bayar sekarang: {link_pembayaran}. Terima kasih!",
    sort_order: 4,
  },
  {
    step_code: "H+1",
    title: "Penagihan Keterlambatan & Informasi Denda",
    badge_text: "Tertunggak",
    description:
      "Penegasan akumulasi denda sewa kos harian dan instruksi pelunasan segera.",
    scheduled_time: "Kirim setiap 2 hari sekali",
    is_active: true,
    template_message:
      "PERINGATAN: Halo kak {nama}, pembayaran sewa {kamar} telah melewati jatuh tempo ({jatuh_tempo}). Denda harian telah diakumulasikan. Total tagihan saat ini: {nominal}. Harap segera lunasi di: {link_pembayaran}.",
    sort_order: 5,
  },
];

// Contoh penerima jika belum ada tagihan aktif, hanya untuk pratinjau template
const SAMPLE_RECIPIENT: MockRecipient = {
  name: "Nama Penghuni",
  room: "Kamar X-00",
  amount: 0,
  dueDate: "tanggal jatuh tempo",
  period: "periode tagihan",
  phone: "",
};

export const AutoBillingReminderSection: React.FC<AutoBillingReminderSectionProps> = ({
  onShowToast,
}) => {
  const supabase = createClient();

  // Sub Tab Halaman: "cadence" (Jadwal & Editor), "logs" (Riwayat Pengiriman), "policies" (Aturan & Keamanan)
  const [activeMainTab, setActiveMainTab] = useState<"cadence" | "logs" | "policies">("cadence");

  // Settings State
  const [settings, setSettings] = useState<AutoReminderSettings>({
    engine_active: true,
    next_schedule: "",
    quiet_hours_enabled: true,
    quiet_hours_start: "21:00",
    quiet_hours_end: "08:00",
    stop_on_payment: true,
    denda_repeat_days: 2,
  });

  // Cadence steps state
  const [steps, setSteps] = useState<ReminderCadenceStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recipients, setRecipients] = useState<MockRecipient[]>([]);
  const [primaryBank, setPrimaryBank] = useState<string>("");

  // Editor State
  const [activeEditorTab, setActiveEditorTab] = useState("H-3");
  const [currentTemplateText, setCurrentTemplateText] = useState("");
  const [previewPlatform, setPreviewPlatform] = useState<"whatsapp" | "push">("whatsapp");
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningEngine, setIsRunningEngine] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Penerima simulasi diambil dari tagihan yang belum lunas
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);
  const mockRecipients: MockRecipient[] = recipients.length > 0 ? recipients : [SAMPLE_RECIPIENT];
  const selectedRecipient = mockRecipients[selectedRecipientIndex] ?? mockRecipients[0];

  // Riwayat pengiriman: belum ada mesin pengirim WhatsApp otomatis, jadi belum ada log tersimpan
  const deliveryLogs: DeliveryLog[] = [];

  // Log filter
  const [logFilterStatus, setLogFilterStatus] = useState<string>("all");
  const [logSearchQuery, setLogSearchQuery] = useState<string>("");

  // Muat pengaturan, tahapan, rekening utama, dan calon penerima dari database
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settsRes, stepsRes, bankRes, bills] = await Promise.all([
        supabase.from("auto_reminder_settings").select("*").limit(1).maybeSingle(),
        supabase.from("reminder_cadence_steps").select("*").order("sort_order", { ascending: true }),
        supabase.from("bank_accounts").select("*").eq("is_primary", true).limit(1).maybeSingle(),
        billingService.getBills("all"),
      ]);
      if (settsRes.error) throw settsRes.error;
      if (stepsRes.error) throw stepsRes.error;

      if (settsRes.data) setSettings(settsRes.data as AutoReminderSettings);

      const stepList = (stepsRes.data || []) as ReminderCadenceStep[];
      setSteps(stepList);
      const editorStep = stepList.find((s) => s.step_code === "H-3") || stepList[0];
      if (editorStep) {
        setActiveEditorTab(editorStep.step_code);
        setCurrentTemplateText(editorStep.template_message);
      }

      if (bankRes.data) {
        setPrimaryBank(`${bankRes.data.bank_name} ${bankRes.data.account_number} a.n ${bankRes.data.account_holder}`);
      }

      setRecipients(
        bills
          .filter((b) => ["unpaid", "belum_bayar", "overdue", "terlambat"].includes(b.status))
          .map((b) => ({
            name: b.tenant_name,
            room: `Kamar ${b.room_number}`,
            amount: Number(b.amount || 0) + Number(b.fine_amount || 0),
            dueDate: b.due_date
              ? new Date(b.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
              : "-",
            period: b.period,
            phone: b.tenant_phone || "",
          }))
      );
    } catch (err: any) {
      console.error("Gagal memuat pengaturan pengingat:", err);
      onShowToast?.(`Gagal memuat pengaturan pengingat: ${err?.message || "kesalahan jaringan"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Isi tahapan bawaan ke database (hanya jika belum ada tahapan)
  const handleSeedDefaultSteps = async () => {
    const { error } = await supabase.from("reminder_cadence_steps").insert(DEFAULT_CADENCE_STEPS);
    if (error) {
      onShowToast?.(`Gagal membuat tahapan bawaan: ${error.message}`, "error");
      return;
    }
    await loadData();
    onShowToast?.("Tahapan pengingat bawaan berhasil dibuat.", "success");
  };

  // Handle Tab Switch in Editor
  const handleSelectEditorTab = (tabCode: string) => {
    setActiveEditorTab(tabCode);
    const target = steps.find((s) => s.step_code === tabCode);
    if (target) {
      setCurrentTemplateText(target.template_message);
    }
  };

  // Insert Variable into Message
  const handleInsertVariable = (variable: string) => {
    setCurrentTemplateText((prev) => prev + ` ${variable}`);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  // Toggle Cadence Step (disimpan ke database)
  const handleToggleStep = async (stepCode: string) => {
    const target = steps.find((s) => s.step_code === stepCode);
    if (!target) return;
    const next = !target.is_active;
    const { error } = await supabase
      .from("reminder_cadence_steps")
      .update({ is_active: next, updated_at: new Date().toISOString() })
      .eq("id", target.id);
    if (error) {
      onShowToast?.(`Gagal mengubah tahapan ${stepCode}: ${error.message}`, "error");
      return;
    }
    setSteps((prev) => prev.map((s) => (s.step_code === stepCode ? { ...s, is_active: next } : s)));
    onShowToast?.(`Tahapan ${stepCode} sekarang ${next ? "Diaktifkan" : "Dinonaktifkan"}.`, "info");
  };

  // Tone Presets for current step
  const tonePresets: TonePreset[] = [
    {
      id: "friendly",
      name: "Ramah & Santun",
      description: "Cocok untuk pengingat awal agar tidak terasa menekan",
      template:
        "Halo kak {nama} ({kamar}), sekadar mengingatkan tagihan sewa kos di {nama_kos} periode {periode} sebesar {nominal} akan jatuh tempo pada {jatuh_tempo}. Mohon lakukan pembayaran melalui tautan berikut: {link_pembayaran}. Terima kasih banyak! 🙏",
    },
    {
      id: "formal",
      name: "Formal & Tertib",
      description: "Format surat resmi pemberitahuan tagihan sewa kamar",
      template:
        "Yth. Sdr/i {nama} ({kamar}), kami informasikan bahwa invoice sewa {nama_kos} periode {periode} senilai {nominal} telah diterbitkan dengan batas jatuh tempo {jatuh_tempo}. Pembayaran resmi dapat diakses via: {link_pembayaran}. Hormat kami, {pemilik_kos}.",
    },
    {
      id: "urgent",
      name: "Tegas & Ringkas",
      description: "Cocok untuk Hari-H atau H+1 yang butuh respon segera",
      template:
        "PENTING: Halo kak {nama}, batas pembayaran sewa kamar {kamar} ({nominal}) adalah {jatuh_tempo}. Mohon segera lakukan penyelesaian sebelum denda diakumulasikan via: {link_pembayaran}. Terima kasih.",
    },
  ];

  // Save Settings to Supabase
  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    try {
      const payload = {
        quiet_hours_enabled: settings.quiet_hours_enabled,
        stop_on_payment: settings.stop_on_payment,
        denda_repeat_days: settings.denda_repeat_days,
        updated_at: new Date().toISOString(),
      };
      const settingsRes = settings.id
        ? await supabase.from("auto_reminder_settings").update(payload).eq("id", settings.id).select().single()
        : await supabase.from("auto_reminder_settings").insert({ ...settings, ...payload }).select().single();
      if (settingsRes.error) throw settingsRes.error;
      setSettings(settingsRes.data as AutoReminderSettings);

      const activeStep = steps.find((s) => s.step_code === activeEditorTab);
      if (activeStep) {
        const { error } = await supabase
          .from("reminder_cadence_steps")
          .update({ template_message: currentTemplateText, updated_at: new Date().toISOString() })
          .eq("id", activeStep.id);
        if (error) throw error;
        setSteps((prev) =>
          prev.map((s) => (s.id === activeStep.id ? { ...s, template_message: currentTemplateText } : s))
        );
      }

      onShowToast?.("Pengaturan pengingat otomatis & template pesan berhasil disimpan!", "success");
    } catch (err: any) {
      onShowToast?.(`Gagal menyimpan pengaturan pengingat: ${err?.message || "kesalahan jaringan"}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Mesin pengirim WhatsApp otomatis belum tersambung: tampilkan jumlah penerima yang sebenarnya
  const handleRunEngineNow = () => {
    onShowToast?.(
      `Pengiriman otomatis belum aktif (belum ada layanan WhatsApp). ${recipients.length} penghuni memiliki tagihan belum lunas, kirim manual lewat tombol uji coba WhatsApp.`,
      "info"
    );
  };

  // Dynamic preview generator replacing variables with realistic mock data
  const generatedPreviewMessage = currentTemplateText
    .replace(/\{nama\}/g, selectedRecipient.name)
    .replace(/\{kamar\}/g, selectedRecipient.room)
    .replace(/\{nominal\}/g, `Rp ${selectedRecipient.amount.toLocaleString("id-ID")}`)
    .replace(/\{jatuh_tempo\}/g, selectedRecipient.dueDate)
    .replace(/\{periode\}/g, selectedRecipient.period)
    .replace(/\{link_pembayaran\}/g, (typeof window !== "undefined" ? `${window.location.origin}/tenant/pay` : "/tenant/pay"))
    .replace(/\{nama_kos\}/g, DEFAULT_PROPERTY.name)
    .replace(/\{pemilik_kos\}/g, DEFAULT_PROPERTY.ownerName)
    .replace(/\{rekening_tujuan\}/g, primaryBank || "(rekening utama belum diatur)");

  const activeCount = steps.filter((s) => s.is_active).length;

  // Filtered Logs
  const filteredLogs = deliveryLogs.filter((log) => {
    const matchStatus = logFilterStatus === "all" || log.status === logFilterStatus;
    const matchSearch =
      log.recipient_name.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.room_number.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.phone_number.includes(logSearchQuery);
    return matchStatus && matchSearch;
  });

  // Open Direct WhatsApp Test
  const handleOpenWhatsAppTest = () => {
    const cleanPhone = testPhoneNumber.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    const encodedText = encodeURIComponent(generatedPreviewMessage);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    window.open(waUrl, "_blank");
    setShowTestModal(false);
    onShowToast?.("Membuka WhatsApp untuk mengirim pesan uji coba...", "info");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman & Tombol Aksi Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tagihan Otomatis & Pengingat WhatsApp
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              PENGIRIM WA BELUM TERSAMBUNG
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 max-w-2xl leading-relaxed">
            Kirim notifikasi tagihan sewa, invoice digital, dan peringatan jatuh tempo otomatis
            melalui WhatsApp resmi tanpa repot menagih manual satu per satu.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Tombol Jalankan Engine Manual */}
          <button
            type="button"
            onClick={handleRunEngineNow}
            disabled={isRunningEngine}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer active:scale-95"
            title="Proses antrean pesan hari ini sekarang juga"
          >
            <Play className={`w-4 h-4 text-emerald-600 ${isRunningEngine ? "animate-spin" : ""}`} />
            <span>{isRunningEngine ? "Memproses..." : "Jalankan Engine Sekarang"}</span>
          </button>

          {/* Tombol Simpan Pengaturan */}
          <button
            type="button"
            onClick={handleSaveAllSettings}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Interactive KPI Stat Cards (Unified Palette) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Engine Status */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-3.5 hover:border-emerald-200 transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              STATUS ENGINE
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Belum Aktif
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5 truncate">
              Layanan WhatsApp belum dikonfigurasi
            </p>
          </div>
        </div>

        {/* Card 2: Tahapan Cadence */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-3.5 hover:border-indigo-200 transition">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center border border-indigo-200/80 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              TAHAPAN CADENCE
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {activeCount} / {steps.length} Aktif
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              H-7 hingga H+1 Denda
            </p>
          </div>
        </div>

        {/* Card 3: Antrean Pengiriman */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-3.5 hover:border-blue-200 transition">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/80 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              CALON PENERIMA
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {recipients.length} Penerima
            </h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5 truncate">
              Tagihan belum lunas saat ini
            </p>
          </div>
        </div>

        {/* Card 4: Tingkat Ketepatan */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center gap-3.5 hover:border-amber-200 transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              TAGIHAN TERKIRIM
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              0
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
              Belum ada pengiriman otomatis
            </p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveMainTab("cadence")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeMainTab === "cadence"
              ? "bg-[#4f46e5] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Jadwal & Template Pesan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("logs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeMainTab === "logs"
              ? "bg-[#4f46e5] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Pengiriman Pesan</span>
          <span
            className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
              activeMainTab === "logs" ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-700"
            }`}
          >
            {deliveryLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("policies")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeMainTab === "policies"
              ? "bg-[#4f46e5] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Kebijakan & Jam Tenang</span>
        </button>
      </div>

      {/* TAB 1: CADENCE & EDITOR */}
      {activeMainTab === "cadence" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Cadence Steps (~6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Box: Jadwal Pengiriman Tagihan (Cadence) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center border border-indigo-100">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      Tahapan Pengingat Tagihan (Cadence)
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Klik salah satu tahapan untuk mengedit template dan melihat simulasi pratinjau.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 shrink-0">
                  {activeCount} Aktif
                </span>
              </div>

              {/* Cadence Steps List */}
              <div className="space-y-3">
                {!isLoading && steps.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <p className="text-xs font-semibold text-slate-700">Belum ada tahapan pengingat tersimpan.</p>
                    <button
                      type="button"
                      onClick={handleSeedDefaultSteps}
                      className="mt-3 px-4 py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Buat Tahapan Bawaan
                    </button>
                  </div>
                )}
                {steps.map((step) => {
                  const isSelectedInEditor = activeEditorTab === step.step_code;

                  // Semantic badge colors per step
                  const stepBadgeStyles =
                    step.step_code === "Hari-H"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : step.step_code === "H+1"
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : step.step_code === "H-1"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : step.step_code === "H-3"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-sky-50 text-sky-700 border-sky-200";

                  return (
                    <div
                      key={step.id}
                      onClick={() => handleSelectEditorTab(step.step_code)}
                      className={`rounded-2xl p-4 transition-all border cursor-pointer select-none ${
                        isSelectedInEditor
                          ? "bg-[#f8faff] border-[#4f46e5] ring-2 ring-indigo-500/15 shadow-sm"
                          : "bg-white border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Step Pill */}
                          <div
                            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black text-xs shrink-0 border ${stepBadgeStyles}`}
                          >
                            <span>{step.step_code}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                                {step.title}
                              </h3>
                              {isSelectedInEditor && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider">
                                  Sedang Diedit
                                </span>
                              )}
                              {!step.is_active && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold">
                                  Nonaktif
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                              {step.description}
                            </p>

                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 pt-1">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Waktu: {step.scheduled_time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStep(step.step_code);
                          }}
                          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                            step.is_active ? "bg-[#4f46e5]" : "bg-slate-200"
                          }`}
                          title={step.is_active ? "Nonaktifkan tahapan ini" : "Aktifkan tahapan ini"}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                              step.is_active ? "translate-x-5.5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Sub-option khusus H+1 Denda */}
                      {step.step_code === "H+1" && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <span className="text-[11px] text-slate-600 font-medium">
                            Frekuensi Pengulangan Pengingat Denda:
                          </span>
                          <select
                            value={settings.denda_repeat_days}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                denda_repeat_days: Number(e.target.value),
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value={1}>Setiap 1 hari sekali</option>
                            <option value={2}>Setiap 2 hari sekali (Direkomendasikan)</option>
                            <option value={3}>Setiap 3 hari sekali</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Tips Pengingat Otomatis */}
            <div className="bg-[#f8faff] rounded-2xl p-4 border border-indigo-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1">
                <h4 className="font-bold text-slate-900">Tips Efektivitas Pengingat:</h4>
                <p className="leading-relaxed">
                  Pengingat di waktu pagi (pukul 09:00 WIB) terbukti menghasilkan tingkat pembayaran
                  langsung <strong>35% lebih tinggi</strong> dibanding penagihan pada sore atau malam
                  hari.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Template Editor & WhatsApp Mockup (~6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Box: Editor Template Pesan */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Editor Template Pesan WhatsApp
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Menyesuaikan konten pesan untuk tahapan:{" "}
                    <strong className="text-indigo-600">{activeEditorTab}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTestModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Uji Coba WA</span>
                </button>
              </div>

              {/* Selector Tahapan Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {steps.map((s) => {
                  const isActive = activeEditorTab === s.step_code;
                  return (
                    <button
                      key={s.step_code}
                      type="button"
                      onClick={() => handleSelectEditorTab(s.step_code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? "bg-[#4f46e5] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {s.step_code}
                    </button>
                  );
                })}
              </div>

              {/* Pilihan Gaya Bahasa (Tone Presets) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  PILIHAN GAYA BAHASA (PRESET):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {tonePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setCurrentTemplateText(preset.template)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition cursor-pointer group"
                    >
                      <h5 className="text-[11px] font-bold text-slate-800 group-hover:text-indigo-600 truncate">
                        {preset.name}
                      </h5>
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Dynamic Variables */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    VARIABEL DINAMIS TERSEDIA
                  </span>
                  <span className="text-[10px] text-indigo-600 font-medium">
                    {copiedVar ? `Disisipkan: ${copiedVar} ✓` : "Klik tag untuk menyisipkan"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: "{nama}", label: "Nama Penghuni" },
                    { tag: "{kamar}", label: "Kamar" },
                    { tag: "{nominal}", label: "Total Tagihan" },
                    { tag: "{jatuh_tempo}", label: "Jatuh Tempo" },
                    { tag: "{periode}", label: "Bulan Sewa" },
                    { tag: "{link_pembayaran}", label: "Link Bayar" },
                    { tag: "{nama_kos}", label: "Nama Kos" },
                    { tag: "{pemilik_kos}", label: "Nama Pemilik" },
                    { tag: "{rekening_tujuan}", label: "Rekening Bank" },
                  ].map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleInsertVariable(v.tag)}
                      title={`Sisipkan ${v.label}`}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] text-xs font-mono font-medium border border-indigo-200/60 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>{v.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Editor */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Isi Konten Pesan
                </label>
                <textarea
                  rows={5}
                  value={currentTemplateText}
                  onChange={(e) => setCurrentTemplateText(e.target.value)}
                  className="w-full text-xs text-slate-800 p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans shadow-xs resize-y"
                  placeholder="Ketik isi pesan WhatsApp di sini..."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>
                    {currentTemplateText.length} karakter •{" "}
                    {Math.ceil(currentTemplateText.length / 160)} Bagian Pesan
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const def = steps.find((s) => s.step_code === activeEditorTab);
                      if (def) setCurrentTemplateText(def.template_message);
                    }}
                    className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Kembalikan ke Default</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Box: Simulator Pratinjau Smartphone */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4.5 h-4.5 text-[#4f46e5]" />
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                      Simulator Smartphone
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Tampilan visual persis seperti di ponsel penghuni
                    </p>
                  </div>
                </div>

                {/* Tabs WhatsApp vs Push Notif */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform("whatsapp")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      previewPlatform === "whatsapp"
                        ? "bg-white text-emerald-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPlatform("push")}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                      previewPlatform === "push"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Push Notif
                  </button>
                </div>
              </div>

              {/* Selector Calon Penerima untuk Uji Variabel */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Simulasi Penerima:
                </span>
                <select
                  value={selectedRecipientIndex}
                  onChange={(e) => setSelectedRecipientIndex(Number(e.target.value))}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  {mockRecipients.map((rec, idx) => (
                    <option key={idx} value={idx}>
                      {rec.name} ({rec.room} • Rp {rec.amount.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              {/* WhatsApp Phone Mockup Frame */}
              {previewPlatform === "whatsapp" ? (
                <div className="bg-[#efeae2] rounded-3xl overflow-hidden border border-slate-300 shadow-sm font-sans max-w-sm mx-auto">
                  {/* WhatsApp Header */}
                  <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-400">
                        KY
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold leading-tight">Kost Yusi Official</h4>
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black">
                            ✓
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-200">
                          {DEFAULT_PROPERTY.ownerName || "Arifa Andya Nafiisa"} • Akun Bisnis
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-white/90">
                      <Video className="w-4 h-4" />
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Chat Wallpaper Container */}
                  <div className="p-4 space-y-3 min-h-[240px] flex flex-col justify-between">
                    {/* Date Pill */}
                    <div className="text-center">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/85 shadow-2xs text-[10px] text-slate-600 font-medium">
                        Hari Ini • 09:00 WIB
                      </span>
                    </div>

                    {/* Chat Bubble */}
                    <div className="self-start max-w-[95%] bg-[#d9fdd3] rounded-2xl rounded-tl-none p-3.5 shadow-2xs text-xs text-slate-800 space-y-2.5">
                      <p className="leading-relaxed whitespace-pre-wrap font-sans text-[11px] sm:text-xs">
                        {generatedPreviewMessage}
                      </p>

                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                        <span>09:01</span>
                        <span className="text-blue-500 font-bold flex items-center">
                          <CheckCheck className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      {/* Interactive Button In Chat */}
                      <div className="pt-2 border-t border-emerald-200/80">
                        <button
                          type="button"
                          onClick={() => {
                            window.open("/tenant/bills", "_blank");
                          }}
                          className="w-full py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                          <span>💳 Bayar & Lihat Tagihan Online</span>
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      </div>
                    </div>

                    {/* Dummy Input Bar */}
                    <div className="bg-white rounded-full p-2 flex items-center justify-between text-xs text-slate-400 shadow-2xs">
                      <span className="pl-3 text-[11px]">Ketik pesan balasan...</span>
                      <div className="w-7 h-7 rounded-full bg-[#128c7e] text-white flex items-center justify-center shadow-xs">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Push Notification Mockup */
                <div className="bg-slate-900 rounded-3xl p-5 text-white max-w-sm mx-auto shadow-md space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span>Notifikasi Layar Kunci</span>
                    <span>Baru Saja</span>
                  </div>

                  <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white text-[10px] font-bold">
                        KY
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">Kost Yusi Management</h4>
                        <span className="text-[10px] text-slate-400">Pengingat Tagihan Sewa</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {generatedPreviewMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT LOG PENGIRIMAN PESAN */}
      {activeMainTab === "logs" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Riwayat Pengiriman Pesan WhatsApp Otomatis
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Memantau status pengiriman pesan, waktu diterima, dan respon pelunasan dari penghuni
              </p>
            </div>

            {/* Filter Status & Search */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari penghuni, kamar..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-44"
                />
              </div>

              <select
                value={logFilterStatus}
                onChange={(e) => setLogFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="read">Dibaca</option>
                <option value="delivered">Terkirim</option>
                <option value="paid">Lunas</option>
              </select>
            </div>
          </div>

          {/* Table Riwayat Pengiriman */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Penerima & Kamar</th>
                  <th className="py-3 px-4">Nomor WhatsApp</th>
                  <th className="py-3 px-4">Tahapan Pengingat</th>
                  <th className="py-3 px-4">Nominal Tagihan</th>
                  <th className="py-3 px-4">Waktu Terkirim</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                      Belum ada riwayat pengiriman. Pengiriman otomatis WhatsApp belum tersambung.
                    </td>
                  </tr>
                )}
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.recipient_name}</div>
                      <div className="text-[11px] text-slate-400">{log.room_number}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{log.phone_number}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                        {log.step_code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      Rp {log.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{log.sent_at}</td>
                    <td className="py-3 px-4">
                      {log.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Langsung Lunas
                        </span>
                      ) : log.status === "read" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          <CheckCheck className="w-3 h-3 text-blue-500" /> Dibaca
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          <Check className="w-3 h-3" /> Terkirim
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const waUrl = `https://wa.me/${log.phone_number.replace(/[^0-9]/g, "")}`;
                          window.open(waUrl, "_blank");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200 transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> Chat WA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: KEBIJAKAN & JAM TENANG */}
      {activeMainTab === "policies" && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-6 max-w-4xl">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Kebijakan Etika & Keamanan Pengiriman Pesan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Menjaga kenyamanan penghuni agar tidak terganggu di waktu istirahat dan mencegah
              pengiriman tagihan yang sudah terselesaikan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kebijakan 1: Jam Tenang */}
            <div className="bg-[#fcfdfd] border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-amber-200 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                    <Moon className="w-5 h-5" />
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.quiet_hours_enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, quiet_hours_enabled: e.target.checked }))
                    }
                    className="w-4.5 h-4.5 text-[#4f46e5] rounded cursor-pointer accent-[#4f46e5]"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Jam Tenang (Quiet Hours Protection)
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Otomatis menunda pengiriman pesan jika berada di antara pukul{" "}
                  <strong>{settings.quiet_hours_start} - {settings.quiet_hours_end} WIB</strong> ke
                  pagi berikutnya pukul 09:00 WIB.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Mulai</label>
                  <input
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, quiet_hours_start: e.target.value }))
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 text-slate-800 font-bold"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Selesai</label>
                  <input
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, quiet_hours_end: e.target.value }))
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Kebijakan 2: Hentikan Otomatis Bila Bayar */}
            <div className="bg-[#fcfdfd] border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-rose-200 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60">
                    <Ban className="w-5 h-5" />
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.stop_on_payment}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, stop_on_payment: e.target.checked }))
                    }
                    className="w-4.5 h-4.5 text-[#4f46e5] rounded cursor-pointer accent-[#4f46e5]"
                  />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  Hentikan Otomatis Bila Sudah Bayar
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Batalkan seluruh sisa antrean pengingat jika penghuni telah mengunggah bukti transfer
                  atau status tagihannya telah berubah menjadi <strong>Lunas</strong>.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Aktif • Mencegah penagihan ganda ke penghuni
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL KIRIM UJI COBA PESAN WHATSAPP */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Kirim Pesan Uji Coba WhatsApp</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Kirimkan format pesan yang sedang diedit ini ke nomor WhatsApp Anda sendiri untuk
              memeriksa keterbacaan di aplikasi WhatsApp.
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Nomor WhatsApp Tujuan:
              </label>
              <input
                type="text"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="0812xxxxxxx"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-slate-800"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Isi Pesan yang Akan Dikirim:</span>
              <p className="line-clamp-3 text-slate-500">{generatedPreviewMessage}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsAppTest}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Buka di WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
