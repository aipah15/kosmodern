"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDateIndo } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/currency";
import { PortalData, BillingOverview, billTotal, daysUntil } from "./services/portalService";

export type NotificationType = "tagihan" | "tindakan" | "layanan" | "fasilitas" | "sukses" | "pengumuman";

export interface PortalNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string; // ISO
  meta?: string;
  ticketCode?: string;
  link?: { href: string; label: string };
}

// Notifikasi diturunkan langsung dari data tagihan, bukti bayar, tiket, kulkas, dan pengumuman
export function buildNotifications(data: PortalData, billing: BillingOverview): PortalNotification[] {
  const items: PortalNotification[] = [];
  const { tenant } = data;

  if ((billing.state === "belum_bayar" || billing.state === "terlambat") && billing.mainBill) {
    const main = billing.mainBill;
    const d = daysUntil(main.due_date);
    const when =
      d === null ? "" : d > 0 ? `jatuh tempo ${d} hari lagi (${formatDateIndo(main.due_date)})` : d === 0 ? "jatuh tempo hari ini" : `terlambat ${Math.abs(d)} hari sejak ${formatDateIndo(main.due_date)}`;
    items.push({
      id: `bill-${main.id}-${billing.state}`,
      type: "tagihan",
      title: billing.state === "terlambat" ? "Tagihan Melewati Jatuh Tempo" : "Pengingat Tagihan Jatuh Tempo",
      description: `Tagihan ${main.title} periode ${main.period} total ${formatRupiah(billing.total)}, ${when}.`,
      timestamp: main.updated_at || main.created_at || main.due_date,
      meta: `Kamar ${tenant.room_number} • Periode ${main.period}`,
      link: { href: "/tenant/pay", label: "Bayar via QRIS / Bank" },
    });
  }

  for (const proof of data.proofs) {
    const laterActive = data.proofs.some(
      (p) =>
        p.id !== proof.id &&
        p.invoice_number === proof.invoice_number &&
        new Date(p.created_at || 0).getTime() > new Date(proof.created_at || 0).getTime()
    );
    if (proof.status === "rejected" && !laterActive) {
      items.push({
        id: `proof-${proof.id}-rejected`,
        type: "tindakan",
        title: `Bukti Bayar ${proof.period || ""} Ditolak Pengelola`.replace("  ", " "),
        description: proof.rejection_reason || "Bukti transfer ditolak. Mohon unggah ulang bukti yang jelas.",
        timestamp: proof.updated_at || proof.created_at || new Date().toISOString(),
        link: { href: "/tenant/reupload-proof", label: "Unggah Ulang Bukti Bayar" },
      });
    }
    if (proof.status === "approved") {
      items.push({
        id: `proof-${proof.id}-approved`,
        type: "sukses",
        title: `Pembayaran ${proof.period || ""} Terverifikasi Lunas`.replace("  ", " "),
        description: `Pembayaran ${formatRupiah(proof.amount)} untuk invoice ${proof.invoice_number || "-"} telah diverifikasi pengelola.`,
        timestamp: proof.updated_at || proof.created_at || new Date().toISOString(),
        meta: "Lunas Terverifikasi",
        link: { href: "/tenant/bills", label: "Lihat Riwayat Tagihan" },
      });
    }
  }

  for (const t of data.tickets) {
    if (t.tenant_id !== tenant.id) continue;
    const label =
      t.status === "selesai" ? "Laporan Selesai Dikerjakan" : t.status === "diproses" ? "Laporan Sedang Diproses" : t.status === "ditolak" ? "Laporan Ditolak" : "Laporan Diterima Pengelola";
    const tech = t.assigned_technician ? ` Teknisi: ${t.assigned_technician}.` : "";
    const eta = t.estimated_arrival ? ` Estimasi: ${t.estimated_arrival}.` : "";
    items.push({
      id: `ticket-${t.id}-${t.status}`,
      type: "layanan",
      title: `${label}: ${t.title}`,
      description: `${t.status_label || label}.${tech}${eta}`.trim(),
      timestamp: t.updated_at || t.created_at || new Date().toISOString(),
      ticketCode: t.ticket_code,
      link: { href: "/tenant/maintenance", label: "Pantau Status Tiket" },
    });
  }

  for (const f of data.fridgeItems) {
    if (f.tenant_id !== tenant.id) continue;
    const d = daysUntil(f.expiry_date);
    if (d === null || d > 1) continue;
    items.push({
      id: `fridge-${f.id}-${d <= 0 ? "expired" : "soon"}`,
      type: "fasilitas",
      title: d < 0 ? `${f.item_name} Sudah Kedaluwarsa` : d === 0 ? `${f.item_name} Kedaluwarsa Hari Ini` : `${f.item_name} Kedaluwarsa Besok`,
      description: "Mohon segera dikonsumsi atau dikeluarkan dari kulkas bersama sebelum pembersihan rutin.",
      timestamp: f.expiry_date as string,
      meta: f.storage_location,
      link: { href: "/tenant/food", label: "Buka Kulkas Bersama" },
    });
  }

  for (const a of data.announcements) {
    items.push({
      id: `ann-${a.id}`,
      type: "pengumuman",
      title: a.title,
      description: a.content,
      timestamp: a.created_at || new Date().toISOString(),
      meta: a.created_by ? `Dari ${a.created_by}` : undefined,
    });
  }

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Status baca disimpan per perangkat (localStorage)
export function useNotificationReadState(tenantId: string) {
  const storageKey = `kosmodern:notif-read:${tenantId}`;
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setReadIds(new Set(raw ? (JSON.parse(raw) as string[]) : []));
    } catch {
      setReadIds(new Set());
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: Set<string>) => {
      setReadIds(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        // abaikan jika penyimpanan browser tidak tersedia
      }
    },
    [storageKey]
  );

  const markRead = useCallback((id: string) => persist(new Set([...readIds, id])), [persist, readIds]);
  const markAllRead = useCallback((ids: string[]) => persist(new Set([...readIds, ...ids])), [persist, readIds]);

  return useMemo(() => ({ readIds, markRead, markAllRead }), [readIds, markRead, markAllRead]);
}

export { billTotal };
