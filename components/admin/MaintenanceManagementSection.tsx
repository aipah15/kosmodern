"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Share2,
  Printer,
  MessageSquare,
  Key,
  Maximize2,
  Phone,
  UploadCloud,
  ChevronRight,
  Star,
  Check,
  X,
  FileText,
  User,
  Sparkles,
  Camera,
  Plus,
  Search,
  Filter,
  CheckCheck,
  Send,
  Calendar,
  Layers,
  MapPin,
  ShieldCheck,
  Tag,
  DollarSign,
  AlertCircle,
  LayoutGrid,
  ListFilter,
  ArrowRight,
  Eye,
} from "lucide-react";
import { MaintenanceTicket, TicketStatus, TicketUrgency } from "@/types/maintenance";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PROPERTY } from "@/lib/constants";
import { tenantService } from "@/modules/tenants/services/tenantService";
import { Tenant } from "@/types/tenant";

interface MaintenanceManagementSectionProps {
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

export const MaintenanceManagementSection: React.FC<MaintenanceManagementSectionProps> = ({
  onShowToast,
}) => {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode Tampilan: Papan Kanban (board) vs Tabel Ringkas (table)
  const [viewMode, setViewMode] = useState<"board" | "table">("board");

  // State Tiket Kerusakan
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<string>("all");

  // Selected Ticket for Modal / Drawer Detail
  const [activeTicket, setActiveTicket] = useState<MaintenanceTicket | null>(null);

  // Edit / Action State for Modal
  const [modalStatus, setModalStatus] = useState<TicketStatus>("diproses");
  const [modalTechnician, setModalTechnician] = useState("");
  const [modalArrival, setModalArrival] = useState("");
  const [modalCost, setModalCost] = useState("0");
  const [modalNote, setModalNote] = useState("");
  const [uploadedReceiptName, setUploadedReceiptName] = useState<string | null>(null);

  // Other Modals
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSpkModalOpen, setIsSpkModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  // Form Tiket Baru
  const [newTicketData, setNewTicketData] = useState({
    title: "",
    description: "",
    urgency: "urgent" as TicketUrgency,
    tenant_id: "",
    tenant_name: "",
    room_number: "",
    floor: "",
    access_permission: "Diizinkan (Kunci di Pos Keamanan)",
    tenant_phone: "",
    assigned_technician: "",
    repair_cost: 0,
  });

  // Memuat tiket kerusakan & daftar penghuni aktif dari database
  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("maintenance_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTickets((data || []) as MaintenanceTicket[]);
      setLoadError(null);
    } catch (err: any) {
      console.error("Gagal memuat tiket kerusakan:", err);
      setLoadError(err?.message || "Gagal memuat data");
      onShowToast?.(`Gagal memuat laporan kerusakan: ${err?.message || "kesalahan jaringan"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    tenantService
      .getTenants("active")
      .then(setTenants)
      .catch((err) => console.error("Gagal memuat penghuni:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simpan perubahan tiket ke database, lalu sinkronkan state dengan baris hasil update
  const persistTicket = async (
    ticketId: string,
    changes: Partial<MaintenanceTicket>
  ): Promise<MaintenanceTicket | null> => {
    const { data, error } = await supabase
      .from("maintenance_tickets")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", ticketId)
      .select()
      .single();
    if (error) {
      onShowToast?.(`Gagal menyimpan perubahan tiket: ${error.message}`, "error");
      return null;
    }
    const saved = data as MaintenanceTicket;
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? saved : t)));
    return saved;
  };

  // Open Ticket Detail Modal
  const handleOpenTicketDetail = (ticket: MaintenanceTicket) => {
    setActiveTicket(ticket);
    setModalStatus(ticket.status);
    setModalTechnician(ticket.assigned_technician || "");
    setModalArrival(ticket.estimated_arrival || "");
    setModalCost(String(ticket.repair_cost || 0));
    setModalNote(ticket.completion_note || "");
    setUploadedReceiptName(null);
  };

  // Quick Action: Tandai Selesai Langsung
  const handleQuickMarkResolved = async (ticketId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const saved = await persistTicket(ticketId, { status: "selesai", status_label: "Selesai" });
    if (!saved) return;
    if (activeTicket?.id === ticketId) {
      setActiveTicket(saved);
      setModalStatus("selesai");
    }
    onShowToast?.("Tiket berhasil diselesaikan.", "success");
  };

  // Quick Action: Pindahkan ke Diproses
  const handleQuickProcess = async (ticketId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const saved = await persistTicket(ticketId, { status: "diproses", status_label: "Sedang Diproses" });
    if (!saved) return;
    if (activeTicket?.id === ticketId) {
      setActiveTicket(saved);
      setModalStatus("diproses");
    }
    onShowToast?.("Laporan telah dialihkan ke pengerjaan teknisi (Diproses).", "info");
  };

  // Save Modal Changes
  const handleSaveModalTreatment = async () => {
    if (!activeTicket) return;
    const saved = await persistTicket(activeTicket.id, {
      status: modalStatus,
      assigned_technician: modalTechnician,
      estimated_arrival: modalArrival,
      repair_cost: Number(modalCost) || 0,
      completion_note: modalNote,
    });
    if (!saved) return;
    setActiveTicket(null);
    onShowToast?.(`Tiket ${saved.ticket_code} berhasil diperbarui!`, "success");
  };

  // WhatsApp Penghuni
  const handleOpenWhatsAppTenant = (ticket: MaintenanceTicket) => {
    const phone = ticket.tenant_phone?.replace(/\D/g, "") || "";
    if (!phone) {
      onShowToast?.("Nomor WhatsApp penghuni belum tercatat.", "error");
      return;
    }
    const cleanPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
    const msg = encodeURIComponent(
      `Halo Kak ${ticket.tenant_name}, terkait laporan kendala "${ticket.title}" di kamar ${ticket.room_number}, teknisi kami (${ticket.assigned_technician || modalTechnician}) dijadwalkan tiba ${ticket.estimated_arrival || modalArrival}. Terima kasih! 🙏 - ${DEFAULT_PROPERTY.name || "Kost Yusi"}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  // WhatsApp Teknisi
  const handleContactTechnician = (ticket: MaintenanceTicket) => {
    const msg = encodeURIComponent(
      `SURAT PERINTAH KERJA (SPK)\nKost: ${DEFAULT_PROPERTY.name || "Kost Yusi"}\nPemilik: ${DEFAULT_PROPERTY.ownerName || "Arifa Andya Nafiisa"}\n\nHalo ${ticket.assigned_technician || modalTechnician}, mohon tindak lanjuti kendala:\n- No. Tiket: ${ticket.ticket_code}\n- Lokasi: ${ticket.area_location}\n- Kendala: ${ticket.title}\n- Deskripsi: "${ticket.description}"\n- Izin Akses: ${ticket.access_permission}\n- Est. Waktu Servis: ${ticket.estimated_arrival || modalArrival}\n\nTerima kasih!`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    onShowToast?.("Membuka WhatsApp penugasan teknisi...", "info");
  };

  // Buat Laporan Baru (disimpan ke database)
  const handleCreateNewTicket = async () => {
    if (!newTicketData.title.trim()) {
      onShowToast?.("Judul kendala wajib diisi!", "error");
      return;
    }
    if (!newTicketData.tenant_name.trim() || !newTicketData.room_number.trim()) {
      onShowToast?.("Pilih penghuni pelapor terlebih dahulu.", "error");
      return;
    }

    const now = new Date();
    const urgencyLabels: Record<TicketUrgency, string> = {
      urgent: "URGENSI TINGGI (< 3 jam)",
      medium: "SEDANG (1x24 jam)",
      low: "RINGAN",
    };
    const maxCode = tickets.reduce((max, t) => {
      const n = parseInt(t.ticket_code.replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);

    const { data, error } = await supabase
      .from("maintenance_tickets")
      .insert({
        ticket_code: `#TK-${String(maxCode + 1).padStart(4, "0")}`,
        tenant_id: newTicketData.tenant_id || null,
        location_type: "pribadi",
        title: newTicketData.title.trim(),
        description: newTicketData.description.trim() || "Laporan dicatat langsung oleh pengelola kos.",
        urgency: newTicketData.urgency,
        urgency_label: urgencyLabels[newTicketData.urgency],
        status: "baru",
        status_label: "Menunggu Respon",
        tenant_name: newTicketData.tenant_name,
        tenant_avatar: newTicketData.tenant_name.slice(0, 2).toUpperCase(),
        room_number: newTicketData.room_number,
        floor: newTicketData.floor || null,
        access_permission: newTicketData.access_permission,
        tenant_phone: newTicketData.tenant_phone || null,
        area_location: `Kamar ${newTicketData.room_number}${newTicketData.floor ? " • " + newTicketData.floor : ""}`,
        created_time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        created_date_str: now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        assigned_technician: newTicketData.assigned_technician || null,
        repair_cost: Number(newTicketData.repair_cost) || 0,
      })
      .select()
      .single();

    if (error) {
      onShowToast?.(`Gagal menyimpan laporan: ${error.message}`, "error");
      return;
    }

    const created = data as MaintenanceTicket;
    setTickets((prev) => [created, ...prev]);
    setNewTicketData((prev) => ({ ...prev, title: "", description: "", tenant_id: "", tenant_name: "", room_number: "", floor: "", tenant_phone: "" }));
    setIsNewTicketModalOpen(false);
    onShowToast?.(`Laporan ${created.ticket_code} berhasil ditambahkan!`, "success");
  };

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    const matchUrgency =
      selectedUrgencyFilter === "all" || t.urgency === selectedUrgencyFilter;

    const q = searchQuery.toLowerCase();
    const matchSearch =
      t.ticket_code.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.tenant_name.toLowerCase().includes(q) ||
      t.room_number.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q));

    return matchUrgency && matchSearch;
  });

  // Grouped by Kanban Columns
  const pendingTickets = filteredTickets.filter(
    (t) => t.status === "baru" || (t.status === "diproses" && t.urgency === "urgent")
  );
  const inProgressTickets = filteredTickets.filter(
    (t) => t.status === "diproses" && t.urgency !== "urgent"
  );
  const resolvedTickets = filteredTickets.filter(
    (t) => t.status === "selesai" || t.status === "ditolak"
  );

  // Counts
  const urgentCount = tickets.filter((t) => t.urgency === "urgent").length;
  const inProgressCount = tickets.filter((t) => t.status === "diproses").length;
  const resolvedCount = tickets.filter((t) => t.status === "selesai").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Ringkas & Tombol Buat Laporan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Laporan Kerusakan & Fasilitas
            </h1>
            {urgentCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                {urgentCount} Perlu Ditangani Segera
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 leading-relaxed">
            Pantau dan tindak lanjuti laporan perbaikan kamar secara jelas, cepat, dan transparan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {/* View Mode Toggle: Kanban vs Tabel */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === "board"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tampilan Papan Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Papan Status</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Tampilan Daftar Tabel"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Daftar Tabel</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsNewTicketModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Catat Laporan</span>
          </button>
        </div>
      </div>

      {/* 2. Ringkasan Status 3 Langkah (Sangat Mudah Dipahami) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Kolom 1: Butuh Ditangani */}
        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                TAHAP 1: BUTUH TINDAKAN
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {pendingTickets.length} Laporan
              </h3>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-700 bg-white/80 px-2.5 py-1 rounded-lg border border-rose-200">
            {urgentCount} Urgent
          </span>
        </div>

        {/* Kolom 2: Sedang Dikerjakan */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                TAHAP 2: DIKERJAKAN TEKNISI
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {inProgressCount} Laporan
              </h3>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200">
            Jadwal Aktif
          </span>
        </div>

        {/* Kolom 3: Selesai */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                TAHAP 3: SELESAI & TUNTAS
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {resolvedCount} Laporan
              </h3>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
            {(() => {
              const rated = tickets.filter((t) => t.status === "selesai" && typeof t.rating === "number");
              if (rated.length === 0) return "Belum ada penilaian";
              const avg = rated.reduce((a, t) => a + Number(t.rating), 0) / rated.length;
              return `Rata-rata ${avg.toFixed(1)} / 5`;
            })()}
          </span>
        </div>
      </div>

      {/* 3. Bar Filter & Pencarian Bersih */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 pl-1">
            Filter Urgensi:
          </span>
          {[
            { id: "all", label: "Semua Urgensi" },
            { id: "urgent", label: "🔴 Urgent Saja" },
            { id: "medium", label: "🟡 Sedang" },
            { id: "low", label: "🟢 Ringan" },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setSelectedUrgencyFilter(pill.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedUrgencyFilter === pill.id
                  ? "bg-[#4f46e5] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode tiket, kamar, kendala..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* 4. TAMPILAN 1: PAPAN STATUS KANBAN (SANGAT MUDAH DIPAHAMI) */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* KOLOM 1: Perlu Tindakan Segera */}
          <div className="bg-slate-50/70 rounded-3xl p-4 border border-rose-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Perlu Ditangani Segera
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                {pendingTickets.length}
              </span>
            </div>

            <div className="space-y-3">
              {pendingTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  Tidak ada laporan tertunda 🎉
                </div>
              ) : (
                pendingTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleOpenTicketDetail(t)}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer space-y-3 group"
                  >
                    {/* Header Card */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {t.ticket_code}
                      </span>
                      {t.urgency === "urgent" ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          ● Urgent (&lt; 3 Jam)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          ● Sedang
                        </span>
                      )}
                    </div>

                    {/* Judul & Kamar */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    </div>

                    {/* Info Pelapor */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold text-[11px]">{t.room_number}</span>
                        <span className="text-[10px] text-slate-400">({t.tenant_name.split(" ")[0]})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{t.created_time}</span>
                    </div>

                    {/* Quick Button */}
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTicketDetail(t);
                        }}
                        className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Tugaskan & Jadwalkan</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* KOLOM 2: Sedang Diproses (Dikerjakan Teknisi) */}
          <div className="bg-slate-50/70 rounded-3xl p-4 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Sedang Dikerjakan Teknisi
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                {inProgressTickets.length}
              </span>
            </div>

            <div className="space-y-3">
              {inProgressTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  Tidak ada perbaikan yang berjalan.
                </div>
              ) : (
                inProgressTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleOpenTicketDetail(t)}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {t.ticket_code}
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Diproses
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    </div>

                    {/* Teknisi & Jadwal */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Teknisi:</span>
                        <span className="font-bold text-slate-800">{t.assigned_technician}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Jadwal:</span>
                        <span className="font-semibold text-blue-700">{t.estimated_arrival}</span>
                      </div>
                    </div>

                    {/* Tombol Selesaikan Langsung */}
                    <button
                      type="button"
                      onClick={(e) => handleQuickMarkResolved(t.id, e)}
                      className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Tandai Selesai ✓</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* KOLOM 3: Selesai & Tuntas */}
          <div className="bg-slate-50/70 rounded-3xl p-4 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Selesai & Riwayat Tuntas
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {resolvedTickets.length}
              </span>
            </div>

            <div className="space-y-3">
              {resolvedTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  Belum ada tiket yang selesai.
                </div>
              ) : (
                resolvedTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleOpenTicketDetail(t)}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {t.ticket_code}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tuntas
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                        {t.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                        <span>{t.room_number} • {t.tenant_name.split(" ")[0]}</span>
                        <span className="font-bold text-slate-900">
                          Rp {(t.repair_cost || 0).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {t.rating && (
                      <div className="flex items-center justify-between text-xs bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                        <span className="text-[10px] font-medium text-amber-800">
                          Review Penghuni:
                        </span>
                        <span className="text-amber-600 font-bold flex items-center gap-1 text-[11px]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {t.rating} ({t.feedback_note || "Puas"})
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAMPILAN 2: DAFTAR TABEL TERSTRUKTUR */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode & Judul Kendala</th>
                  <th className="py-3 px-4">Kamar & Pelapor</th>
                  <th className="py-3 px-4">Urgensi</th>
                  <th className="py-3 px-4">Teknisi Bertugas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Biaya</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => handleOpenTicketDetail(t)}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] font-bold text-indigo-700 block">
                        {t.ticket_code}
                      </span>
                      <span className="font-bold text-slate-900 block max-w-xs truncate">
                        {t.title}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{t.room_number}</span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[120px]">
                        {t.tenant_name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {t.urgency === "urgent" ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          Urgent
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-semibold block truncate max-w-[140px]">
                        {t.assigned_technician || "-"}
                      </span>
                      <span className="text-[10px] text-slate-400">{t.estimated_arrival}</span>
                    </td>
                    <td className="py-3 px-4">
                      {t.status === "selesai" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          ✓ Selesai
                        </span>
                      ) : t.status === "diproses" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          Diproses
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                          Baru
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {t.repair_cost ? `Rp ${t.repair_cost.toLocaleString("id-ID")}` : "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTicketDetail(t);
                        }}
                        className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition cursor-pointer"
                      >
                        Buka
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. MODAL UTAMA: DETAIL TIKET & TINDAK LANJUT (BERSIH & TERORGANISIR) */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {activeTicket.ticket_code}
                  </span>
                  {activeTicket.urgency === "urgent" ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                      URGENT (&lt; 3 JAM)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      NORMAL
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1.5 leading-snug">
                  {activeTicket.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dilaporkan pada {activeTicket.created_date_str}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bagian 1: Pelapor & Lokasi Kamar */}
            <div className="bg-[#f8faff] rounded-2xl p-4 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  PELAPOR & LOKASI:
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeTicket.tenant_name} • {activeTicket.room_number} ({activeTicket.floor})
                </h4>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                    <Key className="w-3 h-3" />
                    {activeTicket.access_permission}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenWhatsAppTenant(activeTicket)}
                className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat WhatsApp</span>
              </button>
            </div>

            {/* Bagian 2: Deskripsi & Foto Bukti */}
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Keterangan Kendala:
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed font-normal">
                  "{activeTicket.description}"
                </p>
              </div>

              {activeTicket.photo_url && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Foto Bukti Kerusakan:
                  </span>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900 max-h-48 aspect-21/9">
                    <img
                      src={activeTicket.photo_url}
                      alt="Bukti Kerusakan"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-white text-xs font-mono drop-shadow-sm">
                        {activeTicket.photo_name || "foto_bukti.jpg"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPhotoModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-xs font-bold transition cursor-pointer"
                      >
                        Perbesar Foto
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bagian 3: Formulir Eksekusi & Penugasan Teknisi */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block pb-2 border-b border-slate-200">
                PENGATURAN STATUS & TEKNISI
              </span>

              {/* Status Radio / Buttons */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Status Tiket Saat Ini:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "baru", label: "Baru (Antrean)" },
                    { id: "diproses", label: "Sedang Diproses" },
                    { id: "selesai", label: "Selesai (Tuntas)" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setModalStatus(s.id as TicketStatus)}
                      className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        modalStatus === s.id
                          ? "bg-[#4f46e5] text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teknisi & Estimasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Teknisi Ditugaskan:
                  </label>
                  <input
                    type="text"
                    list="technician-options"
                    value={modalTechnician}
                    onChange={(e) => setModalTechnician(e.target.value)}
                    placeholder="Nama teknisi"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                  />
                  <datalist id="technician-options">
                    {Array.from(new Set(tickets.map((t) => t.assigned_technician).filter(Boolean))).map((name) => (
                      <option key={name} value={name as string} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Estimasi Kedatangan / Waktu Servis:
                  </label>
                  <input
                    type="text"
                    value={modalArrival}
                    onChange={(e) => setModalArrival(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Biaya & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Biaya Perbaikan / Sparepart (Rp):
                  </label>
                  <input
                    type="number"
                    value={modalCost}
                    onChange={(e) => setModalCost(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Catatan Solusi Perbaikan:
                  </label>
                  <input
                    type="text"
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    placeholder="Contoh: Pipa AC dibersihkan & freon diisi"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleContactTechnician(activeTicket)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kirim SPK ke WA Teknisi</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTicket(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalTreatment}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL BUAT LAPORAN BARU */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Catat Kendala Kamar Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Judul Kendala / Kerusakan *
                </label>
                <input
                  type="text"
                  value={newTicketData.title}
                  onChange={(e) => setNewTicketData({ ...newTicketData, title: e.target.value })}
                  placeholder="Contoh: Lampu kamar mandi mati"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Penghuni Pelapor *
                </label>
                <select
                  value={newTicketData.tenant_id}
                  onChange={(e) => {
                    const t = tenants.find((x) => x.id === e.target.value);
                    setNewTicketData({
                      ...newTicketData,
                      tenant_id: e.target.value,
                      tenant_name: t?.full_name || "",
                      room_number: t?.room_number || "",
                      floor: t?.floor || "",
                      tenant_phone: t?.phone || "",
                    });
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="">Pilih penghuni…</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} — Kamar {t.room_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Tingkat Urgensi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "urgent", label: "Urgent (< 3 jam)" },
                    { id: "medium", label: "Sedang" },
                    { id: "low", label: "Ringan" },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() =>
                        setNewTicketData({ ...newTicketData, urgency: u.id as TicketUrgency })
                      }
                      className={`p-2 rounded-xl text-center font-bold text-[11px] transition cursor-pointer ${
                        newTicketData.urgency === u.id
                          ? "bg-rose-50 text-rose-700 border border-rose-300"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Deskripsi Kendala
                </label>
                <textarea
                  rows={3}
                  value={newTicketData.description}
                  onChange={(e) =>
                    setNewTicketData({ ...newTicketData, description: e.target.value })
                  }
                  placeholder="Keterangan singkat..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateNewTicket}
                className="px-5 py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                Simpan Laporan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL ZOOM FOTO */}
      {isPhotoModalOpen && activeTicket && activeTicket.photo_url && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 space-y-3 relative shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 truncate">
                Foto Bukti: {activeTicket.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
              <img
                src={activeTicket.photo_url}
                alt="Foto Kerusakan"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
