"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  Bell,
  Megaphone,
  Receipt,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Droplet,
  UploadCloud,
  FileText,
  X,
  Maximize2,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  AnnouncementCategory,
  AnnouncementTarget,
  AnnouncementAttachment,
} from "@/types/announcement";
import { createClient } from "@/lib/supabase/client";
import { uploadImageToStorage } from "@/lib/utils/storage";
import { tenantService } from "@/modules/tenants/services/tenantService";
import { Tenant } from "@/types/tenant";
import { DEFAULT_PROPERTY } from "@/lib/constants";

interface CreateAnnouncementSectionProps {
  onBack: () => void;
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

export const CreateAnnouncementSection: React.FC<CreateAnnouncementSectionProps> = ({
  onBack,
  onShowToast,
}) => {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State matching Screenshot
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("umum");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState<AnnouncementTarget>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Attachments State
  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Target penerima & opsi tampilan
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    tenantService
      .getTenants("active")
      .then(setTenants)
      .catch((err) => onShowToast?.(`Gagal memuat daftar penghuni: ${err?.message || "kesalahan jaringan"}`, "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableFloors = Array.from(new Set(tenants.map((t) => t.floor).filter(Boolean))) as string[];
  const toggleInList = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  // Categories config
  const categories: {
    id: AnnouncementCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "umum", label: "Umum", icon: Megaphone },
    { id: "tagihan", label: "Tagihan & Bayar", icon: Receipt },
    { id: "perawatan", label: "Perawatan", icon: Wrench },
    { id: "ketertiban", label: "Ketertiban", icon: ShieldCheck },
    { id: "darurat", label: "Darurat", icon: AlertTriangle },
  ];

  // Quick suggestions
  const suggestions = [
    "Jadwal Kerja Bakti",
    "Perbaikan WiFi Koridor",
    "Iuran Sampah & Kebersihan",
    "Pemeliharaan AC",
  ];

  // Word count & Char count
  const charCount = title.length;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Insert Rich Text Formatting
  const handleInsertFormat = (tag: string) => {
    switch (tag) {
      case "bold":
        setContent((prev) => prev + " **teks tebal**");
        break;
      case "italic":
        setContent((prev) => prev + " *teks miring*");
        break;
      case "bullet":
        setContent((prev) => prev + "\n• Poin penting: ");
        break;
      case "numbered":
        setContent((prev) => prev + "\n1. Langkah pertama: ");
        break;
      case "quote":
        setContent((prev) => prev + "\n> Catatan penting untuk diperhatikan");
        break;
      case "water":
        setContent((prev) => prev + " 💧 Aliran Air");
        break;
      case "warning":
        setContent((prev) => prev + " ⚠️ Perhatian");
        break;
      case "wrench":
        setContent((prev) => prev + " 🔧 Perbaikan");
        break;
      default:
        break;
    }
  };

  // Handle File Upload Dropzone (diunggah ke Supabase Storage)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const slots = 3 - attachments.length;
    if (slots <= 0) {
      onShowToast?.("Maksimal 3 file lampiran.", "error");
      return;
    }

    setIsUploading(true);
    const uploaded: AnnouncementAttachment[] = [];
    for (const f of Array.from(files).slice(0, slots)) {
      const { publicUrl, error } = await uploadImageToStorage({ file: f, folder: "announcements" });
      if (error || !publicUrl) {
        onShowToast?.(`Gagal mengunggah ${f.name}: ${error?.message || "kesalahan tidak diketahui"}`, "error");
        continue;
      }
      uploaded.push({ name: f.name, size: (f.size / (1024 * 1024)).toFixed(1) + " MB", url: publicUrl });
    }
    setIsUploading(false);
    e.target.value = "";

    if (uploaded.length > 0) {
      setAttachments((prev) => [...prev, ...uploaded]);
      onShowToast?.("File lampiran berhasil diunggah!", "success");
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Announcement
  const handlePublish = async () => {
    if (!title.trim()) {
      onShowToast?.("Harap isi Judul Pengumuman.", "error");
      return;
    }
    if (!content.trim()) {
      onShowToast?.("Harap isi Konten Pengumuman.", "error");
      return;
    }
    if (targetAudience === "floor" && selectedFloors.length === 0) {
      onShowToast?.("Pilih minimal satu lantai tujuan.", "error");
      return;
    }
    if (targetAudience === "specific" && selectedTenantIds.length === 0) {
      onShowToast?.("Pilih minimal satu penghuni tujuan.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCategoryObj = categories.find((c) => c.id === category);
      const categoryLabel =
        selectedCategoryObj?.label === "Perawatan"
          ? "Perawatan & Perbaikan"
          : selectedCategoryObj?.label || "Umum";

      const targetLabel =
        targetAudience === "all"
          ? `Semua Penghuni ${DEFAULT_PROPERTY.name}`
          : targetAudience === "floor"
          ? `Penghuni ${selectedFloors.join(", ")}`
          : `${selectedTenantIds.length} Penghuni Terpilih`;

      const { error } = await supabase.from("announcements").insert([
        {
          title: title.trim(),
          category,
          category_label: categoryLabel,
          content,
          target_audience: targetAudience,
          target_label: targetLabel,
          target_floors: targetAudience === "floor" ? selectedFloors : null,
          target_tenant_ids: targetAudience === "specific" ? selectedTenantIds : null,
          is_pinned: isPinned,
          is_important: isImportant,
          attachments,
          created_by: DEFAULT_PROPERTY.ownerName,
        },
      ]);

      if (error) throw error;

      onShowToast?.("Pengumuman berhasil diterbitkan!", "success");
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (err: any) {
      console.error("Error publishing announcement:", err);
      onShowToast?.(`Gagal menerbitkan pengumuman: ${err?.message || "kesalahan jaringan"}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Navigation & Publish Action Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 transition cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dasbor | {DEFAULT_PROPERTY.name}</span>
        </button>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-[#4338ca] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition cursor-pointer self-start sm:self-center"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? "Menerbitkan..." : "Terbitkan Sekarang"}</span>
        </button>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Announcement Editor (~8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold border border-indigo-200">
                EDITOR PENGUMUMAN
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Draf otomatis disimpan
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Buat Pengumuman
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
                Sampaikan informasi penting, jadwal perawatan, atau pembaruan kos langsung ke beranda
                dan aplikasi penghuni.
              </p>
            </div>

            {/* Notification Integration Callout */}
            <div className="bg-[#f0f6ff]/70 border border-indigo-100/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-[#4f46e5] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Notifikasi Terintegrasi</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pengumuman akan tampil di beranda dan menu Pengumuman penghuni.
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Fields Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-5">
            {/* Field 1: Judul Pengumuman */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Judul Pengumuman <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {charCount} / 100 Karakter
                </span>
              </div>
              <input
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pemadaman Air Sementara Sabtu, 18 Oktober"
                className="w-full bg-[#f8faff] rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 font-semibold border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />

              {/* Quick Recommendations Pills */}
              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Rekomendasi Cepat:
                </span>
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTitle(sug)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-[11px] font-semibold border border-slate-200 transition cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Kategori Pengumuman */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-0.5">
                Kategori Pengumuman <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Pilih satu kategori agar penghuni mengenali jenis pengumuman ini secara cepat.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isCatActive = category === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 border transition cursor-pointer ${
                        isCatActive
                          ? "bg-[#f0f6ff] border-[#4f46e5] text-[#4f46e5] shadow-xs"
                          : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isCatActive
                            ? "bg-indigo-100 text-[#4f46e5]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-center leading-tight">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field 3: Isi Pengumuman & Formatting Toolbar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Isi Pengumuman <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Mendukung format rapi & poin
                </span>
              </div>

              {/* Formatting Toolbar */}
              <div className="bg-[#f0f6ff]/70 border border-indigo-100 rounded-t-2xl p-2 flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleInsertFormat("bold")}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 font-bold text-xs"
                  title="Tebal"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat("italic")}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 text-xs italic"
                  title="Miring"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-4 bg-slate-300 mx-1"></span>
                <button
                  type="button"
                  onClick={() => handleInsertFormat("bullet")}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 text-xs"
                  title="Daftar Poin"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat("numbered")}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 text-xs"
                  title="Daftar Nomor"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat("quote")}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 text-xs"
                  title="Kutipan"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <span className="w-px h-4 bg-slate-300 mx-1"></span>
                <button
                  type="button"
                  onClick={() => handleInsertFormat("water")}
                  className="p-1.5 rounded-lg hover:bg-white text-sky-600 text-xs"
                  title="Ikon Air"
                >
                  <Droplet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat("warning")}
                  className="p-1.5 rounded-lg hover:bg-white text-amber-600 text-xs"
                  title="Ikon Peringatan"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormat("wrench")}
                  className="p-1.5 rounded-lg hover:bg-white text-indigo-600 text-xs"
                  title="Ikon Perbaikan"
                >
                  <Wrench className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan detail pengumuman..."
                className="w-full bg-white rounded-b-2xl p-4 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans border-x border-b border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                <span>Rekomendasi: Sertakan waktu mulai, selesai, dan instruksi jelas untuk penghuni.</span>
                <span className="font-semibold text-slate-600">{wordCount} Kata</span>
              </div>
            </div>

            {/* Field 4: Lampiran Dokumen & Foto */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Lampiran Dokumen & Foto{" "}
                  <span className="text-[11px] font-normal text-slate-400">(Opsional, Maks 3 File)</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {attachments.length} dari 3 File Terunggah
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200/80 bg-[#f8faff] hover:bg-indigo-50/50 rounded-2xl p-5 text-center cursor-pointer transition"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/png, image/jpeg, application/pdf"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#4f46e5] flex items-center justify-center mx-auto mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Tarik & lepas file ke sini, atau <span className="text-[#4f46e5] underline">Klik untuk Memilih</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Format didukung: JPG, PNG, PDF (Maks. 5 MB per file)
                </p>
              </div>

              {/* Uploaded attachments chip list */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {attachments.map((att, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-[#4f46e5] text-xs font-medium border border-indigo-100"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{att.name}</span>
                      <span className="text-[10px] text-indigo-400">({att.size})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(i)}
                        className="hover:text-rose-600 ml-1 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Target Penerima & Pratinjau Tampilan Penghuni (~4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Box 1: Target Penerima */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4f46e5]" />
                <h3 className="text-sm font-bold text-slate-900">Target Penerima</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {tenants.length} Aktif
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Semua Penghuni */}
              <label
                onClick={() => setTargetAudience("all")}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                  targetAudience === "all"
                    ? "bg-[#f0f6ff]/70 border-[#4f46e5] shadow-xs"
                    : "bg-white border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="target_audience"
                  checked={targetAudience === "all"}
                  onChange={() => setTargetAudience("all")}
                  className="mt-1 accent-[#4f46e5]"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Semua Penghuni {DEFAULT_PROPERTY.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Disiarkan ke {tenants.length} penghuni aktif.
                  </p>
                </div>
              </label>

              {/* Option 2: Berdasarkan Lantai */}
              <label
                onClick={() => setTargetAudience("floor")}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                  targetAudience === "floor"
                    ? "bg-[#f0f6ff]/70 border-[#4f46e5] shadow-xs"
                    : "bg-white border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="target_audience"
                  checked={targetAudience === "floor"}
                  onChange={() => setTargetAudience("floor")}
                  className="mt-1 accent-[#4f46e5]"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Berdasarkan Lantai
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Khusus penghuni di lantai tertentu saja.
                  </p>
                </div>
              </label>

              {/* Option 3: Pilih Penghuni Tertentu */}
              <label
                onClick={() => setTargetAudience("specific")}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                  targetAudience === "specific"
                    ? "bg-[#f0f6ff]/70 border-[#4f46e5] shadow-xs"
                    : "bg-white border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="target_audience"
                  checked={targetAudience === "specific"}
                  onChange={() => setTargetAudience("specific")}
                  className="mt-1 accent-[#4f46e5]"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Pilih Penghuni Tertentu
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Tentukan kamar / penyewa spesifik.
                  </p>
                </div>
              </label>

              {targetAudience === "floor" && (
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  {availableFloors.length === 0 && (
                    <span className="text-[11px] text-slate-400">Belum ada data lantai penghuni.</span>
                  )}
                  {availableFloors.map((floor) => (
                    <button
                      key={floor}
                      type="button"
                      onClick={() => setSelectedFloors((prev) => toggleInList(prev, floor))}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${
                        selectedFloors.includes(floor)
                          ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              )}

              {targetAudience === "specific" && (
                <div className="max-h-48 overflow-y-auto space-y-1 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  {tenants.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTenantIds.includes(t.id)}
                        onChange={() => setSelectedTenantIds((prev) => toggleInList(prev, t.id))}
                        className="accent-[#4f46e5]"
                      />
                      <span className="font-semibold">{t.full_name}</span>
                      <span className="text-slate-400">Kamar {t.room_number}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="accent-[#4f46e5]" />
                Sematkan di beranda penghuni
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} className="accent-[#4f46e5]" />
                Tandai sebagai penting
              </label>
            </div>
          </div>

          {/* Box 2: PRATINJAU TAMPILAN PENGHUNI */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>📱</span> PRATINJAU TAMPILAN PENGHUNI
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="text-xs font-bold text-[#4f46e5] hover:underline cursor-pointer"
              >
                Perbesar
              </button>
            </div>

            {/* Mobile Tenant Card Mockup matching Screenshot */}
            <div className="bg-[#fcfdfd] border border-slate-200 rounded-2xl p-4 space-y-2.5 font-sans shadow-xs">
              {/* Badges Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {isPinned && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider">
                    📌 DISEMATKAN
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider">
                  {categories.find((c) => c.id === category)?.label}
                </span>
                {isImportant && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9px] font-black uppercase tracking-wider">
                    PENTING
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xs font-bold text-slate-900 leading-snug">
                {title || "Judul Pengumuman"}
              </h3>

              {/* Content Preview Snippet */}
              <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed whitespace-pre-line">
                {content}
              </p>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100 text-slate-400 font-medium">
                <span>Hari ini, 09:15 WIB</span>
                <span className="text-indigo-600 font-bold hover:underline cursor-pointer">
                  Baca Selengkapnya →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Pratinjau Pengumuman pada Aplikasi Penghuni
              </h3>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#f8faff] rounded-2xl p-5 border border-indigo-100 space-y-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {isPinned && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    📌 DISEMATKAN
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {categories.find((c) => c.id === category)?.label}
                </span>
              </div>

              <h2 className="text-base font-black text-slate-900 leading-tight">
                {title}
              </h2>

              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-normal">
                {content}
              </p>

              {attachments.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Lampiran ({attachments.length}):
                  </span>
                  {attachments.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-indigo-600 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
