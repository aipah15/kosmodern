"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Refrigerator,
  Calendar,
  Info,
  Clock,
  AlertTriangle,
  Bell,
  MessageSquare,
  Lock,
  Shield,
  Check,
  Send,
  Coffee,
  Egg,
  Apple,
  Milk,
  Snowflake,
  Shirt,
  Footprints,
  Box,
  UtensilsCrossed,
  Sparkles,
  Plus,
  Search,
  Filter,
  Trash2,
  Archive,
  CheckCircle2,
  ExternalLink,
  User,
  X,
  MapPin,
  Tag,
  AlertCircle,
  Radio,
  Layers,
} from "lucide-react";
import { CommunalFridgeItem, CommunalAreaItem } from "@/types/communal";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PROPERTY } from "@/lib/constants";
import { tenantService } from "@/modules/tenants/services/tenantService";
import { Tenant } from "@/types/tenant";

interface CommunalAreaMonitoringSectionProps {
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

type MainTab = "area" | "fridge" | "warehouse";

export const CommunalAreaMonitoringSection: React.FC<CommunalAreaMonitoringSectionProps> = ({
  onShowToast,
}) => {
  const supabase = createClient();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<MainTab>("area");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("all");

  // Fridge Items State
  const [fridgeItems, setFridgeItems] = useState<CommunalFridgeItem[]>([]);

  // Area Items State
  const [areaItems, setAreaItems] = useState<CommunalAreaItem[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [ownerName, setOwnerName] = useState<string>(DEFAULT_PROPERTY.ownerName);
  const [isLoading, setIsLoading] = useState(true);

  // Seized items in warehouse
  const [seizedItems, setSeizedItems] = useState<CommunalAreaItem[]>([]);

  // Modals State
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<"area" | "fridge">("area");
  const [newItemForm, setNewItemForm] = useState({
    item_name: "",
    tenant_name: "",
    room_number: "",
    zone_id: "jemuran_lt2",
    storage_location: "Rak Tengah",
    note: "",
  });

  // Hitung label waktu relatif dari timestamp database
  const relativeTime = (iso?: string, prefix = "") => {
    if (!iso) return "";
    const diffMin = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
    if (diffMin < 1) return `${prefix}Baru saja`;
    if (diffMin < 60) return `${prefix}${diffMin} menit lalu`;
    if (diffMin < 1440) return `${prefix}${Math.floor(diffMin / 60)} jam lalu`;
    return `${prefix}${Math.floor(diffMin / 1440)} hari lalu`;
  };

  // Muat data kulkas & area bersama dari database
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fridgeRes, areaRes, tenantList] = await Promise.all([
        supabase.from("communal_fridge_items").select("*").order("created_at", { ascending: false }),
        supabase.from("communal_area_items").select("*").order("created_at", { ascending: false }),
        tenantService.getTenants("active"),
      ]);
      if (fridgeRes.error) throw fridgeRes.error;
      if (areaRes.error) throw areaRes.error;

      setFridgeItems(
        ((fridgeRes.data || []) as (CommunalFridgeItem & { expiry_date?: string | null })[]).map((f) => {
          if (!f.expiry_date) return f;
          const days = Math.round(
            (new Date(f.expiry_date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000
          );
          if (days < 0) return { ...f, status: "expired" as const, status_label: `Kadaluarsa ${Math.abs(days)} hari lalu` };
          if (days <= 1) return { ...f, status: "warning" as const, status_label: days === 0 ? "Kadaluarsa hari ini" : "Kadaluarsa besok" };
          return { ...f, status: "safe" as const, status_label: `Aman (${days} hari lagi)` };
        })
      );
      const rows = (areaRes.data || []) as CommunalAreaItem[];
      setAreaItems(
        rows.filter((r) => !r.is_seized).map((r) => ({ ...r, time_ago: relativeTime(r.created_at) || r.time_ago }))
      );
      setSeizedItems(
        rows
          .filter((r) => r.is_seized)
          .map((r) => ({ ...r, time_ago: relativeTime((r as any).updated_at || r.created_at, "Disita ") || r.time_ago }))
      );
      setTenants(tenantList);
    } catch (err: any) {
      console.error("Gagal memuat data area bersama:", err);
      onShowToast?.(`Gagal memuat data area bersama: ${err?.message || "kesalahan jaringan"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase
      .from("property_settings")
      .select("profile")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.profile?.ownerName) setOwnerName(data.profile.ownerName);
      });
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actions: Send WhatsApp reminder
  const handleSendWA = (tenantName: string, itemTitle: string, location: string) => {
    const text = encodeURIComponent(
      `Halo Kak ${tenantName}, mengingatkan terkait barang/makanan di ${location} (${itemTitle}) sudah melebihi batas simpan SOP di ${DEFAULT_PROPERTY.name}. Mohon segera dicek dan dirapikan demi kenyamanan bersama ya Kak. Terima kasih! 🙏 - Pengelola ${DEFAULT_PROPERTY.name}`
    );
    const tenant = tenants.find((t) => t.full_name.toLowerCase() === tenantName.toLowerCase());
    const digits = (tenant?.phone || "").replace(/\D/g, "");
    const phone = digits.startsWith("0") ? "62" + digits.slice(1) : digits;
    if (!phone) {
      onShowToast?.(`Nomor WhatsApp ${tenantName} tidak ditemukan, pilih kontak secara manual.`, "info");
    }
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    onShowToast?.(`Pesan teguran WhatsApp telah disiapkan untuk ${tenantName}.`, "info");
  };

  // Action: Seize Item to Warehouse
  const handleSeizeToWarehouse = async (item: CommunalAreaItem) => {
    const { data, error } = await supabase
      .from("communal_area_items")
      .update({
        is_seized: true,
        zone_id: "gudang",
        zone_name: "Gudang / Pos Keamanan",
        status_label: "Diamankan di Pos",
        note: "Diamankan ke Gudang / Pos Penjaga",
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .select()
      .single();

    if (error) {
      onShowToast?.(`Gagal mengamankan barang: ${error.message}`, "error");
      return;
    }
    setAreaItems((prev) => prev.filter((i) => i.id !== item.id));
    setSeizedItems((prev) => [{ ...(data as CommunalAreaItem), time_ago: "Disita baru saja" }, ...prev]);
    onShowToast?.(`${item.item_name} milik ${item.tenant_name} telah diamankan ke Gudang / Pos Satpam.`, "success");
  };

  // Action: Return Seized Item to Tenant (baris dihapus dari database)
  const handleReturnItem = async (itemId: string, itemName: string, tenantName: string) => {
    const { error } = await supabase.from("communal_area_items").delete().eq("id", itemId);
    if (error) {
      onShowToast?.(`Gagal mencatat pengembalian barang: ${error.message}`, "error");
      return;
    }
    setSeizedItems((prev) => prev.filter((i) => i.id !== itemId));
    onShowToast?.(`Barang ${itemName} telah diserahkan kembali kepada ${tenantName}.`, "success");
  };

  // Action: Remove / Discard Expired Fridge Item
  const handleDiscardFridgeItem = async (itemId: string, itemName: string) => {
    const { error } = await supabase.from("communal_fridge_items").delete().eq("id", itemId);
    if (error) {
      onShowToast?.(`Gagal membuang item kulkas: ${error.message}`, "error");
      return;
    }
    setFridgeItems((prev) => prev.filter((i) => i.id !== itemId));
    onShowToast?.(`${itemName} berhasil disortir dan dibersihkan dari kulkas.`, "success");
  };

  // Broadcast Reminder to All Critical Tenants
  const handleBroadcastReminder = () => {
    const overdueAreaCount = areaItems.filter((i) => i.status === "overdue").length;
    const expiredFridgeCount = fridgeItems.filter((i) => i.status === "expired").length;
    const totalCritical = overdueAreaCount + expiredFridgeCount;

    if (totalCritical === 0) {
      onShowToast?.("Tidak ada barang atau makanan yang melewati batas saat ini. Semua tertib! ✨", "success");
      return;
    }

    onShowToast?.(
      `Menyiapkan pesan teguran otomatis ke ${totalCritical} penghuni dengan barang/makanan lewat batas...`,
      "info"
    );
    const broadcastText = encodeURIComponent(
      `PEMBERITAHUAN PENERTIBAN FASILITAS BERSAMA (${DEFAULT_PROPERTY.name || "Kost Yusi"})\n\nYth. Seluruh Penghuni Kos,\nBerdasarkan pantauan hari ini, terdapat beberapa barang di luar kamar dan makanan kulkas yang melewati batas SOP simpan. Jadwal sortir rutin dilakukan hari Minggu pukul 20:00 WIB. Mohon segera mengecek dan merapikan barang masing-masing agar tidak diamankan petugas. Terima kasih atas kerja samanya! 🙏\n- Pengelola ${DEFAULT_PROPERTY.name || "Kost Yusi"}`
    );
    window.open(`https://wa.me/?text=${broadcastText}`, "_blank");
  };

  // Create New Item (disimpan ke database)
  const handleCreateNewItem = async () => {
    if (!newItemForm.item_name.trim()) {
      onShowToast?.("Nama barang wajib diisi!", "error");
      return;
    }
    if (!newItemForm.tenant_name.trim()) {
      onShowToast?.("Nama pemilik wajib diisi!", "error");
      return;
    }
    const roomNumber = newItemForm.room_number.trim() || "-";
    const matchedTenant = tenants.find((t) => t.full_name.toLowerCase() === newItemForm.tenant_name.trim().toLowerCase());
    const tenantLink = { tenant_id: matchedTenant?.id ?? null, tenant_phone: matchedTenant?.phone ?? null };

    if (newItemType === "area") {
      const zoneNames: Record<string, string> = {
        jemuran_lt2: "Jemuran Lantai 2",
        rak_sepatu: "Rak Sepatu Koridor Depan",
        teras_lt1: "Teras & Koridor Lantai 1",
        dapur_lt1: "Dapur Bersama Lantai 1",
      };

      const { data, error } = await supabase
        .from("communal_area_items")
        .insert({
          zone_id: newItemForm.zone_id,
          zone_name: zoneNames[newItemForm.zone_id] || "Area Bersama",
          zone_subtitle: "Tercatat Petugas Kos",
          item_name: newItemForm.item_name.trim(),
          ...tenantLink,
          tenant_name: newItemForm.tenant_name.trim(),
          room_number: roomNumber,
          time_ago: "Baru saja",
          status: "normal",
          status_label: "Baru Dicatat",
          note: newItemForm.note || null,
          is_seized: false,
        })
        .select()
        .single();

      if (error) {
        onShowToast?.(`Gagal mencatat barang: ${error.message}`, "error");
        return;
      }
      const created = data as CommunalAreaItem;
      setAreaItems((prev) => [{ ...created, time_ago: "Baru saja" }, ...prev]);
      onShowToast?.(`Barang "${created.item_name}" berhasil dicatat di area bersama!`, "success");
    } else {
      const { data, error } = await supabase
        .from("communal_fridge_items")
        .insert({
          ...tenantLink,
          tenant_name: newItemForm.tenant_name.trim(),
          room_number: roomNumber,
          item_name: newItemForm.item_name.trim(),
          storage_location: newItemForm.storage_location,
          entry_date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          status: "safe",
          status_label: "Aman (Baru)",
          category: "makanan_matang",
        })
        .select()
        .single();

      if (error) {
        onShowToast?.(`Gagal mendaftarkan item kulkas: ${error.message}`, "error");
        return;
      }
      const created = data as CommunalFridgeItem;
      setFridgeItems((prev) => [created, ...prev]);
      onShowToast?.(`Item "${created.item_name}" berhasil didaftarkan di kulkas bersama!`, "success");
    }

    setIsNewItemModalOpen(false);
    setNewItemForm({
      item_name: "",
      tenant_name: "",
      room_number: "",
      zone_id: "jemuran_lt2",
      storage_location: "Rak Tengah",
      note: "",
    });
  };

  // Kepatuhan SOP = persentase item yang tidak lewat batas / kedaluwarsa
  const monitoredTotal = areaItems.length + fridgeItems.length;
  const violating = areaItems.filter((i) => i.status === "overdue").length + fridgeItems.filter((i) => i.status === "expired").length;
  const complianceLabel = monitoredTotal === 0 ? "-" : `${Math.round(((monitoredTotal - violating) / monitoredTotal) * 1000) / 10}%`;

  // Filter Area Items
  const filteredAreaItems = areaItems.filter((item) => {
    const matchZone = selectedZoneFilter === "all" || item.zone_id === selectedZoneFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "overdue" && item.status === "overdue") ||
      (statusFilter === "warning" && item.status === "warning") ||
      (statusFilter === "safe" && (item.status === "safe" || item.status === "normal" || item.status === "transit"));

    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.item_name.toLowerCase().includes(q) ||
      item.tenant_name.toLowerCase().includes(q) ||
      item.room_number.toLowerCase().includes(q) ||
      item.zone_name.toLowerCase().includes(q);

    return matchZone && matchStatus && matchSearch;
  });

  // Filter Fridge Items
  const filteredFridgeItems = fridgeItems.filter((item) => {
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "overdue" && item.status === "expired") ||
      (statusFilter === "warning" && item.status === "warning") ||
      (statusFilter === "safe" && item.status === "safe");

    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.item_name.toLowerCase().includes(q) ||
      item.tenant_name.toLowerCase().includes(q) ||
      item.room_number.toLowerCase().includes(q) ||
      item.storage_location.toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  // Filter Seized Items
  const filteredSeizedItems = seizedItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.item_name.toLowerCase().includes(q) ||
      item.tenant_name.toLowerCase().includes(q) ||
      item.room_number.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const overdueAreaCount = areaItems.filter((i) => i.status === "overdue").length;
  const expiredFridgeCount = fridgeItems.filter((i) => i.status === "expired").length;
  const totalCritical = overdueAreaCount + expiredFridgeCount;
  const warningCount =
    areaItems.filter((i) => i.status === "warning").length +
    fridgeItems.filter((i) => i.status === "warning").length;
  const totalTracked = areaItems.length + fridgeItems.length;

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 tracking-wider uppercase">
              Fasilitas & Ketertiban
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              {DEFAULT_PROPERTY.name} • Pengelola: {ownerName}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pemantauan Area Bersama & Kulkas Komunal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 max-w-3xl leading-relaxed">
            Pantau kepatuhan penitipan barang di luar kamar dan inventaris kulkas bersama demi
            kebersihan, kerapian, serta higienitas seluruh penghuni kos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap self-start sm:self-center">
          {/* Tombol Broadcast Teguran */}
          <button
            type="button"
            onClick={handleBroadcastReminder}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            title="Kirim pengingat serentak ke WhatsApp penghuni"
          >
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Tegur Serentak WA</span>
          </button>

          {/* Tombol Catat Barang Baru */}
          <button
            type="button"
            onClick={() => setIsNewItemModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Catat Barang Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Top Interactive KPI Stat Cards (Unified Palette) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Terpantau */}
        <div
          onClick={() => setStatusFilter("all")}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition cursor-pointer shadow-xs ${
            statusFilter === "all"
              ? "border-[#4f46e5] ring-2 ring-indigo-500/10"
              : "border-slate-100 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL TERPANTAU
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {totalTracked} Item
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Area umum & kulkas</p>
        </div>

        {/* Card 2: Butuh Tindakan (Overdue / Expired) */}
        <div
          onClick={() => setStatusFilter("overdue")}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition cursor-pointer shadow-xs ${
            statusFilter === "overdue"
              ? "border-rose-500 ring-2 ring-rose-500/10"
              : "border-slate-100 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
              LEWAT BATAS / EXPIRED
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-rose-700 mt-2">
            {totalCritical} Item
          </h3>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Perlu teguran / disita</p>
        </div>

        {/* Card 3: Peringatan H-1 */}
        <div
          onClick={() => setStatusFilter("warning")}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition cursor-pointer shadow-xs ${
            statusFilter === "warning"
              ? "border-amber-500 ring-2 ring-amber-500/10"
              : "border-slate-100 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
              MENDEKATI BATAS (H-1)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-700 mt-2">
            {warningCount} Item
          </h3>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Pengingat bersahabat</p>
        </div>

        {/* Card 4: Tingkat Kerapihan */}
        <div
          onClick={() => setStatusFilter("safe")}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition cursor-pointer shadow-xs ${
            statusFilter === "safe"
              ? "border-emerald-500 ring-2 ring-emerald-500/10"
              : "border-slate-100 hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              TERTIB & AMAN
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-2">
            {complianceLabel}
          </h3>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Kepatuhan SOP Bersama</p>
        </div>
      </div>

      {/* 3. Sub-Tabs Navigasi & SOP Alert Banner */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-200/80 pb-3">
          {/* Main 3 Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("area")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "area"
                  ? "bg-[#4f46e5] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Barang Luar Kamar</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "area" ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {areaItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("fridge")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "fridge"
                  ? "bg-[#4f46e5] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Refrigerator className="w-4 h-4" />
              <span>Kulkas Bersama</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "fridge" ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {fridgeItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("warehouse")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === "warehouse"
                  ? "bg-[#4f46e5] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>Gudang Sitaan & Pos</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "warehouse" ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-700"
                }`}
              >
                {seizedItems.length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari barang, penghuni, kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* SOP Info Banner */}
        <div className="bg-[#f8faff] rounded-2xl p-3 sm:p-4 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center shrink-0 border border-indigo-100">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">
                Jadwal Sortir Rutin & Pembersihan Bersama:
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Setiap <strong>Minggu pukul 20:00 WIB</strong> • Toleransi barang luar kamar maksimal <strong>3x24 Jam</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">
              SOP Toleransi 3x24 Jam Aktif
            </span>
          </div>
        </div>
      </div>

      {/* 4. TAB 1: BARANG LUAR KAMAR & KORIDOR */}
      {activeTab === "area" && (
        <div className="space-y-4">
          {/* Zona Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
              Zona:
            </span>
            {[
              { id: "all", label: "Semua Zona" },
              { id: "jemuran_lt2", label: "👕 Jemuran Lt. 2" },
              { id: "rak_sepatu", label: "👟 Rak Sepatu Depan" },
              { id: "teras_lt1", label: "📦 Teras & Koridor Lt. 1" },
              { id: "dapur_lt1", label: "🍳 Dapur Bersama" },
            ].map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setSelectedZoneFilter(z.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedZoneFilter === z.id
                    ? "bg-[#4f46e5] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Grid Kartu Barang Luar Kamar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAreaItems.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-10 text-center space-y-2 border border-slate-100">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Semua Area Tertib & Bersih!</h4>
                <p className="text-xs text-slate-400">Tidak ada barang yang melanggar di zona ini.</p>
              </div>
            ) : (
              filteredAreaItems.map((item) => {
                const isOverdue = item.status === "overdue";
                const isWarning = item.status === "warning";

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-4 border transition-all space-y-3 shadow-xs hover:shadow-md ${
                      isOverdue
                        ? "border-rose-300 ring-2 ring-rose-500/10"
                        : isWarning
                        ? "border-amber-300 ring-2 ring-amber-500/10"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    {/* Header Card: Lokasi & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {item.zone_name}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                          {item.item_name}
                        </h4>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
                          isOverdue
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isWarning
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {item.status_label}
                      </span>
                    </div>

                    {/* Pelapor & Waktu */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Pemilik:</span>
                        <span className="font-bold text-slate-800">
                          {item.tenant_name} (Kamar {item.room_number})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Waktu Diletakkan:</span>
                        <span className="text-slate-700 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.time_ago}
                        </span>
                      </div>
                      {item.note && (
                        <div className="pt-1 border-t border-slate-200/60 text-[10px] text-rose-600 font-semibold">
                          Catatan: {item.note}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendWA(item.tenant_name, item.item_name, item.zone_name)}
                        className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Tegur WA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSeizeToWarehouse(item)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        title="Amankan ke gudang sitaan / pos keamanan"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Sita</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 2: KULKAS BERSAMA */}
      {activeTab === "fridge" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFridgeItems.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-10 text-center space-y-2 border border-slate-100">
                <Refrigerator className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Kulkas Bersih & Segar!</h4>
                <p className="text-xs text-slate-400">Tidak ada makanan atau minuman bermasalah.</p>
              </div>
            ) : (
              filteredFridgeItems.map((item) => {
                const isExpired = item.status === "expired";
                const isWarning = item.status === "warning";

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-4 border transition-all space-y-3 shadow-xs hover:shadow-md ${
                      isExpired
                        ? "border-rose-300 ring-2 ring-rose-500/10"
                        : isWarning
                        ? "border-amber-300 ring-2 ring-amber-500/10"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isExpired
                              ? "bg-rose-100 text-rose-600"
                              : isWarning
                              ? "bg-amber-100 text-amber-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {item.category === "minuman" ? (
                            <Milk className="w-4.5 h-4.5" />
                          ) : item.category === "buah" ? (
                            <Apple className="w-4.5 h-4.5" />
                          ) : item.category === "bahan_mentah" ? (
                            <Egg className="w-4.5 h-4.5" />
                          ) : item.category === "frozen_food" ? (
                            <Snowflake className="w-4.5 h-4.5" />
                          ) : (
                            <Coffee className="w-4.5 h-4.5" />
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {item.storage_location}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                            {item.item_name}
                          </h4>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${
                          isExpired
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isWarning
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {item.status_label}
                      </span>
                    </div>

                    {/* Pelapor & Tanggal Masuk */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Pemilik:</span>
                        <span className="font-bold text-slate-800">
                          {item.tenant_name} (Kamar {item.room_number})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Tanggal Simpan:</span>
                        <span className="text-slate-700 font-medium">{item.entry_date}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleSendWA(item.tenant_name, item.item_name, `Kulkas (${item.storage_location})`)
                        }
                        className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Tegur WA</span>
                      </button>

                      {isExpired && (
                        <button
                          type="button"
                          onClick={() => handleDiscardFridgeItem(item.id, item.item_name)}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer flex items-center gap-1"
                          title="Sortir & buang makanan kadaluarsa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Sortir</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 3: GUDANG SITAAN & POS KEAMANAN */}
      {activeTab === "warehouse" && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <h4 className="font-bold text-slate-900">Ketentuan Barang Sitaan:</h4>
              <p className="leading-relaxed">
                Barang yang telah diamankan di pos keamanan dapat diambil kembali oleh penghuni
                dengan menunjukkan kartu identitas / bukti sewa kamar tanpa dikenakan denda pada
                pengambilan pertama.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSeizedItems.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-10 text-center space-y-2 border border-slate-100">
                <Archive className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Gudang Kos Bersih</h4>
                <p className="text-xs text-slate-400">Tidak ada barang yang sedang disita saat ini.</p>
              </div>
            ) : (
              filteredSeizedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        DIAMANKAN DI POS KEAMANAN
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">
                        {item.item_name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.time_ago}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pemilik Barang:</span>
                      <span className="font-bold text-slate-800">
                        {item.tenant_name} (Kamar {item.room_number})
                      </span>
                    </div>
                    {item.note && (
                      <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                        Alasan Diamankan: <em>{item.note}</em>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendWA(item.tenant_name, item.item_name, "Pos Keamanan")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Kabari Penghuni</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReturnItem(item.id, item.item_name, item.tenant_name)}
                      className="px-4 py-1.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Kembalikan ke Penghuni</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. MODAL CATAT BARANG / INVENTARIS BARU */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Catat Temuan / Inventaris Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewItemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Pilihan Kategori */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Kategori Area:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItemType("area")}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      newItemType === "area"
                        ? "bg-[#4f46e5] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Barang Luar Kamar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewItemType("fridge")}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      newItemType === "fridge"
                        ? "bg-[#4f46e5] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Refrigerator className="w-4 h-4" />
                    <span>Kulkas Bersama</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nama Barang / Makanan *
                </label>
                <input
                  type="text"
                  value={newItemForm.item_name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, item_name: e.target.value })}
                  placeholder="Contoh: Sepatu Olahraga Adidas / Kotak Bekal Tupperware"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nama Pemilik (Bila Diketahui)
                  </label>
                  <input
                    type="text"
                    list="communal-tenant-options"
                    value={newItemForm.tenant_name}
                    onChange={(e) => {
                      const match = tenants.find(
                        (t) => t.full_name.toLowerCase() === e.target.value.toLowerCase()
                      );
                      setNewItemForm({
                        ...newItemForm,
                        tenant_name: e.target.value,
                        room_number: match?.room_number || newItemForm.room_number,
                      });
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                  <datalist id="communal-tenant-options">
                    {tenants.map((t) => (
                      <option key={t.id} value={t.full_name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nomor Kamar
                  </label>
                  <input
                    type="text"
                    value={newItemForm.room_number}
                    onChange={(e) => setNewItemForm({ ...newItemForm, room_number: e.target.value })}
                    placeholder="B-04"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              {newItemType === "area" ? (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Lokasi Zona Bersama
                  </label>
                  <select
                    value={newItemForm.zone_id}
                    onChange={(e) => setNewItemForm({ ...newItemForm, zone_id: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                  >
                    <option value="jemuran_lt2">Jemuran Lantai 2 (Balkon Timur)</option>
                    <option value="rak_sepatu">Rak Sepatu Koridor Depan</option>
                    <option value="teras_lt1">Teras & Koridor Lantai 1</option>
                    <option value="dapur_lt1">Dapur Bersama Lantai 1</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Posisi Rak Kulkas
                  </label>
                  <select
                    value={newItemForm.storage_location}
                    onChange={(e) =>
                      setNewItemForm({ ...newItemForm, storage_location: e.target.value })
                    }
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                  >
                    <option value="Rak Atas">Rak Atas</option>
                    <option value="Rak Tengah">Rak Tengah</option>
                    <option value="Rak Bawah">Rak Bawah</option>
                    <option value="Pintu Kulkas">Pintu Kulkas</option>
                    <option value="Freezer">Freezer</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={newItemForm.note}
                  onChange={(e) => setNewItemForm({ ...newItemForm, note: e.target.value })}
                  placeholder="Contoh: Diletakkan di samping ember cuci"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewItemModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateNewItem}
                className="px-5 py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Simpan Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
