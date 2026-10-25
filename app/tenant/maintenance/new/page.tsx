"use client";

import React, { useState } from "react";
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
  Send,
  FileText,
  X,
} from "lucide-react";

export default function TenantNewMaintenancePage() {
  const [locationType, setLocationType] = useState<"kamar" | "umum">("kamar");
  const [category, setCategory] = useState<string>("ac");
  const [title, setTitle] = useState("AC kamar bocor menetes air ke kasur");
  const [description, setDescription] = useState(
    "Unit AC indoor mulai meneteskan air sejak kemarin malam. Suhu terasa kurang dingin dan tetesan air mengenai ujung ranjang. Mohon diperiksa pipa pembuangannya."
  );
  const [urgency, setUrgency] = useState<"rendah" | "sedang" | "tinggi">("sedang");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  const categories = [
    { id: "sanitasi", label: "Sanitasi / Air", icon: Droplets },
    { id: "ac", label: "AC Pendingin", icon: Wind },
    { id: "listrik", label: "Listrik / Stop Kontak", icon: Zap },
    { id: "kunci", label: "Pintu / Kunci", icon: Key },
    { id: "furnitur", label: "Furnitur Kamar", icon: Bed },
    { id: "kebersihan", label: "Kebersihan", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden pb-12">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-indigo-200/35 via-blue-100/25 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main Container max-w-[430px] */}
      <div className="relative z-10 w-full max-w-[430px] px-4 sm:px-5 pt-3 flex flex-col">
        {/* Top App Brand (KOST YUSI) + Bell Icon */}
        <div className="flex items-center justify-between pt-1 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#eeeffe] text-[#4f46e5] flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 2H9c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 8h2v2H5V8zm0 4h2v2H5v-2zm0 4h2v2H5v-2zm14 4H9v-2h2v-2H9v-2h2v-2H9V8h2V6H9V4h10v16zm-6-12h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-8h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
              </svg>
            </div>
            <span className="text-xs font-bold tracking-wider text-[#4f46e5] uppercase">
              KOST YUSI
            </span>
          </div>

          <Link
            href="/tenant/notifications"
            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition"
          >
            <Bell className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>

        {/* Page Title & Briefcase Icon */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs my-2 flex items-start justify-between">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/tenant/maintenance"
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Buat Laporan Baru
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
              Laporkan kendala fasilitas kamar atau area kos agar segera ditangani oleh pengelola KosModern.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#eeeffe] text-[#3848e0] flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        {isSuccess ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl my-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Laporan Kerusakan Berhasil Dikirim!
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
              Tiket baru <strong>#TK-0824</strong> telah dibuat dan diteruskan ke teknisi <strong>Pak Joko</strong> serta pemilik kos.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/tenant/maintenance"
                className="w-full py-3 bg-[#3848e0] text-white rounded-2xl text-xs font-semibold shadow-md transition"
              >
                Kembali ke Pusat Kendala
              </Link>
              <Link
                href="/tenant"
                className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-semibold hover:bg-slate-200 transition"
              >
                Ke Beranda Utama
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 my-2">
            {/* Step 1: Lokasi Fasilitas */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#3848e0] text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Lokasi Fasilitas
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-rose-500">
                  Wajib Diisi
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Option 1: Dalam Kamar */}
                <div
                  onClick={() => setLocationType("kamar")}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    locationType === "kamar"
                      ? "bg-slate-50 border-[#3848e0] ring-2 ring-indigo-500/10"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Bed className="w-5 h-5 text-[#3848e0]" />
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        locationType === "kamar"
                          ? "bg-[#3848e0] border-[#3848e0] text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {locationType === "kamar" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Dalam Kamar
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Kamar B-04 (Lantai 2)
                    </span>
                  </div>
                </div>

                {/* Option 2: Area Umum */}
                <div
                  onClick={() => setLocationType("umum")}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    locationType === "umum"
                      ? "bg-slate-50 border-[#3848e0] ring-2 ring-indigo-500/10"
                      : "bg-white border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="w-5 h-5 text-slate-500" />
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        locationType === "umum"
                          ? "bg-[#3848e0] border-[#3848e0] text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {locationType === "umum" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Area Umum
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Fasilitas Bersama
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Kategori & Pokok Masalah */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#3848e0] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Kategori &amp; Pokok Masalah
                </h3>
              </div>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-0.5">
                PILIH KATEGORI TERKAIT
              </span>

              {/* 6 Category Chips Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-3 px-2 rounded-2xl text-[11px] font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer border ${
                        isSelected
                          ? "bg-[#eeeffe] text-[#3848e0] border-[#3848e0] font-bold shadow-2xs"
                          : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-center leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input: Judul Kendala */}
              <div className="mt-3">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Judul Kendala
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#3848e0] transition"
                  required
                />
              </div>
            </div>

            {/* Step 3: Detail Deskripsi Kendala */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#3848e0] text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Detail Deskripsi Kendala
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">
                  {description.length} / 500
                </span>
              </div>

              <textarea
                rows={4}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 focus:outline-none focus:border-[#3848e0] transition"
                required
              />

              <div className="flex items-center gap-1.5 text-[11px] text-[#3848e0] mt-2">
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                <span>Sebutkan waktu senggang Anda untuk kemudahan teknisi.</span>
              </div>
            </div>

            {/* Step 4: Tingkat Urgensi */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#3848e0] text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Tingkat Urgensi
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">
                  Estimasi SLA: 1x24 Jam
                </span>
              </div>

              {/* 3 Urgency Cards */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {/* Rendah */}
                <div
                  onClick={() => setUrgency("rendah")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    urgency === "rendah"
                      ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/10"
                      : "bg-slate-50 border-slate-200/70"
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
                  <span className="text-xs font-bold text-slate-900 block">Rendah</span>
                  <span className="text-[10px] text-slate-400">&gt; 48 Jam</span>
                </div>

                {/* Sedang */}
                <div
                  onClick={() => setUrgency("sedang")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    urgency === "sedang"
                      ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/10"
                      : "bg-slate-50 border-slate-200/70"
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
                  <span className="text-xs font-bold text-slate-900 block">Sedang</span>
                  <span className="text-[10px] text-slate-400">1x24 Jam</span>
                </div>

                {/* Tinggi */}
                <div
                  onClick={() => setUrgency("tinggi")}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    urgency === "tinggi"
                      ? "bg-rose-50/80 border-rose-400 ring-2 ring-rose-500/10"
                      : "bg-slate-50 border-slate-200/70"
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
                  <span className="text-xs font-bold text-slate-900 block">Tinggi</span>
                  <span className="text-[10px] text-slate-400">&lt; 3 Jam</span>
                </div>
              </div>

              {/* Urgency Explanation Info Box */}
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/70 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#3848e0] shrink-0 mt-0.5" />
                <span>
                  <strong>Pilihan Sedang:</strong> Untuk kendala fasilitas harian yang mengganggu kenyamanan tetapi tidak membahayakan keselamatan gedung.
                </span>
              </div>
            </div>

            {/* Step 5: Foto Bukti Kerusakan */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#3848e0] text-xs font-bold flex items-center justify-center">
                    5
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Foto Bukti Kerusakan
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">
                  1 dari 3 Foto Terunggah
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Sertakan foto detail agar tim pemeliharaan dapat membawa suku cadang yang tepat. Format JPG/PNG (Maks. 5MB).
              </p>

              {/* 3 Photo Slots */}
              <div className="grid grid-cols-3 gap-2">
                {/* Slot 1: Uploaded photo */}
                <div className="aspect-square rounded-2xl bg-slate-200 border border-slate-300 relative overflow-hidden flex flex-col justify-end p-1.5 shadow-2xs">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="relative z-10 text-[9px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded-md w-fit">
                    Utama
                  </span>
                </div>

                {/* Slot 2: Placeholder */}
                <div
                  onClick={() => alert("Pilih Foto 2")}
                  className="aspect-square rounded-2xl bg-indigo-50/50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-center p-1.5 cursor-pointer hover:bg-indigo-50 transition"
                >
                  <Camera className="w-5 h-5 text-[#3848e0] mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 block">+ Foto 2</span>
                  <span className="text-[8px] text-slate-400">Kamera/Galeri</span>
                </div>

                {/* Slot 3: Placeholder */}
                <div
                  onClick={() => alert("Pilih Foto 3")}
                  className="aspect-square rounded-2xl bg-indigo-50/50 border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center text-center p-1.5 cursor-pointer hover:bg-indigo-50 transition"
                >
                  <ImageIcon className="w-5 h-5 text-[#3848e0] mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 block">+ Foto 3</span>
                  <span className="text-[8px] text-slate-400">Opsional</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              {/* Primary: Kirim Laporan Kerusakan */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-4 bg-[#3848e0] hover:bg-[#2f3ec4] active:scale-99 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? (
                  <span>Mengirim laporan...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Laporan Kerusakan</span>
                  </>
                )}
              </button>

              {/* Secondary: Simpan Draf Laporan */}
              <button
                type="button"
                onClick={() => alert("Draf laporan tersimpan lokal")}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-semibold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Simpan Draf Laporan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
