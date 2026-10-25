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
} from "lucide-react";
import { CommunalFridgeItem, CommunalAreaItem } from "@/types/communal";
import { createClient } from "@/lib/supabase/client";

interface CommunalAreaMonitoringSectionProps {
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

export const CommunalAreaMonitoringSection: React.FC<CommunalAreaMonitoringSectionProps> = ({
  onShowToast,
}) => {
  const supabase = createClient();

  // Active Sub-Tab: 'fridge' (Image 1) or 'area' (Image 2)
  const [activeTab, setActiveTab] = useState<"fridge" | "area">("fridge");

  // Fridge Items State
  const [fridgeItems, setFridgeItems] = useState<CommunalFridgeItem[]>([
    {
      id: "1",
      tenant_name: "Alya Syarifah",
      room_number: "B-02",
      floor: "Lantai 1",
      item_name: "Susu UHT (1 Liter, Diamond)",
      storage_location: "Rak Tengah",
      entry_date: "1 Okt 2026",
      status: "expired",
      status_label: "Sudah Kadaluarsa (2 Hari Lalu)",
      category: "minuman",
    },
    {
      id: "2",
      tenant_name: "Alya Syarifah",
      room_number: "B-02",
      floor: "Lantai 1",
      item_name: "Yogurt Greek Berry (2 Cup)",
      storage_location: "Rak Atas",
      entry_date: "10 Okt 2026",
      status: "warning",
      status_label: "Kadaluarsa Besok (H-1)",
      category: "olahan_susu",
    },
    {
      id: "3",
      tenant_name: "Alya Syarifah",
      room_number: "B-02",
      floor: "Lantai 1",
      item_name: "Telur Ayam Omega (10 Butir)",
      storage_location: "Rak Bawah",
      entry_date: "11 Okt 2026",
      status: "safe",
      status_label: "Aman (>7 hari)",
      category: "bahan_mentah",
    },
    {
      id: "4",
      tenant_name: "Sarah Salsabila",
      room_number: "B-01",
      floor: "Lantai 1",
      item_name: "Buah Potong Semangka & Melon (1 Box)",
      storage_location: "Rak Atas",
      entry_date: "15 Okt 2026",
      status: "expired",
      status_label: "Sudah Kadaluarsa (1 Hari Lalu)",
      category: "buah",
    },
    {
      id: "5",
      tenant_name: "Sarah Salsabila",
      room_number: "B-01",
      floor: "Lantai 1",
      item_name: "Keju Slice Melt (1 Pack, Kraft)",
      storage_location: "Rak Atas",
      entry_date: "10 Okt 2026",
      status: "safe",
      status_label: "Aman (>7 hari)",
      category: "olahan_susu",
    },
    {
      id: "6",
      tenant_name: "Nia Syahrini",
      room_number: "A-03",
      floor: "Lantai 2",
      item_name: "Sisa Nasi Goreng Box (Kotak Kertas)",
      storage_location: "Rak Tengah",
      entry_date: "10 Okt 2026",
      status: "warning",
      status_label: "Mendekati Batas (3 Hari Lagi)",
      category: "makanan_matang",
    },
    {
      id: "7",
      tenant_name: "Nia Syahrini",
      room_number: "A-03",
      floor: "Lantai 2",
      item_name: "Sosis Sapi Champ (Frozen Pack)",
      storage_location: "Freezer",
      entry_date: "05 Okt 2026",
      status: "safe",
      status_label: "Aman (>7 hari)",
      category: "frozen_food",
    },
    {
      id: "8",
      tenant_name: "Fajar Nugraha",
      room_number: "A-05",
      floor: "Lantai 1",
      item_name: "Minuman Kemasan Jus Apel (2 Botol)",
      storage_location: "Pintu Kulkas",
      entry_date: "1 Jun 2026",
      status: "safe",
      status_label: "Aman (>7 hari)",
      category: "minuman",
    },
  ]);

  // Area Items State
  const [areaItems, setAreaItems] = useState<CommunalAreaItem[]>([
    {
      id: "1",
      zone_id: "jemuran_lt2",
      zone_name: "Jemuran Lantai 2",
      zone_subtitle: "Balkon Timur • Kapasitas 10 Slot",
      item_name: "Jemuran Sprei Motif Bunga",
      tenant_name: "Dimas Arya",
      room_number: "B-04",
      time_ago: "4 Jam lalu",
      status: "safe",
      status_label: "Aman (<24 Jam)",
      note: null,
      is_seized: false,
    },
    {
      id: "2",
      zone_id: "jemuran_lt2",
      zone_name: "Jemuran Lantai 2",
      zone_subtitle: "Balkon Timur • Kapasitas 10 Slot",
      item_name: "Handuk Mandi Biru & Kaos",
      tenant_name: "Budi Santoso",
      room_number: "A-01",
      time_ago: "1 Hari lalu",
      status: "normal",
      status_label: "Normal",
      note: null,
      is_seized: false,
    },
    {
      id: "3",
      zone_id: "jemuran_lt2",
      zone_name: "Jemuran Lantai 2",
      zone_subtitle: "Balkon Timur • Kapasitas 10 Slot",
      item_name: "Selimut Tebal Abu-abu",
      tenant_name: "Siti Rahmawati",
      room_number: "B-02",
      time_ago: "3 Hari lalu (H-0)",
      status: "warning",
      status_label: "Mendekati Batas (Kuning)",
      note: null,
      is_seized: false,
    },
    {
      id: "4",
      zone_id: "rak_sepatu",
      zone_name: "Rak Sepatu Koridor Depan",
      zone_subtitle: "Akses Pintu Masuk Utama",
      item_name: "Sepatu Lari Nike Pegasus",
      tenant_name: "Budi Santoso",
      room_number: "A-01",
      time_ago: "1 Hari lalu",
      status: "normal",
      status_label: "Normal (Jemur Basah)",
      note: "Masih di rak",
      is_seized: false,
    },
    {
      id: "5",
      zone_id: "rak_sepatu",
      zone_name: "Rak Sepatu Koridor Depan",
      zone_subtitle: "Akses Pintu Masuk Utama",
      item_name: "Helm KYT Hitam Doff",
      tenant_name: "Dimas Arya",
      room_number: "B-04",
      time_ago: "2 Jam lalu",
      status: "safe",
      status_label: "Baru diletakkan",
      note: "Tertata Rapi",
      is_seized: false,
    },
    {
      id: "6",
      zone_id: "rak_sepatu",
      zone_name: "Rak Sepatu Koridor Depan",
      zone_subtitle: "Akses Pintu Masuk Utama",
      item_name: "Sandal Slop Gunung Eiger",
      tenant_name: "Fajar Nugraha",
      room_number: "A-05",
      time_ago: "4 Hari lalu",
      status: "overdue",
      status_label: "4 Hari – Lewat Batas!",
      note: "Tergelak di tengah koridor",
      is_seized: false,
    },
    {
      id: "7",
      zone_id: "teras_lt1",
      zone_name: "Teras & Koridor Lantai 1",
      zone_subtitle: "Jalur Evakuasi Utama Kos",
      item_name: "Paket Kardus Belanja Shopee Besar",
      tenant_name: "Nadia Putri",
      room_number: "A-02",
      time_ago: "4 Hari lalu",
      status: "overdue",
      status_label: "4 Hari – Lewat Batas!",
      note: "Lagi dinas luar kota",
      is_seized: false,
    },
    {
      id: "8",
      zone_id: "teras_lt1",
      zone_name: "Teras & Koridor Lantai 1",
      zone_subtitle: "Jalur Evakuasi Utama Kos",
      item_name: "Koper Hitam 24 Inch",
      tenant_name: "Rizky Fauzi",
      room_number: "C-03",
      time_ago: "8 Jam lalu",
      status: "transit",
      status_label: "Transit Sementara",
      note: "Siap Masuk Kamar",
      is_seized: false,
    },
    {
      id: "9",
      zone_id: "dapur_lt1",
      zone_name: "Dapur Bersama Lantai 1",
      zone_subtitle: "Sink & Meja Island Komunal",
      item_name: "Wajan Teflon & Spatula Kayu",
      tenant_name: "Siti Rahmawati",
      room_number: "B-02",
      time_ago: "5 Jam lalu",
      status: "safe",
      status_label: "Aman (Di Rak Tiris)",
      note: "Sudah Dicuci",
      is_seized: false,
    },
    {
      id: "10",
      zone_id: "dapur_lt1",
      zone_name: "Dapur Bersama Lantai 1",
      zone_subtitle: "Sink & Meja Island Komunal",
      item_name: "Blender Kaca Philips",
      tenant_name: "Aldi Pratama",
      room_number: "C-01",
      time_ago: "2 Hari lalu",
      status: "warning",
      status_label: "Perlu Dirapikan",
      note: null,
      is_seized: false,
    },
  ]);

  // Sync from Supabase on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: fData } = await supabase.from("communal_fridge_items").select("*");
        if (fData && fData.length > 0) {
          setFridgeItems(fData as CommunalFridgeItem[]);
        }

        const { data: aData } = await supabase.from("communal_area_items").select("*");
        if (aData && aData.length > 0) {
          setAreaItems(aData as CommunalAreaItem[]);
        }
      } catch (err) {
        console.error("Error loading communal items from Supabase:", err);
      }
    }
    loadData();
  }, [supabase]);

  // Actions
  const handleSendWA = (tenantName: string, itemTitle: string, location: string) => {
    const text = encodeURIComponent(
      `Halo Kak ${tenantName}, mengingatkan terkait barang/makanan di ${location} (${itemTitle}) sudah melebihi batas simpan. Mohon segera dicek/dibersihkan demi kenyamanan bersama. Terima kasih! 🙏`
    );
    window.open(`https://wa.me/6281298765432?text=${text}`, "_blank");
    onShowToast?.(`Pesan teguran WhatsApp telah disiapkan untuk ${tenantName}.`, "info");
  };

  const handleSeizeToWarehouse = async (itemId: string, itemName: string, tenantName: string) => {
    try {
      await supabase
        .from("communal_area_items")
        .update({ is_seized: true, note: "Diamankan ke Gudang / Pos Penjaga" })
        .eq("id", itemId);

      setAreaItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, is_seized: true, note: "Diamankan ke Gudang / Pos Penjaga" }
            : i
        )
      );

      onShowToast?.(
        `${itemName} milik ${tenantName} telah dipindahkan ke Gudang / Pos Keamanan.`,
        "success"
      );
    } catch {
      onShowToast?.("Barang berhasil dipindahkan ke Gudang.", "success");
    }
  };

  // Group Fridge Items by Tenant
  const tenantsWithFridgeItems = [
    {
      name: "Alya Syarifah",
      room: "Kamar B-02 • Lantai 1",
      badges: [
        { text: "1 Exp • 1 H-1", color: "bg-rose-50 text-rose-700 border-rose-200" },
      ],
      items: fridgeItems.filter((i) => i.tenant_name === "Alya Syarifah"),
    },
    {
      name: "Sarah Salsabila",
      room: "Kamar B-01 • Lantai 1",
      badges: [{ text: "1 Exp", color: "bg-rose-50 text-rose-700 border-rose-200" }],
      items: fridgeItems.filter((i) => i.tenant_name === "Sarah Salsabila"),
    },
    {
      name: "Nia Syahrini",
      room: "Kamar A-03 • Lantai 2",
      badges: [
        { text: "1 Mendekati Batas", color: "bg-amber-50 text-amber-700 border-amber-200" },
      ],
      items: fridgeItems.filter((i) => i.tenant_name === "Nia Syahrini"),
    },
    {
      name: "Fajar Nugraha",
      room: "Kamar A-05 • Lantai 1",
      badges: [{ text: "Semua Aman", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }],
      items: fridgeItems.filter((i) => i.tenant_name === "Fajar Nugraha"),
    },
  ];

  // Group Area Items by Zone
  const zonesWithAreaItems = [
    {
      zoneId: "jemuran_lt2",
      name: "Jemuran Lantai 2",
      subtitle: "Balkon Timur • Kapasitas 10 Slot",
      icon: Shirt,
      items: areaItems.filter((i) => i.zone_id === "jemuran_lt2"),
    },
    {
      zoneId: "rak_sepatu",
      name: "Rak Sepatu Koridor Depan",
      subtitle: "Akses Pintu Masuk Utama",
      icon: Footprints,
      items: areaItems.filter((i) => i.zone_id === "rak_sepatu"),
    },
    {
      zoneId: "teras_lt1",
      name: "Teras & Koridor Lantai 1",
      subtitle: "Jalur Evakuasi Utama Kos",
      icon: Box,
      items: areaItems.filter((i) => i.zone_id === "teras_lt1"),
    },
    {
      zoneId: "dapur_lt1",
      name: "Dapur Bersama Lantai 1",
      subtitle: "Sink & Meja Island Komunal",
      icon: UtensilsCrossed,
      items: areaItems.filter((i) => i.zone_id === "dapur_lt1"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header matching Both Images */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 tracking-wider uppercase">
            Fasilitas & Ketertiban
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ID: PROKOS-MELATI-F04
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Pemantauan Area Bersama & Ketertiban Kos
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 max-w-3xl leading-relaxed">
          Pantau kepatuhan penitipan barang di luar kamar dan inventaris kulkas komunal demi
          kenyamanan serta higienitas seluruh penghuni Wisma Melati.
        </p>
      </div>

      {/* 2. Sub-Tabs & Schedule Info Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("area")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer ${
              activeTab === "area"
                ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Barang Luar Kamar</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "area"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              12 Barang • 2 Sitaan
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fridge")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer ${
              activeTab === "fridge"
                ? "bg-[#4f46e5] text-white shadow-md shadow-indigo-600/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Refrigerator className="w-4 h-4" />
            <span>Kulkas Bersama</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "fridge"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              24 Item • 5 Kritis
            </span>
          </button>
        </div>

        {/* Schedule & SOP Pill Bar */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap pt-1">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>
              Jadwal Sortir Rutin: <strong>Minggu, 20:00 WIB</strong>
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-indigo-600 font-semibold cursor-pointer hover:underline">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>SOP Toleransi 3x24 Jam</span>
          </span>
        </div>
      </div>

      {/* 3. TAB 1: Kulkas Bersama (Image 1) */}
      {activeTab === "fridge" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
          {tenantsWithFridgeItems.map((tenant, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4"
            >
              {/* Tenant Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{tenant.name}</h3>
                    {tenant.badges.map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.color}`}
                      >
                        {b.text}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {tenant.room}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shrink-0">
                  {tenant.items.length} Barang
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {tenant.items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-3.5 border transition-all ${
                      item.status === "expired"
                        ? "bg-rose-50/40 border-rose-200"
                        : item.status === "warning"
                        ? "bg-amber-50/40 border-amber-200"
                        : "bg-emerald-50/20 border-emerald-100/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            item.status === "expired"
                              ? "bg-rose-100 text-rose-600"
                              : item.status === "warning"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {item.category === "minuman" ? (
                            <Milk className="w-4 h-4" />
                          ) : item.category === "buah" ? (
                            <Apple className="w-4 h-4" />
                          ) : item.category === "bahan_mentah" ? (
                            <Egg className="w-4 h-4" />
                          ) : item.category === "frozen_food" ? (
                            <Snowflake className="w-4 h-4" />
                          ) : (
                            <Coffee className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {item.item_name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span>{item.storage_location}</span>
                            <span>•</span>
                            <span>Masuk: {item.entry_date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${
                          item.status === "expired"
                            ? "bg-rose-100 text-rose-700 border-rose-200"
                            : item.status === "warning"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {item.status_label}
                      </span>
                    </div>

                    {/* Action buttons if not safe */}
                    {item.status !== "safe" && (
                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100/80">
                        {item.status === "expired" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSendWA(
                                tenant.name,
                                item.item_name,
                                `Kulkas (${item.storage_location})`
                              )
                            }
                            className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold border border-rose-200 transition cursor-pointer"
                          >
                            Tegur Penghuni
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleSendWA(
                              tenant.name,
                              item.item_name,
                              `Kulkas (${item.storage_location})`
                            )
                          }
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold shadow-2xs transition cursor-pointer ${
                            item.status === "expired"
                              ? "bg-[#25d366] hover:bg-[#20ba59] text-white"
                              : "bg-amber-100 hover:bg-amber-200 text-amber-800"
                          }`}
                        >
                          {item.status === "expired" ? (
                            <>
                              <MessageSquare className="w-3 h-3" />
                              <span>Kirim WA</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>! Peringatan</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. TAB 2: Barang Luar Kamar (Image 2) */}
      {activeTab === "area" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
          {zonesWithAreaItems.map((zone) => {
            const ZoneIcon = zone.icon;

            return (
              <div
                key={zone.zoneId}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.04)] space-y-4"
              >
                {/* Zone Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center border border-indigo-100 shrink-0">
                      <ZoneIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {zone.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {zone.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shrink-0">
                    {zone.items.length} Barang
                  </span>
                </div>

                {/* Zone Items List */}
                <div className="space-y-3">
                  {zone.items.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-3.5 border transition-all ${
                        item.status === "overdue"
                          ? "bg-rose-50/50 border-rose-200"
                          : item.status === "warning"
                          ? "bg-amber-50/40 border-amber-200"
                          : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {item.item_name}
                        </h4>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 border ${
                            item.status === "overdue"
                              ? "bg-rose-600 text-white border-rose-600"
                              : item.status === "warning"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : item.status === "safe"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {item.status_label}
                        </span>
                      </div>

                      {/* Sub-row: Tenant Name & Time */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <div>
                          <span>
                            {item.tenant_name} (Kamar {item.room_number})
                          </span>
                          {item.note && (
                            <span className="text-rose-600 font-semibold block text-[10px] mt-0.5">
                              • {item.note}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {item.time_ago}
                        </span>
                      </div>

                      {/* Action buttons if warning or overdue */}
                      {(item.status === "overdue" ||
                        item.status === "warning" ||
                        zone.zoneId === "jemuran_lt2") && (
                        <div className="flex items-center justify-end gap-1.5 pt-2.5 mt-2 border-t border-slate-100">
                          {item.status === "overdue" ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSendWA(item.tenant_name, item.item_name, zone.name)
                                }
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold shadow-2xs hover:bg-rose-700 transition cursor-pointer"
                              >
                                Tegur Penghuni
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleSeizeToWarehouse(item.id, item.item_name, item.tenant_name)
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-[10px] font-bold transition cursor-pointer"
                              >
                                <Lock className="w-3 h-3 text-slate-500" />
                                <span>Pindahkan ke Gudang</span>
                              </button>
                            </>
                          ) : item.status === "warning" ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleSendWA(item.tenant_name, item.item_name, zone.name)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shadow-2xs transition cursor-pointer"
                            >
                              <Bell className="w-3 h-3" />
                              <span>Peringatkan (H-0)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleSendWA(item.tenant_name, item.item_name, zone.name)
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25d366] hover:bg-[#20ba59] text-white text-[10px] font-bold shadow-2xs transition cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Kirim WA</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
