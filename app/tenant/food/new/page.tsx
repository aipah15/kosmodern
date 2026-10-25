"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  Snowflake,
  Layers,
  Archive,
  Apple,
  Coffee,
  Calendar,
  Bell,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Check,
  X,
  Info,
} from "lucide-react";

interface ShelfSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function TenantNewFoodItemPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("Pcs");
  const [selectedShelf, setSelectedShelf] = useState("tengah");

  // Today's date default
  const today = new Date();
  const formatDateSlash = (d: Date) => {
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const [dateIn] = useState(formatDateSlash(today));

  // Expiry preset: default 3 days
  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return formatDateSlash(d);
  };

  const [preset, setPreset] = useState<"1d" | "3d" | "1w" | "2w" | "1m">("3d");
  const [dateExp, setDateExp] = useState(addDays(3));
  const [expBadge, setExpBadge] = useState("3 Hari Lagi");

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const shelfOptions: ShelfSection[] = [
    {
      id: "freezer",
      title: "Freezer",
      subtitle: "Beku (-18°C)",
      icon: Snowflake,
    },
    {
      id: "atas",
      title: "Rak Atas",
      subtitle: "Keju, Olahan Susu",
      icon: Layers,
    },
    {
      id: "tengah",
      title: "Rak Tengah",
      subtitle: "Lauk & Siap Santap",
      icon: Archive,
    },
    {
      id: "bawah",
      title: "Rak Bawah",
      subtitle: "Buah & Sayur",
      icon: Apple,
    },
    {
      id: "pintu",
      title: "Pintu Kulkas",
      subtitle: "Saus, Selai & Minuman Botol",
      icon: Coffee,
    },
  ];

  const handleSelectPreset = (p: "1d" | "3d" | "1w" | "2w" | "1m") => {
    setPreset(p);
    if (p === "1d") {
      setDateExp(addDays(1));
      setExpBadge("Besok Exp");
    } else if (p === "3d") {
      setDateExp(addDays(3));
      setExpBadge("3 Hari Lagi");
    } else if (p === "1w") {
      setDateExp(addDays(7));
      setExpBadge("1 Minggu Lagi");
    } else if (p === "2w") {
      setDateExp(addDays(14));
      setExpBadge("2 Minggu Lagi");
    } else if (p === "1m") {
      setDateExp(addDays(30));
      setExpBadge("1 Bulan Lagi");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file melebihi 5 MB.");
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

    if (!name.trim()) {
      setErrorMessage("Nama barang wajib diisi.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        router.push("/tenant/food");
      }, 1500);
    }, 800);
  };

  const activeShelfObj = shelfOptions.find((s) => s.id === selectedShelf);

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden pb-12">
      {/* Ambient Top Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-indigo-200/35 via-blue-100/25 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main Container max-w-[430px] */}
      <div className="relative z-10 w-full max-w-[430px] px-4 sm:px-5 pt-3 flex flex-col">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 pt-2 pb-3">
          <Link
            href="/tenant/food"
            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-slate-900 transition active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-0.5">
              KULKAS BERSAMA
            </span>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              Tambah Barang Kulkas
            </h1>
          </div>
        </div>

        {/* Identity Pill */}
        <div className="my-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef2ff] border border-indigo-100 text-xs text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Azka Andya (Anda) • Kamar B-04</span>
          </span>
        </div>

        {/* Heading Section: Catat Item Baru */}
        <div className="my-2.5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
            Catat Item Baru
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Catat barang Anda di kulkas bersama agar tidak tertukar dan tidak terlewat tanggal kadaluarsanya.
          </p>
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <strong className="block font-bold">Barang Berhasil Disimpan!</strong>
              <span>Mengalihkan ke daftar Kulkas Bersama...</span>
            </div>
          </div>
        )}

        {/* Error Banner */}
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

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Nama Barang */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900">
                Nama Barang <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                WAJIB DIISI
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Susu UHT, Greek Yogurt, Nasi Kotak.."
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3848e0]/20 focus:border-[#3848e0] transition"
            />
          </div>

          {/* Section 2: Jumlah Barang */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs flex items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-slate-900 block leading-tight">
                Jumlah Barang <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Kuantitas di kulkas
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Stepper */}
              <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl p-1 gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-white text-slate-600 hover:text-slate-900 shadow-2xs flex items-center justify-center transition active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-900 min-w-5 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-8 h-8 rounded-xl bg-white text-[#3848e0] shadow-2xs flex items-center justify-center transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Unit Badge */}
              <div className="px-3.5 py-2 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs font-bold text-indigo-900">
                {unit}
              </div>
            </div>
          </div>

          {/* Section 3: Rak / Bagian Penyimpanan */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-900">
                Rak / Bagian Penyimpanan <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-[#3848e0]">
                {activeShelfObj?.title || "Rak Tengah"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {shelfOptions.slice(0, 4).map((shelf) => {
                const isSelected = selectedShelf === shelf.id;
                const IconComp = shelf.icon;
                return (
                  <button
                    key={shelf.id}
                    type="button"
                    onClick={() => setSelectedShelf(shelf.id)}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/60 border-[#3848e0] ring-1 ring-[#3848e0]"
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
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                        {shelf.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                        {shelf.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 5th Option: Pintu Kulkas */}
            {(() => {
              const shelf = shelfOptions[4];
              const isSelected = selectedShelf === shelf.id;
              const IconComp = shelf.icon;
              return (
                <button
                  type="button"
                  onClick={() => setSelectedShelf(shelf.id)}
                  className={`w-full mt-2.5 p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/60 border-[#3848e0] ring-1 ring-[#3848e0]"
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
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {shelf.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {shelf.subtitle}
                    </span>
                  </div>
                </button>
              );
            })()}
          </div>

          {/* Section 4: Dates & Expiry */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs space-y-3.5">
            {/* Tanggal Masuk */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3848e0] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    Tanggal Masuk
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Hari barang dimasukkan
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700">
                {dateIn}
              </div>
            </div>

            {/* Tanggal Kadaluarsa */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900">
                  Tanggal Kadaluarsa <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {expBadge}
                </span>
              </div>

              <input
                type="text"
                value={dateExp}
                onChange={(e) => setDateExp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3848e0]"
              />

              {/* Quick Presets */}
              <div className="grid grid-cols-5 gap-1.5 mt-2.5">
                {[
                  { id: "1d", label: "Besok (+1h)" },
                  { id: "3d", label: "3 Hari" },
                  { id: "1w", label: "1 Minggu" },
                  { id: "2w", label: "2 Minggu" },
                  { id: "1m", label: "1 Bulan" },
                ].map((item) => {
                  const isSelected = preset === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        handleSelectPreset(
                          item.id as "1d" | "3d" | "1w" | "2w" | "1m"
                        )
                      }
                      className={`py-2 px-1 rounded-xl text-[10px] font-semibold text-center transition cursor-pointer ${
                        isSelected
                          ? "bg-indigo-100/80 text-[#3848e0] font-bold border border-indigo-200"
                          : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Reminder Alert Notice */}
              <div className="flex items-start gap-2 mt-3 pt-2 text-[10px] text-slate-500">
                <Bell className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Pengingat otomatis akan dikirim H-3 dan H-1 sebelum kadaluarsa melalui notifikasi sistem.
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Foto Barang */}
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
                  className="w-full h-44 object-cover"
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
                    className="w-full py-2.5 bg-[#3848e0] hover:bg-[#2f3ec4] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition active:scale-99 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Ambil Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={triggerGallery}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition active:scale-99 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Pilih Galeri</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action CTA Buttons */}
          <div className="space-y-2 pt-2 pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs text-white shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-99 cursor-pointer ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-[#818cf8] hover:bg-[#6366f1]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
              {isSubmitting ? (
                <span>Menyimpan Barang...</span>
              ) : (
                <span>Simpan Barang</span>
              )}
            </button>

            <Link
              href="/tenant/food"
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
