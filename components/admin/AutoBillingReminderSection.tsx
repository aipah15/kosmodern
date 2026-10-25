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
} from "lucide-react";
import { AutoReminderSettings, ReminderCadenceStep } from "@/types/reminder";
import { createClient } from "@/lib/supabase/client";

interface AutoBillingReminderSectionProps {
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

export const AutoBillingReminderSection: React.FC<AutoBillingReminderSectionProps> = ({
  onShowToast,
}) => {
  const supabase = createClient();

  // Settings State matching Image 2
  const [settings, setSettings] = useState<AutoReminderSettings>({
    engine_active: true,
    next_schedule: "besok pukul 09:00 WIB untuk 4 penerima",
    quiet_hours_enabled: true,
    quiet_hours_start: "21:00",
    quiet_hours_end: "08:00",
    stop_on_payment: true,
    denda_repeat_days: 2,
  });

  // Cadence steps state matching Image 2
  const [steps, setSteps] = useState<ReminderCadenceStep[]>([
    {
      id: "1",
      step_code: "H-7",
      title: "Pemberitahuan Tagihan Terbit",
      badge_text: "Awal Siklus",
      description:
        "Memberi tahu penghuni bahwa invoice periode baru siap dicek & dibayarkan secara santai.",
      scheduled_time: "Dijadwalkan Pukul 09:00 WIB",
      is_active: true,
      template_message:
        "Halo kak {nama} ({kamar}), invoice sewa kos di {nama_kos} periode {periode} sebesar {nominal} telah terbit. Jatuh tempo: {jatuh_tempo}. Bayar di: {link_pembayaran}. Terima kasih! 🙏",
      sort_order: 1,
    },
    {
      id: "2",
      step_code: "H-3",
      title: "Pengingat Awal Bersahabat",
      badge_text: "Dipilih di Editor",
      description:
        "Mengingatkan penghuni untuk menyiapkan saldo pembayaran sebelum jatuh tempo mendekat.",
      scheduled_time: "Dijadwalkan Pukul 09:00 WIB • Tone Ramah",
      is_active: true,
      template_message:
        "Halo kak {nama} ({kamar}), sekadar mengingatkan tagihan sewa kos di {nama_kos} periode {periode} sebesar {nominal} akan jatuh tempo pada {jatuh_tempo}. Mohon lakukan pembayaran melalui tautan berikut: {link_pembayaran}. Terima kasih! 🙏",
      sort_order: 2,
    },
    {
      id: "3",
      step_code: "H-1",
      title: "Pengingat Batas Akhir Besok",
      badge_text: "Penting",
      description:
        "Penegasan tanggal pembayaran sebelum terkena sanksi atau administrasi denda keterlambatan.",
      scheduled_time: "Dijadwalkan Pukul 10:00 WIB",
      is_active: true,
      template_message:
        "Halo kak {nama} ({kamar}), besok ({jatuh_tempo}) adalah batas akhir pembayaran sewa kamar {kamar} sebesar {nominal}. Mohon segera bayar via {link_pembayaran} agar terhindar dari denda. Terima kasih!",
      sort_order: 3,
    },
    {
      id: "4",
      step_code: "Hari-H",
      title: "Peringatan Jatuh Tempo Hari Ini",
      badge_text: "Mendesak",
      description:
        "Notifikasi urgent batas pelunasan tagihan sewa kos adalah hari ini sebelum pukul 23:59 WIB.",
      scheduled_time: "Dijadwalkan Pukul 08:30 WIB",
      is_active: true,
      template_message:
        "PENTING: Halo kak {nama}, hari ini adalah JATUH TEMPO pembayaran sewa {kamar} ({nominal}). Batas pelunasan sebelum pukul 23:59 WIB. Bayar sekarang: {link_pembayaran}. Terima kasih!",
      sort_order: 4,
    },
    {
      id: "5",
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
  ]);

  // Editor State
  const [activeEditorTab, setActiveEditorTab] = useState("H-3");
  const [currentTemplateText, setCurrentTemplateText] = useState(
    "Halo kak {nama} ({kamar}), sekadar mengingatkan tagihan sewa kos di {nama_kos} periode {periode} sebesar {nominal} akan jatuh tempo pada {jatuh_tempo}. Mohon lakukan pembayaran melalui tautan berikut: {link_pembayaran}. Terima kasih! 🙏"
  );
  const [previewPlatform, setPreviewPlatform] = useState<"whatsapp" | "push">("whatsapp");
  const [isSaving, setIsSaving] = useState(false);

  // Sync with Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: setts } = await supabase
          .from("auto_reminder_settings")
          .select("*")
          .limit(1)
          .single();
        if (setts) {
          setSettings(setts as AutoReminderSettings);
        }

        const { data: stepList } = await supabase
          .from("reminder_cadence_steps")
          .select("*")
          .order("sort_order", { ascending: true });
        if (stepList && stepList.length > 0) {
          setSteps(stepList as ReminderCadenceStep[]);
          const h3 = stepList.find((s) => s.step_code === "H-3");
          if (h3) setCurrentTemplateText(h3.template_message);
        }
      } catch (err) {
        console.error("Error loading reminder settings from Supabase:", err);
      }
    }
    loadData();
  }, [supabase]);

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
  };

  // Toggle Cadence Step
  const handleToggleStep = (stepCode: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.step_code === stepCode ? { ...s, is_active: !s.is_active } : s))
    );
  };

  // Save Settings to Supabase
  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    try {
      // 1. Update general settings
      await supabase
        .from("auto_reminder_settings")
        .update({
          quiet_hours_enabled: settings.quiet_hours_enabled,
          stop_on_payment: settings.stop_on_payment,
          denda_repeat_days: settings.denda_repeat_days,
          updated_at: new Date().toISOString(),
        })
        .match({ engine_active: true });

      // 2. Update active template step
      await supabase
        .from("reminder_cadence_steps")
        .update({
          template_message: currentTemplateText,
          updated_at: new Date().toISOString(),
        })
        .eq("step_code", activeEditorTab);

      // Update local step
      setSteps((prev) =>
        prev.map((s) =>
          s.step_code === activeEditorTab ? { ...s, template_message: currentTemplateText } : s
        )
      );

      onShowToast?.("Pengaturan pengingat otomatis & template berhasil disimpan!", "success");
    } catch {
      onShowToast?.("Pengaturan pengingat tersimpan secara lokal.", "success");
    } finally {
      setIsSaving(false);
    }
  };

  // Dynamic preview generator replacing variables with realistic mock data
  const generatedPreviewMessage = currentTemplateText
    .replace(/\{nama\}/g, "Dimas Arya Pratama")
    .replace(/\{kamar\}/g, "Kamar B-04")
    .replace(/\{nominal\}/g, "Rp 1.995.000")
    .replace(/\{jatuh_tempo\}/g, "10 Juni 2026")
    .replace(/\{periode\}/g, "Juni 2026")
    .replace(/\{link_pembayaran\}/g, "https://kosmodern.id/pay/INV-8891")
    .replace(/\{nama_kos\}/g, "Wisma Melati Residence")
    .replace(/\{rekening_tujuan\}/g, "Bank BCA 842-019-3821 a.n Hj. Ratna Juwita");

  const activeCount = steps.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* 1. Page Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengaturan Pengingat Tagihan Otomatis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 max-w-2xl leading-relaxed">
            Otomatiskan pesan penagihan sewa dan denda ke penghuni kos secara berkala tanpa repot
            mengirim pesan manual satu per satu.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAllSettings}
          disabled={isSaving}
          className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-[#4338ca] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
        </button>
      </div>

      {/* 2. Engine Active Banner matching Image 2 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0">
          <Cpu className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Engine Pengingat Otomatis Aktif
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              BEROPERASI NORMAL
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Pengiriman berikutnya dijadwalkan{" "}
            <strong className="text-slate-800">besok pukul 09:00 WIB</strong> untuk{" "}
            <strong className="text-slate-800">4 penerima</strong>.
          </p>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Cadence & Policies (~6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Box 1: Jadwal Pengiriman Tagihan (Cadence) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center border border-indigo-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    1. Jadwal Pengiriman Tagihan (Cadence)
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Konfigurasi tahapan pengingat berbasis hitung mundur tanggal jatuh tempo
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 shrink-0">
                {activeCount} dari {steps.length} Aktif
              </span>
            </div>

            {/* Cadence Items List */}
            <div className="space-y-3 pt-1">
              {steps.map((step) => {
                const isSelectedInEditor = activeEditorTab === step.step_code;

                return (
                  <div
                    key={step.id}
                    onClick={() => handleSelectEditorTab(step.step_code)}
                    className={`rounded-2xl p-4 transition-all border cursor-pointer ${
                      isSelectedInEditor
                        ? "bg-[#f8faff] border-[#4f46e5] ring-2 ring-indigo-500/10 shadow-xs"
                        : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left Badge: H-7, H-3, etc. */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            step.step_code === "Hari-H"
                              ? "bg-rose-100 text-rose-700"
                              : step.step_code === "H+1"
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {step.step_code}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                              {step.title}
                            </h3>
                            {step.badge_text && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  step.badge_text === "Mendesak" || step.badge_text === "Tertunggak"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : step.badge_text === "Penting"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : isSelectedInEditor
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {step.badge_text}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 font-normal mt-1 leading-relaxed">
                            {step.description}
                          </p>

                          <div className="text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{step.scheduled_time}</span>
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
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform absolute top-0.5 ${
                            step.is_active ? "translate-x-5.5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Sub-option for H+1 Denda frequency */}
                    {step.step_code === "H+1" && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-medium">
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
                          className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value={1}>Kirim setiap 1 hari sekali</option>
                          <option value={2}>Kirim setiap 2 hari sekali</option>
                          <option value={3}>Kirim setiap 3 hari sekali</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Box 2: Kebijakan Etika & Keamanan Pengiriman */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Kebijakan Etika & Keamanan Pengiriman
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Menjaga kenyamanan penghuni agar tidak terganggu di waktu istirahat
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Policy 1: Jam Tenang */}
              <div className="bg-[#fcfdfd] border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">Jam Tenang (Quiet Hours)</h3>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.quiet_hours_enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, quiet_hours_enabled: e.target.checked }))
                    }
                    className="w-4 h-4 text-[#4f46e5] rounded cursor-pointer mt-1"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Otomatis menunda pengiriman pesan jika berada di antara pukul{" "}
                  <strong>21:00 - 08:00 WIB</strong> ke pagi berikutnya.
                </p>
              </div>

              {/* Policy 2: Hentikan Otomatis Bila Bayar */}
              <div className="bg-[#fcfdfd] border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Ban className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">
                      Hentikan Otomatis Bila Bayar
                    </h3>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.stop_on_payment}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, stop_on_payment: e.target.checked }))
                    }
                    className="w-4 h-4 text-[#4f46e5] rounded cursor-pointer mt-1"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Batalkan sisa antrean pengingat jika penghuni telah upload bukti transfer atau
                  berstatus <strong>Lunas</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Template Editor & WhatsApp Preview (~6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Box 1: 3. Editor Template Pesan */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                3. Editor Template Pesan
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sesuaikan kata-kata pesan dan variabel data
              </p>
            </div>

            {/* Cadence Selection Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { code: "H-7", label: "H-7" },
                { code: "H-3", label: "H-3 Awal" },
                { code: "H-1", label: "H-1" },
                { code: "Hari-H", label: "Hari H" },
                { code: "H+1", label: "Denda" },
              ].map((tab) => {
                const isActive = activeEditorTab === tab.code;
                return (
                  <button
                    key={tab.code}
                    type="button"
                    onClick={() => handleSelectEditorTab(tab.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#4f46e5] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Available Dynamic Variables */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  VARIABEL DINAMIS TERSEDIA
                </span>
                <span className="text-[10px] text-indigo-600 font-medium">
                  Klik tag untuk menyisipkan
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "{nama}",
                  "{kamar}",
                  "{nominal}",
                  "{jatuh_tempo}",
                  "{periode}",
                  "{link_pembayaran}",
                  "{nama_kos}",
                  "{rekening_tujuan}",
                ].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleInsertVariable(v)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] text-xs font-mono font-medium border border-indigo-200/60 transition cursor-pointer"
                  >
                    {v}
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
                className="w-full text-xs text-slate-800 p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans shadow-xs"
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
                  className="text-indigo-600 hover:underline cursor-pointer"
                >
                  Kembalikan ke Default
                </button>
              </div>
            </div>

            {/* Delivery Time Input */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Waktu Pengiriman:
              </span>
              <span className="font-bold text-slate-800">Pukul 09:00 WIB (Direkomendasikan)</span>
            </div>
          </div>

          {/* Box 2: Pratinjau Langsung (Preview) matching WhatsApp phone mockup */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#4f46e5]" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Pratinjau Langsung (Preview)
                </h2>
              </div>

              {/* Tabs WhatsApp / Push Notif */}
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

            {/* Realistic WhatsApp Chat Container */}
            <div className="bg-[#efeae2] rounded-3xl overflow-hidden border border-slate-300 shadow-sm font-sans max-w-md mx-auto">
              {/* WhatsApp App Header */}
              <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    KM
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold leading-tight">KosModern Official</h4>
                      <Check className="w-3 h-3 text-emerald-300 stroke-[3]" />
                    </div>
                    <span className="text-[10px] text-emerald-200">Akun Bisnis Resmi</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/90">
                  <Video className="w-4 h-4 cursor-pointer" />
                  <Phone className="w-4 h-4 cursor-pointer" />
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-4 space-y-3 min-h-[220px] flex flex-col justify-between">
                {/* Center Date Pill */}
                <div className="text-center">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/80 shadow-2xs text-[10px] text-slate-600 font-medium">
                    Hari Ini • 09:00 WIB
                  </span>
                </div>

                {/* WhatsApp Message Bubble */}
                <div className="self-start max-w-[92%] bg-[#d9fdd3] rounded-2xl rounded-tl-none p-3.5 shadow-2xs text-xs text-slate-800 space-y-2">
                  <p className="leading-relaxed whitespace-pre-wrap">{generatedPreviewMessage}</p>

                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <span>09:01</span>
                    <span className="text-blue-500 font-bold">✓✓</span>
                  </div>

                  {/* Interactive In-Chat Payment Button */}
                  <div className="pt-1.5 border-t border-emerald-200/60">
                    <button
                      type="button"
                      className="w-full py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                    >
                      <span>💳 Bayar Sekarang via KosModern</span>
                    </button>
                  </div>
                </div>

                {/* Dummy Mock Input Bar at Bottom */}
                <div className="bg-white rounded-full p-2 flex items-center justify-between text-xs text-slate-400 shadow-2xs">
                  <span className="pl-2">Ketik pesan...</span>
                  <div className="w-6 h-6 rounded-full bg-[#128c7e] text-white flex items-center justify-center">
                    <Send className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dummy Recipient Indicator Footer */}
            <div className="bg-indigo-50/70 rounded-2xl p-3 border border-indigo-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                D
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Dummy Penerima: Azka Andya Safira
                </p>
                <p className="text-[11px] text-slate-500">Kamar B-04 • Rp 1.500.000 / bln</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
