"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  Info,
  Eye,
  Shirt,
  Footprints,
  Home,
  MapPin,
  Sparkles,
  X,
  UploadCloud,
} from "lucide-react";

interface LocationOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function TenantNewStorageItemPage() {
  const router = useRouter();

  // Form states
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("jemuran");
  const [customLocation, setCustomLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState<"hours" | "1day" | "2-3days">("hours");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const locationOptions: LocationOption[] = [
    {
      id: "jemuran",
      title: "Jemuran",
      subtitle: "Rooftop / Belakang",
      icon: Shirt,
    },
    {
      id: "sepatu",
      title: "Rak Sepatu",
      subtitle: "Lantai 2 Koridor",
      icon: Footprints,
    },
    {
      id: "teras",
      title: "Teras Depan",
      subtitle: "Dekat Parkiran",
      icon: Home,
    },
    {
      id: "lainnya",
      title: "Lainnya",
      subtitle: "Tentukan Manual",
      icon: MapPin,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file melebihi 5 MB. Harap pilih foto lain.");
        return;
      }
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  const triggerGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) {
      setErrorMessage("Nama barang wajib diisi.");
      return;
    }

    if (!selectedLocation) {
      setErrorMessage("Pilih salah satu lokasi penyimpanan.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        router.push("/tenant/storage/my-items");
      }, 1500);
    }, 900);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden pb-12">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-indigo-200/35 via-blue-100/25 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main Container max-w-[430px] */}
      <div className="relative z-10 w-full max-w-[430px] px-4 sm:px-5 pt-3 flex flex-col">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3.5 pt-2 pb-4">
          <Link
            href="/tenant/storage"
            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Tambah Barang
          </h1>
        </div>

        {/* Success Modal / Banner */}
        {isSuccess && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="block font-bold">Barang Berhasil Dicatat!</strong>
              <span>Mengalihkan ke daftar Barang Saya...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-200">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Identity Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100/90 shadow-2xs mb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#eeeffe] text-[#4f46e5] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 leading-tight">
                  Azka Andya Safira
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#4f46e5] tracking-wider uppercase block mt-0.5">
                KAMAR B-04 • LANTAI 1
              </span>
              <p className="text-xs text-slate-500 font-normal leading-relaxed mt-1.5">
                Catat barang yang Anda letakkan di area bersama agar kepemilikannya jelas & tidak disalahartikan.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Foto Barang */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-900">
                Foto Barang <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/80">
                Wajib Diunggah
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50">
                <img
                  src={photoPreview}
                  alt="Preview Barang"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="p-2.5 bg-white flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Foto siap digunakan</span>
                  <button
                    type="button"
                    onClick={triggerGallery}
                    className="text-[#3848e0] font-bold text-xs hover:underline"
                  >
                    Ganti Foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200/90 p-5 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-[#eeeffe] text-[#4f46e5] flex items-center justify-center mb-2.5 shadow-2xs">
                  <Camera className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">
                  Unggah Bukti Fisik Barang
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-4">
                  Maks. 5 MB • Format JPG/PNG
                </p>

                <div className="w-full space-y-2">
                  <button
                    type="button"
                    onClick={triggerCamera}
                    className="w-full py-2.5 bg-[#3848e0] hover:bg-[#2f3ec4] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition active:scale-99"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Ambil Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={triggerGallery}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition active:scale-99"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Pilih Galeri</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Nama Barang */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs">
            <label className="text-xs font-bold text-slate-900 block mb-2">
              Nama Barang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Contoh: Sepatu sneakers hitam, Jemuran handuk..."
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3848e0]/20 focus:border-[#3848e0] transition"
            />
            <p className="text-[10px] text-slate-400 mt-2">
              Beri deskripsi singkat yang mudah dikenali penghuni lain.
            </p>
          </div>

          {/* 3. Lokasi Penyimpanan */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-900">
                Lokasi Penyimpanan <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Pilih 1
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {locationOptions.map((opt) => {
                const isSelected = selectedLocation === opt.id;
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedLocation(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-indigo-50/50 border-[#3848e0] ring-1 ring-[#3848e0]"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#3848e0] text-white"
                          : "bg-indigo-50 text-[#3848e0]"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                        {opt.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                        {opt.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedLocation === "lainnya" && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Tuliskan detail lokasi (misal: Meja lobby lt. 1)..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3848e0]"
                />
              </div>
            )}
          </div>

          {/* 4. Keterangan Tambahan */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900">
                Keterangan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {notes.length}/150
              </span>
            </div>
            <textarea
              value={notes}
              maxLength={150}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Contoh: Sedang dijemur setelah dicuci, akan diambil sore ini pukul 17:00."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3848e0]/20 focus:border-[#3848e0] transition resize-none"
            />
          </div>

          {/* 5. Perkiraan Durasi */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-900">
                Perkiraan Durasi
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Estimasi Pengambilan
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "hours", label: "Beberapa jam" },
                { id: "1day", label: "1 hari" },
                { id: "2-3days", label: "2–3 hari" },
              ].map((tab) => {
                const isSelected = duration === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDuration(tab.id as typeof duration)}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-semibold transition border text-center ${
                      isSelected
                        ? "bg-[#3848e0] text-white border-[#3848e0] shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transparansi Komunitas Card */}
          <div className="p-4 rounded-3xl bg-[#f0f4ff] border border-indigo-100/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#3848e0] flex items-center justify-center shrink-0 mt-0.5">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 block mb-0.5">
                Transparansi Komunitas
              </strong>
              <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                Barang akan terlihat oleh semua penghuni dan pemilik kos, lengkap dengan nama dan nomor kamar Anda (<strong>Azka Andya - Kamar B-04</strong>).
              </p>
            </div>
          </div>

          {/* Hint note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
            <Info className="w-3.5 h-3.5" />
            <span>Lengkapi Foto, Nama Barang, dan Lokasi untuk menyimpan.</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1 pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs text-white shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-99 ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-[#3848e0] hover:bg-[#2f3ec4]"
              }`}
            >
              {isSubmitting ? (
                <span>Menyimpan Barang...</span>
              ) : (
                <span>Simpan Barang</span>
              )}
            </button>

            <Link
              href="/tenant/storage"
              className="w-full py-3 rounded-2xl font-semibold text-xs text-slate-500 hover:text-slate-800 bg-transparent hover:bg-slate-100/60 flex items-center justify-center transition"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
