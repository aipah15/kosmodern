"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  Info,
  Wrench,
  CheckCircle2,
  Megaphone,
  Upload,
  ArrowRight,
  Receipt,
  Check,
  X,
  CreditCard,
  Building2,
  Bell,
  Search,
  Filter,
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  LogOut,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";

interface NotificationItem {
  id: string;
  type: "tagihan" | "tindakan" | "layanan" | "fasilitas" | "sukses" | "pengumuman";
  categoryLabel: string;
  categoryColor: string; // Tailwind color classes
  ticketCode?: string;
  timeAgo: string;
  title: string;
  description: React.ReactNode;
  unread: boolean;
  section: "hari_ini" | "kemarin";
  iconType: "tagihan" | "warning" | "wrench" | "fridge" | "check" | "megaphone";
  footer?: React.ReactNode;
}

import { useTenantPortal } from "@/modules/tenant-portal/context";
import {
  buildNotifications,
  useNotificationReadState,
  NotificationType,
} from "@/modules/tenant-portal/notifications";
import { getRelativeTimeIndo } from "@/lib/utils/date";
import { formatRupiah } from "@/lib/utils/currency";
import { daysUntil } from "@/modules/tenant-portal/services/portalService";

const TYPE_META: Record<
  NotificationType,
  { label: string; color: string; icon: NotificationItem["iconType"] }
> = {
  tagihan: { label: "TAGIHAN KOS", color: "bg-amber-50 text-amber-700 border-amber-200", icon: "tagihan" },
  tindakan: { label: "PERLU TINDAKAN", color: "bg-rose-50 text-rose-700 border-rose-200", icon: "warning" },
  layanan: { label: "LAYANAN KAMAR", color: "bg-indigo-50 text-[#4f46e5] border-indigo-200", icon: "wrench" },
  fasilitas: { label: "FASILITAS BERSAMA", color: "bg-teal-50 text-teal-700 border-teal-200", icon: "fridge" },
  sukses: { label: "PEMBAYARAN LUNAS", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "check" },
  pengumuman: { label: "PENGUMUMAN RESMI", color: "bg-purple-50 text-purple-700 border-purple-200", icon: "megaphone" },
};

export default function TenantNotificationsPage() {
  const [filter, setFilter] = useState<
    "semua" | "belum_dibaca" | "tagihan" | "layanan" | "pengumuman"
  >("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const portal = useTenantPortal();
  const { tenant, owner, billing } = portal;
  const { readIds, markRead, markAllRead } = useNotificationReadState(tenant.id);

  // Notifikasi diturunkan dari tagihan, bukti bayar, tiket, kulkas, dan pengumuman
  const notifications: NotificationItem[] = buildNotifications(portal, billing).map((n) => {
    const meta = TYPE_META[n.type];
    const dayDiff = daysUntil(n.timestamp);
    return {
      id: n.id,
      type: n.type,
      categoryLabel: meta.label,
      categoryColor: meta.color,
      ticketCode: n.ticketCode,
      timeAgo: getRelativeTimeIndo(n.timestamp),
      title: n.title,
      description: <span className="whitespace-pre-line">{n.description}</span>,
      unread: !readIds.has(n.id),
      section: dayDiff !== null && dayDiff >= 0 ? "hari_ini" : "kemarin",
      iconType: meta.icon,
      footer:
        n.link || n.meta ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium">{n.meta || ""}</span>
            {n.link && (
              <Link
                href={n.link.href}
                className="text-xs font-bold text-[#4f46e5] hover:text-indigo-800 flex items-center gap-1 transition"
              >
                <span>{n.link.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : undefined,
    };
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleLogout = () => portal.logout();

  const markAllAsRead = () => {
    markAllRead(notifications.map((n) => n.id));
    showToast("Semua pemberitahuan telah ditandai dibaca.");
  };

  const toggleReadStatus = (id: string) => markRead(id);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = notifications.filter((n) => {
    let matchFilter = true;
    if (filter === "belum_dibaca") matchFilter = n.unread;
    else if (filter === "tagihan") matchFilter = n.type === "tagihan" || n.type === "sukses";
    else if (filter === "layanan") matchFilter = n.type === "layanan" || n.type === "fasilitas" || n.type === "tindakan";
    else if (filter === "pengumuman") matchFilter = n.type === "pengumuman";

    const q = searchQuery.toLowerCase();
    const matchSearch =
      n.title.toLowerCase().includes(q) ||
      n.categoryLabel.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  const hariIniList = filteredNotifications.filter((n) => n.section === "hari_ini");
  const kemarinList = filteredNotifications.filter((n) => n.section === "kemarin");

  const renderIcon = (type: NotificationItem["iconType"]) => {
    switch (type) {
      case "tagihan":
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Receipt className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case "warning":
        return (
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case "wrench":
        return (
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-[#4f46e5] flex items-center justify-center shrink-0 shadow-2xs">
            <Wrench className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case "fridge":
        return (
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case "check":
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case "megaphone":
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Megaphone className="w-5 h-5 fill-current rotate-[-10deg]" />
          </div>
        );
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
          href="/tenant"
          className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span><span className="hidden sm:inline">Kembali ke </span>Beranda Utama</span>
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
      <TenantHeader />

      {/* Kontainer Utama Responsif (Mobile, Tablet, Desktop PC) */}
      <main className="relative z-10 w-full max-w-lg md:max-w-3xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-14">
        {/* Page Title & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#4f46e5] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 uppercase tracking-wider">
                PUSAT NOTIFIKASI • {owner.propertyName.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">Kamar {tenant.room_number}</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Pusat Pemberitahuan
              </h1>
              {unreadCount > 0 && (
                <span className="bg-[#4f46e5] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau pengingat tagihan bulanan, status penanganan tiket perbaikan fasilitas, dan pengumuman dari pengelola kos.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold py-1.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200/70 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Tandai Semua Sudah Dibaca</span>
            </button>
          )}
        </div>

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI (Tablet: 1/2, Desktop: 8 kolom) */}
          <div className="md:col-span-1 lg:col-span-8 space-y-4">
            {/* Filter Pills & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: "semua", label: "Semua", count: notifications.length },
                  { id: "belum_dibaca", label: "Belum Dibaca", count: unreadCount, dot: true },
                  { id: "tagihan", label: "Tagihan", count: notifications.filter((n) => n.type === "tagihan" || n.type === "sukses").length },
                  { id: "layanan", label: "Layanan & Kamar", count: notifications.filter((n) => n.type === "layanan" || n.type === "fasilitas" || n.type === "tindakan").length },
                  { id: "pengumuman", label: "Pengumuman", count: notifications.filter((n) => n.type === "pengumuman").length },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setFilter(pill.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      filter === pill.id
                        ? "bg-[#4f46e5] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pill.dot && unreadCount > 0 && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          filter === pill.id ? "bg-white" : "bg-[#4f46e5]"
                        }`}
                      />
                    )}
                    <span>{pill.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        filter === pill.id ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {pill.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative shrink-0 sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari notifikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Empty State */}
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs space-y-2">
                <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Tidak ada notifikasi</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Semua pemberitahuan pada kategori ini sudah Anda baca atau sesuaikan kata kunci pencarian.
                </p>
              </div>
            ) : (
              <>
                {/* SECTION 1: HARI INI */}
                {hariIniList.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                        HARI INI
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {hariIniList.filter((n) => n.unread).length} Pemberitahuan Baru
                      </span>
                    </div>

                    {hariIniList.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => toggleReadStatus(notif.id)}
                        className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all duration-200 shadow-xs hover:shadow-md relative ${
                          notif.unread
                            ? "border-indigo-300 ring-2 ring-indigo-500/10"
                            : "border-slate-200/80 hover:border-slate-300"
                        }`}
                      >
                        {notif.unread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#4f46e5] absolute top-5 left-2 sm:left-3 ring-2 ring-white" />
                        )}

                        <div className="flex items-start gap-3.5 pl-2 sm:pl-3">
                          {renderIcon(notif.iconType)}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${notif.categoryColor}`}
                                >
                                  {notif.categoryLabel}
                                </span>
                                {notif.ticketCode && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-[#4f46e5] border border-indigo-200">
                                    {notif.ticketCode}
                                  </span>
                                )}
                              </div>

                              <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-300" />
                                <span>{notif.timeAgo}</span>
                              </span>
                            </div>

                            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-1">
                              {notif.title}
                            </h3>

                            <div className="text-xs text-slate-600 leading-relaxed font-normal">
                              {notif.description}
                            </div>

                            {notif.footer && notif.footer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SECTION 2: KEMARIN & SEBELUMNYA */}
                {kemarinList.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                        KEMARIN &amp; SEBELUMNYA
                      </span>
                    </div>

                    {kemarinList.map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-3.5"
                      >
                        {renderIcon(notif.iconType)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${notif.categoryColor}`}
                            >
                              {notif.categoryLabel}
                            </span>

                            <span className="text-[11px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-300" />
                              <span>{notif.timeAgo}</span>
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-1">
                            {notif.title}
                          </h3>

                          <div className="text-xs text-slate-600 leading-relaxed font-normal">
                            {notif.description}
                          </div>

                          {notif.footer && notif.footer}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* KOLOM KANAN / SIDEBAR (Tablet: 1/2, Desktop: 4 kolom) */}
          <div className="md:col-span-1 lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Widget 1: Rekap Tagihan Berjalan */}
            {billing.mainBill && billing.state !== "lunas" && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">Tagihan Berjalan</h4>
                      <p className="text-[10px] text-slate-400">Periode {billing.mainBill.period}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                  {[billing.mainBill, ...billing.extraBills].map((b) => (
                    <div key={b.id} className="flex justify-between items-center text-slate-500">
                      <span>{b.title}:</span>
                      <span className="font-semibold text-slate-800">{formatRupiah(Number(b.amount) + Number(b.fine_amount || 0))}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
                    <span className="text-slate-900">Total Tagihan:</span>
                    <span className="text-[#4f46e5] text-sm">{formatRupiah(billing.total)}</span>
                  </div>
                </div>
                <Link
                  href="/tenant/pay"
                  className="w-full py-2.5 px-3 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Bayar Sekarang</span>
                </Link>
              </div>
            )}

            {/* Widget 3: Hotline WhatsApp Pemilik */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl p-5 border border-indigo-100 space-y-2.5 text-xs">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                KONFIRMASI PENGELOLA
              </span>
              <p className="text-slate-600 leading-relaxed">
                Ada ketidaksesuaian nominal tagihan atau ingin mengonfirmasi bukti bayar langsung? Hubungi <strong>{owner.name}</strong> via WhatsApp.
              </p>
              <a
                href={`https://wa.me/${
                  owner.phone.replace(/\D/g, "").startsWith("0")
                    ? "62" + owner.phone.replace(/\D/g, "").slice(1)
                    : owner.phone.replace(/\D/g, "")
                }?text=${encodeURIComponent(
                  `Halo Ibu ${owner.name}, saya ${tenant.full_name} dari Kamar ${tenant.room_number}. Ingin menanyakan perihal notifikasi di sistem ${owner.propertyName}.`
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
      </main>

      {/* Navigasi Bawah Khusus Layar Ponsel (< 768px) */}
      <TenantBottomNav
        activeTab="beranda"
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
