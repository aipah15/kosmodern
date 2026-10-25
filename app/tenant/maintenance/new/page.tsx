"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Bed,
  Building2,
  Droplets,
  Wind,
  Zap,
  Key,
  Armchair,
  Sparkles,
  Lightbulb,
  Info,
  Camera,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  Send,
  FileText,
  X,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
  Wrench,
  AlertTriangle,
  LogOut,
  UploadCloud,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { portalService, TenantTicket } from "@/modules/tenant-portal/services/portalService";

export default function TenantNewMaintenancePage() {
  const [locationType, setLocationType] = useState<"kamar" | "umum">("kamar");
  const [category, setCategory] = useState<string>("ac");
  const portal = useTenantPortal();
  const { tenant, owner } = portal;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"rendah" | "sedang" | "tinggi">("sedang");
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [createdTicket, setCreatedTicket] = useState<TenantTicket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => portal.logout();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (photos.length >= 3) {
      showToast("Maksimal 3 foto bukti kerusakan.");
      return;
    }
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      showToast("Foto harus berupa gambar dengan ukuran maksimal 5 MB.");
      return;
    }
    setPhotos((prev) => [...prev, { file, preview: URL.createObjectURL(file) }]);
    showToast("Foto bukti berhasil ditambahkan.");
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    showToast("Foto bukti dihapus.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Judul kendala wajib diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      const categoryLabel = categories.find((c) => c.id === category)?.label || "Lainnya";
      const created = await portalService.createTicket({
        tenant,
        title: title.trim(),
        description: `[${categoryLabel}] ${description.trim() || "Tanpa deskripsi tambahan."}`,
        urgency: urgency === "tinggi" ? "urgent" : urgency === "sedang" ? "medium" : "low",
        locationType: locationType === "umum" ? "umum" : "pribadi",
        areaLocation: "Fasilitas Bersama",
        accessPermission: "Diizinkan (Kunci di Pos Keamanan)",
        photo: photos[0]?.file ?? null,
      });
      await portal.refresh();
      setCreatedTicket(created);
      setIsSuccess(true);
    } catch (err: any) {
      showToast(err?.message || "Gagal mengirim laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: "sanitasi", label: "Sanitasi / Air", icon: Droplets, desc: "Kran, wastafel, shower" },
    { id: "ac", label: "AC Pendingin", icon: Wind, desc: "Bocor, kurang dingin, bising" },
    { id: "listrik", label: "Listrik / Saklar", icon: Zap, desc: "Lampu, stop kontak, MCB" },
    { id: "kunci", label: "Pintu / Kunci", icon: Key, desc: "Engsel, gerendel, kunci macet" },
    { id: "furnitur", label: "Furnitur Kamar", icon: Bed, desc: "Kasur, lemari, meja belajar" },
    { id: "kebersihan", label: "Kebersihan", icon: Sparkles, desc: "Sampah, koridor, saluran air" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col justify-start relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-200/25 via-blue-100/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900/95 text-white text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in duration-200 border border-white/10">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Demo Bar */}
      <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70 z-30 px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs gap-2">
        <Link
          href="/tenant/maintenance"
          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Kembali ke </span>Pusat Kendala</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <span className="hidden sm:inline-block text-[11px] text-slate-500">
            Penghuni: <strong>{tenant.full_name} (Kamar {tenant.room_number})</strong>
          </span>
          <Link
            href="/admin"
            className="px-2.5 sm:px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-bold text-[11px] transition border border-indigo-100 shrink-0"
          >
            <span className="hidden sm:inline">Portal Pemilik</span>
            <span className="sm:hidden">Admin</span> →
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-2 sm:px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px] inline-flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden xs:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Sticky Header Navigasi */}
      <TenantHeader activeNav="laporan" />

      {/* Kontainer Utama Responsif (Mobile, Tablet, Desktop PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                TIKET BARU • KAMAR {tenant.room_number.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Respon SLA Cepat</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Buat Laporan Kerusakan Baru
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Laporkan kendala fasilitas kamar atau area bersama agar teknisi rekanan segera dijadwalkan oleh pengelola.
            </p>
          </div>

          <Link
            href="/tenant/maintenance"
            className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold py-1.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200/70 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lihat Riwayat Laporan</span>
          </Link>
        </div>

        {isSuccess ? (
          /* ================= SUCCESS STATE ================= */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl my-6 text-center max-w-xl mx-auto animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                TIKET TERDAFTAR: {createdTicket?.ticket_code}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 pt-1">
                Laporan Kerusakan Berhasil Dikirim!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                Laporan kendala fasilitas <strong>Kamar {tenant.room_number}</strong> telah masuk ke sistem pengelola <strong>{owner.name}</strong>. Pantau jadwal teknisi pada halaman Pusat Kendala.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left text-xs text-slate-700 space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-1.5 border-b border-indigo-100">
                <span className="text-slate-500">Estimasi Kunjungan:</span>
                <strong className="text-indigo-900">Menunggu penjadwalan teknisi</strong>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-indigo-100">
                <span className="text-slate-500">Kunci Cadangan:</span>
                <span className="font-semibold text-slate-800">{createdTicket?.access_permission || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tingkat Urgensi:</span>
                <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  {createdTicket?.urgency_label || "-"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tenant/maintenance"
                className="w-full sm:w-auto px-6 py-3 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 transition"
              >
                Pantau di Pusat Kendala
              </Link>
              <Link
                href="/tenant"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold transition"
              >
                Ke Beranda Utama
              </Link>
            </div>
          </div>
        ) : (
          /* ================= FORM LAYOUT (12 COLUMNS) ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
            {/* KOLOM KIRI: FORMULIR MULTI-STEP (Tablet: 1/2, Desktop: 8 kolom) */}
            <form onSubmit={handleSubmit} className="md:col-span-1 lg:col-span-8 space-y-4">
              {/* Step 1: Lokasi Fasilitas */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      1
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Lokasi Fasilitas Bermasalah
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    Wajib Dipilih
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1: Dalam Kamar Pribadi */}
                  <div
                    onClick={() => setLocationType("kamar")}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      locationType === "kamar"
                        ? "bg-indigo-50/70 border-[#4f46e5] ring-2 ring-indigo-500/10"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-[#4f46e5] flex items-center justify-center">
                        <Bed className="w-4 h-4" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          locationType === "kamar"
                            ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {locationType === "kamar" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                        Kamar Saya
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Kamar {tenant.room_number} ({tenant.floor})
                      </span>
                    </div>
                  </div>

                  {/* Option 2: Area Fasilitas Bersama */}
                  <div
                    onClick={() => setLocationType("umum")}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      locationType === "umum"
                        ? "bg-indigo-50/70 border-[#4f46e5] ring-2 ring-indigo-500/10"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          locationType === "umum"
                            ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {locationType === "umum" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                        Fasilitas Bersama
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Dapur, Wi-Fi, Lorong, Parkir
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Kategori & Pokok Masalah */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                    2
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Kategori &amp; Pokok Masalah
                  </h3>
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-0.5">
                  PILIH JENIS KERUSAKAN
                </span>

                {/* 6 Category Chips Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 mb-3.5">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`py-3 px-2.5 rounded-2xl text-[11px] font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer border ${
                          isSelected
                            ? "bg-indigo-50/80 text-[#4f46e5] border-[#4f46e5] font-bold shadow-2xs ring-1 ring-[#4f46e5]"
                            : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="text-center leading-tight">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Input: Judul Kendala */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Judul Ringkas Kerusakan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: AC bocor menetes air, Kran wastafel doll..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4f46e5] transition"
                    required
                  />
                </div>
              </div>

              {/* Step 3: Detail Deskripsi Kendala */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      3
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Detail Kronologi &amp; Gejala Kerusakan
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {description.length} / 500
                  </span>
                </div>

                <textarea
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan detail kerusakan, sejak kapan terjadi, dan waktu luang Anda di kamar..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4f46e5] transition"
                  required
                />

                <div className="flex items-center gap-1.5 text-[11px] text-[#4f46e5] mt-2 font-medium">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                  <span>Sebutkan apakah Anda mengizinkan teknisi masuk dengan kunci cadangan jika sedang berhalangan.</span>
                </div>
              </div>

              {/* Step 4: Tingkat Urgensi */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      4
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Tingkat Urgensi Penanganan
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    SLA Standar Kost Yusi
                  </span>
                </div>

                {/* 3 Urgency Cards */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
                  {/* Rendah */}
                  <div
                    onClick={() => setUrgency("rendah")}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      urgency === "rendah"
                        ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/10"
                        : "bg-slate-50 border-slate-200/70 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                          urgency === "rendah"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {urgency === "rendah" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">Rendah</span>
                    <span className="text-[10px] text-slate-400">&gt; 48 Jam</span>
                  </div>

                  {/* Sedang */}
                  <div
                    onClick={() => setUrgency("sedang")}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      urgency === "sedang"
                        ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/10"
                        : "bg-slate-50 border-slate-200/70 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                          urgency === "sedang"
                            ? "bg-amber-500 border-amber-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {urgency === "sedang" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">Sedang</span>
                    <span className="text-[10px] text-slate-400">1x24 Jam</span>
                  </div>

                  {/* Tinggi */}
                  <div
                    onClick={() => setUrgency("tinggi")}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      urgency === "tinggi"
                        ? "bg-rose-50/80 border-rose-400 ring-2 ring-rose-500/10"
                        : "bg-slate-50 border-slate-200/70 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                          urgency === "tinggi"
                            ? "bg-rose-500 border-rose-500 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {urgency === "tinggi" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">Tinggi</span>
                    <span className="text-[10px] text-slate-400">&lt; 3 Jam</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/70 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#4f46e5] shrink-0 mt-0.5" />
                  <span>
                    <strong>Pilihan {urgency.toUpperCase()}:</strong> {urgency === "tinggi" ? "Untuk kendala darurat seperti korsleting atau pipa bocor meluap yang membahayakan kenyamanan gedung." : urgency === "sedang" ? "Untuk kendala fasilitas harian seperti AC bocor, kran doll, atau lampu mati." : "Untuk perbaikan minor furnitur atau penyetelan engsel pintu."}
                  </span>
                </div>
              </div>

              {/* Step 5: Foto Bukti Kerusakan */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      5
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Foto Bukti Kerusakan
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600">
                    {photos.length} / 3 Foto
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Sertakan foto detail agar tim teknisi membawa suku cadang yang tepat. Format JPG/PNG (Maks. 5MB).
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* 3 Photo Slots */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {photos.map(({ preview: src }, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group"
                    >
                      <img
                        src={src}
                        alt={`Bukti Kerusakan ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer"
                        title="Hapus Foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                        {index === 0 ? "Utama" : `Foto ${index + 1}`}
                      </span>
                    </div>
                  ))}

                  {photos.length < 3 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition active:scale-95"
                    >
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-[#4f46e5] mb-1" />
                      <span className="text-[11px] font-bold text-slate-700 block">+ Foto</span>
                      <span className="text-[9px] text-slate-400">Kamera/Galeri</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengirim Laporan ke Pengelola...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Laporan Kerusakan</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => showToast("Draf laporan tersimpan lokal di perangkat Anda.")}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Simpan Draf Laporan</span>
                </button>
              </div>
            </form>

            {/* KOLOM KANAN / SIDEBAR (Tablet: 1/2, Desktop: 4 kolom) */}
            <div className="md:col-span-1 lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              {/* Widget 1: Standar SLA Respon */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      Standar Respon SLA Teknisi
                    </h4>
                    <p className="text-[10px] text-slate-400">Kost Yusi Management</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between">
                    <div>
                      <strong className="text-rose-900 block">Urgensi Tinggi</strong>
                      <span className="text-[11px] text-rose-700">Korsleting, bocor deras</span>
                    </div>
                    <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md text-[10px]">
                      &lt; 3 Jam
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                    <div>
                      <strong className="text-amber-900 block">Urgensi Sedang</strong>
                      <span className="text-[11px] text-amber-700">AC menetes, kran air, lampu</span>
                    </div>
                    <span className="font-bold text-amber-700 bg-white px-2 py-0.5 rounded-md text-[10px]">
                      &lt; 24 Jam
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <strong className="text-emerald-900 block">Urgensi Rendah</strong>
                      <span className="text-[11px] text-emerald-700">Engsel pintu, meja, furnitur</span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md text-[10px]">
                      1 - 3 Hari
                    </span>
                  </div>
                </div>
              </div>

              {/* Widget 3: Kontak Darurat WhatsApp Pemilik */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl p-5 border border-indigo-100 space-y-2.5 text-xs">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  KONDISI DARURAT?
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Jika terjadi kebocoran pipa utama atau korsleting yang berisiko, segera hubungi {owner.name} via WhatsApp untuk tindakan pemadaman MCB darurat.
                </p>
                <a
                  href={`https://wa.me/${
                    owner.phone.replace(/\D/g, "").startsWith("0")
                      ? "62" + owner.phone.replace(/\D/g, "").slice(1)
                      : owner.phone.replace(/\D/g, "")
                  }?text=${encodeURIComponent(
                    `Halo Ibu ${owner.name}, saya ${tenant.full_name} dari Kamar ${tenant.room_number}. Ada kendala darurat pada fasilitas kos yang memerlukan penanganan cepat.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp {owner.name} (Pemilik)</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigasi Bawah Khusus Layar Ponsel (< 768px) */}
      <TenantBottomNav
        activeTab="laporan"
        onChangeTab={(tab) => {
          if (tab === "beranda") window.location.href = "/tenant";
          else if (tab === "tagihan") window.location.href = "/tenant/bills";
          else if (tab === "laporan") window.location.href = "/tenant/maintenance";
          else if (tab === "penyimpanan") window.location.href = "/tenant/storage";
          else if (tab === "makanan") window.location.href = "/tenant/food";
        }}
      />
    </div>
  );
}
