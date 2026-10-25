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
  Clock,
  AlertTriangle,
  HelpCircle,
  MessageCircle,
  Package,
  Layers,
  LogOut,
  Tag,
  Calendar,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { portalService } from "@/modules/tenant-portal/services/portalService";
import { AREA_ZONES } from "@/modules/tenant-portal/areaItems";
import { toWaNumber } from "@/lib/utils/phone";

interface LocationOption {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function TenantNewStorageItemPage() {
  const router = useRouter();
  const portal = useTenantPortal();
  const { tenant, owner } = portal;

  // Form states
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [itemName, setItemName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("sepatu");
  const [customLocation, setCustomLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState<"hours" | "1day" | "2-3days" | "weekend">("1day");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => portal.logout();

  const locationOptions: LocationOption[] = [
    {
      id: "jemuran",
      title: "Jemuran Rooftop",
      subtitle: "Lantai 2",
      badge: `${portal.areaItems.filter((a) => a.zone_id === "jemuran_lt2").length} Barang`,
      icon: Shirt,
    },
    {
      id: "sepatu",
      title: "Rak Sepatu Koridor",
      subtitle: "Koridor Depan",
      badge: `${portal.areaItems.filter((a) => a.zone_id === "rak_sepatu").length} Barang`,
      icon: Footprints,
    },
    {
      id: "teras",
      title: "Teras Depan",
      subtitle: "Lantai 1",
      badge: `${portal.areaItems.filter((a) => a.zone_id === "teras_lt1").length} Barang`,
      icon: Home,
    },
    {
      id: "lainnya",
      title: "Area Lainnya",
      subtitle: "Tentukan Manual",
      badge: "Bebas",
      icon: MapPin,
    },
  ];

  const quickCategories = [
    "Sepatu / Sandal",
    "Pakaian / Jemuran",
    "Payung / Jas Hujan",
    "Helm / Aksesoris",
    "Paket Kiriman",
    "Alat Olahraga",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file melebihi 5 MB. Harap pilih foto lain.");
        return;
      }
      setErrorMessage(null);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        showToast("Foto barang berhasil dimuat.");
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

  const locationLabel = (id: string) =>
    id === "jemuran"
      ? AREA_ZONES.jemuran.zoneName
      : id === "sepatu"
      ? AREA_ZONES.sepatu.zoneName
      : id === "teras"
      ? AREA_ZONES.teras.zoneName
      : customLocation.trim() || "Area Bersama";

  const durationLabel =
    duration === "hours"
      ? "Beberapa jam (< 12 jam)"
      : duration === "1day"
      ? "1 hari (24 jam)"
      : duration === "2-3days"
      ? "2 - 3 hari"
      : "Sepanjang akhir pekan";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) {
      setErrorMessage("Nama barang wajib diisi.");
      return;
    }

    if (!selectedLocation) {
      setErrorMessage("Pilih salah satu lokasi penyimpanan.");
      return;
    }
    if (selectedLocation === "lainnya" && !customLocation.trim()) {
      setErrorMessage("Tuliskan lokasi penempatan barang.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const zone = selectedLocation === "lainnya" ? null : AREA_ZONES[selectedLocation as keyof typeof AREA_ZONES];
      await portalService.createAreaItem({
        tenant,
        name: itemName.trim(),
        zoneId: zone?.zoneId || "lainnya",
        zoneName: locationLabel(selectedLocation),
        zoneSubtitle: zone?.subtitle || "Dicatat penghuni",
        note: [notes.trim(), `Estimasi: ${durationLabel}`].filter(Boolean).join(" • "),
        photo: photoFile,
      });
      await portal.refresh();
      setIsSuccess(true);
      showToast("Titipan barang berhasil dicatat!");
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal mencatat barang.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          href="/tenant/storage"
          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Kembali ke </span>Titipan Barang</span>
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
      <TenantHeader activeNav="penyimpanan" />

      {/* Kontainer Utama Responsif (Mobile, Tablet, Desktop PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                TITIPAN BARU • AREA BERSAMA
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Kost Yusi Transparan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Catat Titipan Barang Baru
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftarkan barang Anda yang diletakkan di area umum (jemuran, rak sepatu, teras) agar kepemilikannya jelas dan terhindar dari tertukar.
            </p>
          </div>

          <Link
            href="/tenant/storage/my-items"
            className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold py-1.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200/70 transition"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Lihat Barang Saya</span>
          </Link>
        </div>

        {/* Success Modal / Card State */}
        {isSuccess ? (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl my-6 text-center max-w-xl mx-auto animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
                BARANG TERCATAT
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 pt-1">
                Barang Anda Berhasil Terdaftar!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                Barang <strong>{itemName}</strong> kini telah tercatat atas nama <strong>{tenant.full_name} (Kamar {tenant.room_number})</strong> dan dapat dipantau oleh pengelola dan seluruh penghuni kos.
              </p>
            </div>

            {photoPreview && (
              <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-sm">
                <img src={photoPreview} alt={itemName} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left text-xs text-slate-700 space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-1.5 border-b border-indigo-100">
                <span className="text-slate-500">Lokasi Penempatan:</span>
                <strong className="text-indigo-900">
                  {locationLabel(selectedLocation)}
                </strong>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-indigo-100">
                <span className="text-slate-500">Estimasi Durasi:</span>
                <span className="font-semibold text-slate-800">
                  {durationLabel}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status Transparansi:</span>
                <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  Aktif &amp; Terverifikasi
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tenant/storage/my-items"
                className="w-full sm:w-auto px-6 py-3 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 transition"
              >
                Lihat Daftar Barang Saya
              </Link>
              <Link
                href="/tenant/storage"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold transition"
              >
                Kembali ke Titipan Barang
              </Link>
            </div>
          </div>
        ) : (
          /* ================= FORM LAYOUT (12 COLUMNS) ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
            {/* KOLOM KIRI: FORMULIR MULTI-STEP (Tablet: 1/2, Desktop: 8 kolom) */}
            <form onSubmit={handleSubmit} className="md:col-span-1 lg:col-span-8 space-y-4">
              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 1: Foto Bukti Fisik Barang */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      1
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Foto Bukti Fisik Barang
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    Wajib Diunggah
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Unggah foto barang yang jelas agar penghuni lain dapat mengenali barang Anda dengan mudah. Maksimal 5 MB (JPG/PNG).
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 group">
                    <img
                      src={photoPreview}
                      alt="Preview Barang"
                      className="w-full h-52 sm:h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                    
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition cursor-pointer shadow-md"
                      title="Hapus Foto"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-white">
                      <span className="font-semibold bg-black/40 px-2.5 py-1 rounded-xl backdrop-blur-sm">
                        Foto Siap Digunakan
                      </span>
                      <button
                        type="button"
                        onClick={triggerGallery}
                        className="px-3 py-1 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition cursor-pointer shadow-sm"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-indigo-200/90 p-6 flex flex-col items-center justify-center text-center bg-indigo-50/20 hover:bg-indigo-50/40 transition">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-[#4f46e5] flex items-center justify-center mb-2.5 shadow-2xs">
                      <Camera className="w-6 h-6 stroke-[2]" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Ambil Foto atau Pilih dari Galeri
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-4 max-w-xs">
                      Pastikan pencahayaan cukup dan bentuk barang terlihat jelas dari sudut pandang depan.
                    </p>

                    <div className="w-full sm:w-80 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={triggerCamera}
                        className="py-2.5 px-3 bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Kamera HP</span>
                      </button>
                      <button
                        type="button"
                        onClick={triggerGallery}
                        className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                        <span>Buka Galeri</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Nama & Identitas Barang */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                    2
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Nama &amp; Kategori Barang
                  </h3>
                </div>

                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nama Lengkap Barang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Contoh: Sepatu sneakers Ventela merah, Handuk microfiber abu..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4f46e5] transition mb-3"
                  required
                />

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-0.5">
                  SARAN CEPAT KATEGORI
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {quickCategories.map((cat, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setItemName(cat)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-[#4f46e5] text-slate-600 transition border border-slate-200/60 cursor-pointer"
                    >
                      + {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Lokasi Penyimpanan di Area Bersama */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      3
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Lokasi Penyimpanan di Area Bersama
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Pilih 1 Lokasi</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {locationOptions.map((opt) => {
                    const isSelected = selectedLocation === opt.id;
                    const IconComponent = opt.icon;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedLocation(opt.id)}
                        className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/70 border-[#4f46e5] ring-2 ring-indigo-500/10"
                            : "bg-white border-slate-200/80 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#4f46e5] text-white"
                                : "bg-indigo-50 text-[#4f46e5]"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-indigo-100 text-[#4f46e5]"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                            {opt.title}
                          </span>
                          <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5">
                            {opt.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedLocation === "lainnya" && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Ketik Lokasi Spesifik <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Contoh: Meja sudut koridor Lt. 1, dekat dispenser..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4f46e5] transition"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Step 4: Estimasi Durasi Penempatan */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      4
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Perkiraan Durasi Penempatan
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400">SOP Kost Yusi</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "hours", label: "Beberapa Jam", sub: "< 12 Jam" },
                    { id: "1day", label: "1 Hari Penuh", sub: "1x24 Jam" },
                    { id: "2-3days", label: "2 - 3 Hari", sub: "Maksimal" },
                    { id: "weekend", label: "Akhir Pekan", sub: "Sabtu-Minggu" },
                  ].map((tab) => {
                    const isSelected = duration === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDuration(tab.id as typeof duration)}
                        className={`p-2.5 rounded-2xl text-xs font-semibold transition border text-center cursor-pointer ${
                          isSelected
                            ? "bg-[#4f46e5] text-white border-[#4f46e5] shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        <span className="block font-bold leading-tight">{tab.label}</span>
                        <span
                          className={`text-[9px] block mt-0.5 ${
                            isSelected ? "text-indigo-100" : "text-slate-400"
                          }`}
                        >
                          {tab.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 5: Keterangan / Ciri Khusus Barang */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      5
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Ciri Khusus / Keterangan Tambahan
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {notes.length} / 150
                  </span>
                </div>

                <textarea
                  value={notes}
                  maxLength={150}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Ada gantungan kunci bernama, diletakkan di rak baris ke-2..."
                  className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4f46e5] transition resize-none leading-relaxed"
                />

                <div className="flex items-center gap-1.5 text-[11px] text-[#4f46e5] mt-2 font-medium">
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Identitas Kamar {tenant.room_number} akan tercantum otomatis secara transparan untuk semua penghuni.
                  </span>
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
                      <span>Menyimpan Barang ke Area Bersama...</span>
                    </div>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Simpan Barang ke Area Bersama</span>
                    </>
                  )}
                </button>

                <Link
                  href="/tenant/storage"
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center"
                >
                  Batal &amp; Kembali
                </Link>
              </div>
            </form>

            {/* KOLOM KANAN / SIDEBAR (Tablet: 1/2, Desktop: 4 kolom) */}
            <div className="md:col-span-1 lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              {/* Widget 1: SOP Titipan Area Bersama */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      SOP Titipan Area Bersama
                    </h4>
                    <p className="text-[10px] text-slate-400">Ketertiban Kost Yusi</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-[#4f46e5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span className="text-slate-600 leading-relaxed">
                      Jemuran pakaian maksimal diangkat <strong>1x24 jam</strong> setelah kering agar gantungan dapat digunakan bergantian.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-[#4f46e5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="text-slate-600 leading-relaxed">
                      Sepatu/sandal wajib diletakkan rapi di rak sesuai nomor slot atau koridor lantai masing-masing.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/70 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      !
                    </span>
                    <span className="text-rose-800 leading-relaxed font-medium">
                      <strong>Dilarang keras:</strong> Meninggalkan uang tunai, laptop, atau perhiasan berharga di area umum.
                    </span>
                  </div>
                </div>
              </div>

              {/* Widget 2: Denah & Slot Kapasitas Area */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 leading-tight">Status Kapasitas Area</h5>
                    <p className="text-[10px] text-slate-400">Pantauan Waktu Nyata</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">Jemuran Rooftop (Lt. 3)</span>
                      <span className="font-bold text-[#4f46e5]">8 / 12 Gantungan</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: "66%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">Rak Sepatu Koridor Lt. 2</span>
                      <span className="font-bold text-amber-600">14 / 16 Slot (Padat)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "87%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">Teras Depan (Parkiran)</span>
                      <span className="font-bold text-emerald-600">3 / 6 Slot (Leluasa)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "50%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 3: Bantuan Pengelola / WhatsApp Pemilik */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl p-5 border border-indigo-100 space-y-2.5 text-xs">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  BARANG TERTUKAR ATAU HILANG?
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Jika ada barang Anda yang tidak ditemukan di lokasinya, segera laporkan ke pemilik kos <strong>{owner.name}</strong> untuk pengecekan rekaman CCTV koridor.
                </p>
                <a
                  href={`https://wa.me/${toWaNumber(owner.phone)}?text=${encodeURIComponent(
                    `Halo Ibu ${owner.name}, saya ${tenant.full_name} dari Kamar ${tenant.room_number}. Ingin bertanya terkait barang titipan saya di area bersama ${owner.propertyName}.`
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
        activeTab="penyimpanan"
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
