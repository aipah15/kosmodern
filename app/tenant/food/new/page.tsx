"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ShieldCheck,
  AlertTriangle,
  MessageCircle,
  HelpCircle,
  LogOut,
  Sparkles,
  Thermometer,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { portalService } from "@/modules/tenant-portal/services/portalService";
import { toWaNumber } from "@/lib/utils/phone";

interface ShelfSection {
  id: string;
  title: string;
  subtitle: string;
  temp: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function TenantNewFoodItemPage() {
  const router = useRouter();
  const portal = useTenantPortal();
  const { tenant, owner } = portal;

  // Form states
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("Kotak");
  const [selectedShelf, setSelectedShelf] = useState("tengah");

  const [dateIn, setDateIn] = useState("");
  const [preset, setPreset] = useState<"1d" | "3d" | "1w" | "2w" | "1m">("3d");
  const [dateExp, setDateExp] = useState("");
  const [expBadge, setExpBadge] = useState("3 Hari Lagi");

  const formatDateDisplay = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return formatDateDisplay(d);
  };

  useEffect(() => {
    const now = new Date();
    setDateIn(formatDateDisplay(now));
    setDateExp(addDays(3));
  }, []);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
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

  const shelfOptions: ShelfSection[] = [
    {
      id: "freezer",
      title: "Freezer Beku",
      subtitle: "Daging, Es Krim, Makanan Beku",
      temp: "-18°C",
      badge: `${portal.fridgeItems.filter((f) => f.shelf_type === "freezer").length} item`,
      icon: Snowflake,
    },
    {
      id: "atas",
      title: "Rak Atas",
      subtitle: "Keju, Yoghurt & Olahan Susu",
      temp: "4°C",
      badge: `${portal.fridgeItems.filter((f) => f.shelf_type === "atas").length} item`,
      icon: Layers,
    },
    {
      id: "tengah",
      title: "Rak Tengah",
      subtitle: "Lauk Masak & Siap Santap",
      temp: "4°C",
      badge: `${portal.fridgeItems.filter((f) => f.shelf_type === "tengah").length} item`,
      icon: Archive,
    },
    {
      id: "bawah",
      title: "Rak Bawah (Crisper)",
      subtitle: "Buah Segar, Sayur & Salad",
      temp: "6°C",
      badge: `${portal.fridgeItems.filter((f) => f.shelf_type === "bawah").length} item`,
      icon: Apple,
    },
    {
      id: "pintu",
      title: "Pintu Kulkas",
      subtitle: "Minuman Botol, Saus, Selai",
      temp: "8°C",
      badge: `${portal.fridgeItems.filter((f) => f.shelf_type === "pintu").length} item`,
      icon: Coffee,
    },
  ];

  const quickCategories = [
    "Susu UHT / Minuman",
    "Greek Yogurt",
    "Nasi Kotak / Lauk",
    "Buah Apel / Jeruk",
    "Roti Tawar",
    "Frozen Food / Nugget",
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
        setErrorMessage("Ukuran file melebihi 5 MB. Harap pilih foto lain.");
        return;
      }
      setErrorMessage(null);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        showToast("Foto barang kulkas berhasil dimuat.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Nama makanan/minuman wajib diisi.");
      return;
    }

    const [dd, mm, yyyy] = dateExp.split("/");
    const expiryDate = `${yyyy}-${mm}-${dd}`;
    const shelf = shelfOptions.find((x) => x.id === selectedShelf) || shelfOptions[2];

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await portalService.createFridgeItem({
        tenant,
        name: name.trim(),
        quantityNote: `${quantity} ${unit}`,
        shelfType: shelf.id,
        shelfLabel: shelf.title,
        expiryDate,
        notes: notes.trim(),
        photo: photoFile,
      });
      await portal.refresh();
      setIsSuccess(true);
      showToast("Barang kulkas berhasil disimpan!");
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal menyimpan barang kulkas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeShelfObj = shelfOptions.find((s) => s.id === selectedShelf) || shelfOptions[2];

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
          href="/tenant/food"
          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Kembali ke </span>Kulkas Bersama</span>
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
      <TenantHeader activeNav="makanan" />

      {/* Kontainer Utama Responsif (Mobile, Tablet, Desktop PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                ITEM BARU • KULKAS DAPUR LT. 1
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Kamar {tenant.room_number}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Tambah Barang Kulkas Bersama
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Catat makanan atau minuman Anda agar tidak tertukar, teratur di rak yang sesuai, dan terpantau sebelum masa kadaluarsa.
            </p>
          </div>

          <Link
            href="/tenant/food"
            className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold py-1.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200/70 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Lihat Isi Kulkas</span>
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
                LABEL TERSIMPAN: {tenant.room_number}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 pt-1">
                Makanan / Minuman Berhasil Dicatat!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                <strong>{quantity} {unit} {name}</strong> telah terdaftar di <strong>{activeShelfObj.title}</strong> atas nama <strong>{tenant.full_name} (Kamar {tenant.room_number})</strong>. Sistem akan mengingatkan sebelum tanggal {dateExp}.
              </p>
            </div>

            {photoPreview && (
              <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-sm">
                <img src={photoPreview} alt={name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-left text-xs text-slate-700 space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-1.5 border-b border-indigo-100">
                <span className="text-slate-500">Rak Penyimpanan:</span>
                <strong className="text-indigo-900">{activeShelfObj.title} ({activeShelfObj.temp})</strong>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-indigo-100">
                <span className="text-slate-500">Tanggal Masuk:</span>
                <span className="font-semibold text-slate-800">{dateIn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Batas Kadaluarsa:</span>
                <span className="font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                  {dateExp} ({expBadge})
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tenant/food"
                className="w-full sm:w-auto px-6 py-3 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 transition"
              >
                Lihat Daftar Kulkas Bersama
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

              {/* Step 1: Nama & Jumlah Makanan/Minuman */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      1
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Nama &amp; Jumlah Barang
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    Wajib Diisi
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nama Lengkap Makanan / Minuman <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Susu UHT Full Cream, Nasi Bento, Greek Yogurt..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4f46e5] transition"
                      required
                    />
                  </div>

                  {/* Kategori Cepat */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-0.5">
                      SARAN CEPAT NAMA BARANG
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickCategories.map((cat, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setName(cat)}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-[#4f46e5] text-slate-600 transition border border-slate-200/60 cursor-pointer"
                        >
                          + {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stepper Jumlah & Satuan */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-900 block leading-tight">
                        Jumlah Kuantitas
                      </label>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Berapa buah/porsi yang disimpan
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl p-1 gap-2">
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-xl bg-white text-slate-600 hover:text-slate-900 shadow-2xs flex items-center justify-center transition active:scale-95 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 min-w-5 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((prev) => prev + 1)}
                          className="w-8 h-8 rounded-xl bg-white text-[#4f46e5] shadow-2xs flex items-center justify-center transition active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="p-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-900 cursor-pointer focus:outline-none"
                      >
                        <option value="Kotak">Kotak</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Botol">Botol</option>
                        <option value="Porsi">Porsi</option>
                        <option value="Bungkus">Bungkus</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Denah & Bagian Rak Kulkas */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      2
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Pilihan Bagian / Rak Kulkas
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {activeShelfObj.title} ({activeShelfObj.temp})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                  {shelfOptions.slice(0, 4).map((shelf) => {
                    const isSelected = selectedShelf === shelf.id;
                    const IconComp = shelf.icon;
                    return (
                      <button
                        key={shelf.id}
                        type="button"
                        onClick={() => setSelectedShelf(shelf.id)}
                        className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/70 border-[#4f46e5] ring-2 ring-indigo-500/10"
                            : "bg-white border-slate-200/80 hover:border-slate-300"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-[#4f46e5] text-white"
                              : "bg-indigo-50 text-[#4f46e5]"
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                              {shelf.title}
                            </span>
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md">
                              {shelf.temp}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5 line-clamp-1">
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
                      className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/70 border-[#4f46e5] ring-2 ring-indigo-500/10"
                          : "bg-white border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#4f46e5] text-white"
                            : "bg-indigo-50 text-[#4f46e5]"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                            {shelf.title}
                          </span>
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md">
                            {shelf.temp}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-500 block mt-0.5">
                          {shelf.subtitle} • {shelf.badge}
                        </span>
                      </div>
                    </button>
                  );
                })()}
              </div>

              {/* Step 3: Tanggal Masuk & Kadaluarsa */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      3
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Tanggal Masuk &amp; Masa Kadaluarsa
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    {expBadge}
                  </span>
                </div>

                {/* Tanggal Masuk */}
                <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        Tanggal Masuk Kulkas
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Hari barang dimasukkan ke kulkas
                      </span>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">
                    {dateIn}
                  </div>
                </div>

                {/* Tanggal Kadaluarsa */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Estimasi Kadaluarsa / Konsumsi Terakhir <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dateExp}
                    onChange={(e) => setDateExp(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4f46e5] transition"
                  />

                  {/* Preset Buttons */}
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
                            handleSelectPreset(item.id as "1d" | "3d" | "1w" | "2w" | "1m")
                          }
                          className={`py-2 px-1 rounded-xl text-[10px] font-semibold text-center transition cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50 text-[#4f46e5] font-bold border border-indigo-200 shadow-2xs"
                              : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-start gap-2 mt-3 pt-2 text-[11px] text-slate-500">
                    <Bell className="w-3.5 h-3.5 text-[#4f46e5] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      Sistem akan mengirimkan notifikasi pengingat otomatis di portal penghuni H-3 dan H-1 sebelum masa kadaluarsa berakhir.
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 4: Foto Bukti Fisik Barang */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      4
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Foto Bukti Fisik Makanan / Minuman
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                    Wajib Diunggah
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                  Sertakan foto kemasan atau wadah makanan Anda yang jelas agar penghuni lain tidak salah ambil. Maksimal 5 MB (JPG/PNG).
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
                      className="w-full h-52 sm:h-60 object-cover"
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
                      Pastikan kemasan atau label wadah terlihat jelas untuk memudahkan identifikasi.
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

              {/* Step 5: Catatan / Ciri Khusus Wadah */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-[#4f46e5] text-xs font-bold flex items-center justify-center border border-indigo-200">
                      5
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Catatan Tambahan &amp; Ciri Wadah
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
                  rows={2}
                  placeholder="Contoh: Wadah Tupperware hijau dengan stiker nama..."
                  className="w-full p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4f46e5] transition resize-none leading-relaxed"
                />
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
                      <span>Menyimpan ke Kulkas Bersama...</span>
                    </div>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Simpan Barang ke Kulkas Bersama</span>
                    </>
                  )}
                </button>

                <Link
                  href="/tenant/food"
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center"
                >
                  Batal &amp; Kembali
                </Link>
              </div>
            </form>

            {/* KOLOM KANAN / SIDEBAR (Tablet: 1/2, Desktop: 4 kolom) */}
            <div className="md:col-span-1 lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              {/* Widget 1: SOP Kulkas Bersama Kost Yusi */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      SOP Kulkas Bersama
                    </h4>
                    <p className="text-[10px] text-slate-400">Dapur Bersama Lantai 1</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-[#4f46e5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span className="leading-relaxed">
                      Wajib menggunakan wadah tertutup atau botol bersegel untuk menjaga higienitas dan aroma kulkas.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-[#4f46e5] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="leading-relaxed">
                      Pembersihan &amp; pembuangan makanan kadaluarsa dilakukan setiap <strong>Sabtu pk 09:00 WIB</strong> oleh pengelola kos.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/70 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      !
                    </span>
                    <span className="text-rose-800 leading-relaxed font-medium">
                      Dilarang mengambil atau memindahkan makanan/minuman milik penghuni lain tanpa izin.
                    </span>
                  </div>
                </div>
              </div>

              {/* Widget 2: Denah Suhu Kulkas */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 leading-tight">Zona Suhu Pendingin</h5>
                    <p className="text-[10px] text-slate-400">Standar Kesegaran Makanan</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-sky-50 border border-sky-100">
                    <span className="font-semibold text-sky-950">Freezer Beku</span>
                    <strong className="text-sky-700">-18°C</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="font-semibold text-indigo-950">Rak Atas &amp; Tengah</span>
                    <strong className="text-indigo-700">4°C (Optimal)</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="font-semibold text-emerald-950">Rak Bawah (Crisper)</span>
                    <strong className="text-emerald-700">6°C</strong>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="font-semibold text-amber-950">Pintu Kulkas</span>
                    <strong className="text-amber-700">8°C</strong>
                  </div>
                </div>
              </div>

              {/* Widget 3: Hotline WhatsApp Pemilik Kost */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl p-5 border border-indigo-100 space-y-2.5 text-xs">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  KULKAS BERSAMA BERMASALAH?
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Jika suhu kulkas terasa kurang dingin, bunga es menumpuk, atau ada bau tidak sedap, segera kabari <strong>{owner.name}</strong> via WhatsApp.
                </p>
                <a
                  href={`https://wa.me/${toWaNumber(owner.phone)}?text=${encodeURIComponent(
                    `Halo Ibu ${owner.name}, saya ${tenant.full_name} dari Kamar ${tenant.room_number}. Ingin menginfokan terkait kulkas bersama di ${owner.propertyName}.`
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
        activeTab="makanan"
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
