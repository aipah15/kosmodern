import { TenantAreaItem } from "./services/portalService";

export type AreaCategory = "jemuran" | "sepatu" | "koridor" | "dapur" | "teras";

// Batas toleransi barang di area bersama (SOP: 3x24 jam)
export const AREA_ITEM_LIMIT_DAYS = 3;

// Zona penitipan yang dapat dipilih penghuni (zone_id sama dengan yang dipakai admin)
export const AREA_ZONES = {
  jemuran: { zoneId: "jemuran_lt2", zoneName: "Jemuran Lantai 2", subtitle: "Dicatat penghuni" },
  sepatu: { zoneId: "rak_sepatu", zoneName: "Rak Sepatu Koridor Depan", subtitle: "Dicatat penghuni" },
  teras: { zoneId: "teras_lt1", zoneName: "Teras & Koridor Lantai 1", subtitle: "Dicatat penghuni" },
  dapur: { zoneId: "dapur_lt1", zoneName: "Dapur Bersama Lantai 1", subtitle: "Dicatat penghuni" },
} as const;

export function categoryOfZone(zoneId: string): AreaCategory {
  if (zoneId.startsWith("jemuran")) return "jemuran";
  if (zoneId.startsWith("rak_sepatu") || zoneId.startsWith("sepatu")) return "sepatu";
  if (zoneId.startsWith("teras")) return "teras";
  if (zoneId.startsWith("dapur")) return "dapur";
  return "koridor";
}

const CATEGORY_STYLE: Record<AreaCategory, { color: string; bg: string }> = {
  jemuran: { color: "bg-indigo-50 text-[#4f46e5] border-indigo-200", bg: "from-blue-100 via-indigo-100 to-indigo-200" },
  sepatu: { color: "bg-purple-50 text-purple-700 border-purple-200", bg: "from-amber-100 via-orange-100 to-amber-200" },
  koridor: { color: "bg-amber-50 text-amber-700 border-amber-200", bg: "from-slate-200 via-slate-300 to-slate-400" },
  dapur: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", bg: "from-emerald-100 via-teal-100 to-emerald-200" },
  teras: { color: "bg-rose-50 text-rose-700 border-rose-200", bg: "from-rose-100 via-pink-100 to-rose-200" },
};

export function areaItemMeta(item: TenantAreaItem, now = new Date()) {
  const category = categoryOfZone(item.zone_id);
  const style = CATEGORY_STYLE[category];
  const ageMs = now.getTime() - new Date(item.created_at || now).getTime();
  const daysActive = Math.max(0, Math.floor(ageMs / 86400000));
  const hours = Math.floor(ageMs / 3600000);
  const timeTag =
    hours < 1 ? "Baru saja" : hours < 24 ? `${hours} Jam lalu` : `${daysActive} Hari lalu`;
  return {
    category,
    locationColor: style.color,
    imageBg: style.bg,
    daysActive,
    timeTag,
    isOverdue: daysActive >= AREA_ITEM_LIMIT_DAYS,
    // ikon kartu: teras memakai ikon koridor
    iconCategory: (category === "teras" ? "koridor" : category) as "jemuran" | "sepatu" | "koridor" | "dapur",
  };
}
