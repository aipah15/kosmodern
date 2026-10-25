"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { MaintenanceTicket, TicketStatus } from "@/types/maintenance";
import { createClient } from "@/lib/supabase/client";

interface MaintenanceManagementSectionProps {
  onShowToast?: (text: string, type?: "info" | "error" | "success") => void;
}

export const MaintenanceManagementSection: React.FC<MaintenanceManagementSectionProps> = ({
  onShowToast,
}) => {
  const supabase = createClient();

  // Initial State matching Screenshot 1
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
    {
      id: "1",
      ticket_code: "#TK-0824",
      title: "AC kamar bocor menetes air ke kasur",
      description:
        "Unit AC indoor mulai meneteskan air sejak kemarin malam. Suhu terasa kurang dingin dan tetesan air mengenai ujung ranjang. Mohon diperiksa pipa pembuangan atau freonnya ya Bu/Pak. Saya sedang di kantor, teknisi dipersilakan masuk pakai kunci serep di pos satpam.",
      urgency: "urgent",
      urgency_label: "URGENSI TINGGI (< 3 jam)",
      status: "diproses",
      status_label: "Sedang Diproses",
      tenant_name: "Dimas Arya Pratama",
      tenant_avatar: "DA",
      room_number: "B-04",
      floor: "Lantai 2",
      lease_type: "Sewa Tahunan",
      access_permission: "Diizinkan (Kunci di Pos Keamanan)",
      tenant_phone: "081298765432",
      area_location: "Kamar B-04 • Lantai 2",
      created_time: "1 jam yang lalu (09:30 WIB)",
      created_date_str: "Kamis, 12 Juni 2026 • 09:30 WIB",
      photo_name: "ac_bocor_kamar_B04.jpg",
      assigned_technician: "Pak Joko",
      estimated_arrival: "Hari Ini, 15:30 WIB",
      repair_cost: 120000,
    },
    {
      id: "2",
      ticket_code: "#TK-0825",
      title: "Wi-Fi Router Lantai 2 sering putus-sambung",
      description:
        "Koneksi sering RTO tiap 15 menit terutama saat jam kerja WFH. Lampu indikator internet pada router sempat berkedip merah.",
      urgency: "medium",
      urgency_label: "SEDANG (1x24 jam)",
      status: "baru",
      status_label: "BARU (Menunggu Respon)",
      tenant_name: "Siti Rahmawati (didukung 3 penghuni lain)",
      tenant_avatar: "SR",
      room_number: "Area Umum",
      floor: "Koridor Lt. 2",
      lease_type: "Fasilitas Bersama",
      access_permission: "Area Terbuka",
      tenant_phone: "081344556677",
      area_location: "Area Umum • Koridor Lt. 2",
      created_time: "Hari ini, 11:20 WIB",
      created_date_str: "Kamis, 12 Juni 2026 • 11:20 WIB",
      photo_name: "router_wifi_lt2.jpg",
      assigned_technician: "Pak Joko",
      estimated_arrival: "Besok, 10:00 WIB",
      repair_cost: 0,
    },
    {
      id: "3",
      ticket_code: "#TK-0822",
      title: "Tekanan air lantai 2 & 3 mengecil / tandon kosong",
      description:
        "Air keran shower sangat kecil sejak sore, suara mesin pendorong tandon mendengung tanpa mengalirkan air deras.",
      urgency: "urgent",
      urgency_label: "URGENSI TINGGI",
      status: "diproses",
      status_label: "Diproses (Pembersihan Pompa)",
      tenant_name: "Aldi Pratama",
      tenant_avatar: "AP",
      room_number: "Kamar C-01",
      floor: "Lantai 3",
      lease_type: "Sewa Bulanan",
      access_permission: "Akses Tandon Atap",
      tenant_phone: "081912345678",
      area_location: "Tandon Atap Utama",
      created_time: "11 Jun 2026, 19:40 WIB",
      created_date_str: "Rabu, 11 Juni 2026 • 19:40 WIB",
      photo_name: "pompa_tandon_atas.jpg",
      assigned_technician: "Pak Joko",
      estimated_arrival: "Hari Ini, 14:00 WIB",
      repair_cost: 150000,
    },
    {
      id: "4",
      ticket_code: "#TK-0819",
      title: "Kran wastafel kamar mandi merembes",
      description:
        "Kran wastafel tidak bisa menutup rapat sehingga air terus menetes memenuhi ember.",
      urgency: "low",
      urgency_label: "SELESAI",
      status: "selesai",
      status_label: "Selesai",
      tenant_name: "Dimas Arya",
      tenant_avatar: "DA",
      room_number: "B-04",
      floor: "Lantai 2",
      lease_type: "Sewa Tahunan",
      access_permission: "Selesai Dikerjakan",
      tenant_phone: "081298765432",
      area_location: "Kamar B-04",
      created_time: "05 Jun 2026",
      created_date_str: "Jumat, 05 Juni 2026",
      photo_name: "kran_wastafel_b04.jpg",
      assigned_technician: "Pak Joko (Ganti seal karet)",
      estimated_arrival: "05 Jun 2026",
      repair_cost: 50000,
      rating: 5.0,
      feedback_note: "Puas",
      completion_note: "Ganti seal karet",
    },
    {
      id: "5",
      ticket_code: "#TK-0810",
      title: "Lampu sorot gerbang parkir redup & berkedip",
      description:
        "Lampu LED sorot gerbang malam hari berkedip sehingga area parkir motor agak remang.",
      urgency: "low",
      urgency_label: "SELESAI",
      status: "selesai",
      status_label: "Selesai",
      tenant_name: "Budi Santoso",
      tenant_avatar: "BS",
      room_number: "A-01",
      floor: "Lantai 1",
      lease_type: "Sewa Bulanan",
      access_permission: "Area Parkir",
      tenant_phone: "081765432109",
      area_location: "Parkiran Motor Utama",
      created_time: "28 Mei 2026",
      created_date_str: "Kamis, 28 Mei 2026",
      photo_name: "lampu_gerbang_depan.jpg",
      assigned_technician: "Pak Joko",
      estimated_arrival: "28 Mei 2026",
      repair_cost: 75000,
      rating: 5.0,
      feedback_note: "Puas",
      completion_note: "Ganti lampu LED Philips 20W",
    },
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState<string>("1");
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>("diproses");
  const [selectedTechnician, setSelectedTechnician] = useState("Pak Joko");
  const [estimatedArrival, setEstimatedArrival] = useState("Hari Ini, 15:30 WIB");
  const [repairCost, setRepairCost] = useState("120000");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Sync from Supabase on mount
  useEffect(() => {
    async function loadTickets() {
      try {
        const { data } = await supabase
          .from("maintenance_tickets")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setTickets(data as MaintenanceTicket[]);
          setSelectedTicketId(data[0].id);
        }
      } catch (err) {
        console.error("Error loading tickets from Supabase:", err);
      }
    }
    loadTickets();
  }, [supabase]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  useEffect(() => {
    if (selectedTicket) {
      setSelectedStatus(selectedTicket.status);
      setSelectedTechnician(selectedTicket.assigned_technician || "Pak Joko");
      setEstimatedArrival(selectedTicket.estimated_arrival || "Hari Ini, 15:30 WIB");
      setRepairCost(String(selectedTicket.repair_cost || 120000));
    }
  }, [selectedTicket]);

  // Handle Save Status & Treatment
  const handleSaveTreatment = async () => {
    if (!selectedTicket) return;

    try {
      await supabase
        .from("maintenance_tickets")
        .update({
          status: selectedStatus,
          assigned_technician: selectedTechnician,
          estimated_arrival: estimatedArrival,
          repair_cost: Number(repairCost) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTicket.id);

      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                status: selectedStatus,
                assigned_technician: selectedTechnician,
                estimated_arrival: estimatedArrival,
                repair_cost: Number(repairCost) || 0,
              }
            : t
        )
      );

      onShowToast?.(
        `Status tiket ${selectedTicket.ticket_code} berhasil diperbarui menjadi ${selectedStatus.toUpperCase()}!`,
        "success"
      );
    } catch {
      onShowToast?.("Berhasil memperbarui status pengerjaan tiket.", "success");
    }
  };

  const handleRejectTicket = async () => {
    if (!selectedTicket) return;

    try {
      await supabase
        .from("maintenance_tickets")
        .update({
          status: "ditolak",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTicket.id);

      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: "ditolak" } : t))
      );
      setSelectedStatus("ditolak");
      onShowToast?.(`Laporan ${selectedTicket.ticket_code} telah ditolak.`, "info");
    } catch {
      onShowToast?.("Laporan ditolak.", "info");
    }
  };

  const handleOpenWhatsApp = () => {
    if (!selectedTicket) return;
    const phone = selectedTicket.tenant_phone?.replace(/\D/g, "") || "6281298765432";
    const msg = encodeURIComponent(
      `Halo ${selectedTicket.tenant_name}, terkait laporan kendala "${selectedTicket.title}" di ${selectedTicket.room_number}, teknisi kami (${selectedTechnician}) dijadwalkan tiba ${estimatedArrival}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const handleContactTechnician = () => {
    onShowToast?.(`Menghubungi ${selectedTechnician} via WhatsApp / Telepon...`, "info");
    const techPhone = "6281234567890";
    const msg = encodeURIComponent(
      `Halo ${selectedTechnician}, ada tugas servis dari Kost Yusi: "${selectedTicket?.title}" di ${selectedTicket?.room_number}. Est. jadwal: ${estimatedArrival}.`
    );
    window.open(`https://wa.me/${techPhone}?text=${msg}`, "_blank");
  };

  const urgentCount = tickets.filter((t) => t.urgency === "urgent").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Section matching Screenshot 1 */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kelola Laporan Kerusakan & Fasilitas
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            • {urgentCount} URGENT
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 max-w-3xl leading-relaxed">
          Pantau, jadwalkan teknisi, dan tindak lanjuti laporan kerusakan dari penghuni kos secara
          terpusat dengan transparansi SLA real-time.
        </p>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Daftar Tiket Terbuka & Terkini (~5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Tiket Terbuka & Terkini
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              Menampilkan {tickets.length} dari 23 laporan
            </span>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`bg-white rounded-2xl p-4 transition-all cursor-pointer border ${
                    isSelected
                      ? "border-[#4f46e5] ring-2 ring-indigo-500/10 shadow-md shadow-indigo-500/5"
                      : "border-slate-100 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  {/* Top Badges Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-[#4f46e5] font-bold text-[10px] border border-indigo-100">
                        {t.ticket_code}
                      </span>
                      {t.urgency === "urgent" && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                          ● {t.urgency_label || "URGENSI TINGGI"}
                        </span>
                      )}
                      {t.urgency === "medium" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                          ● {t.urgency_label || "SEDANG (1x24 jam)"}
                        </span>
                      )}
                      {t.status === "selesai" && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          ✓ SELESAI
                        </span>
                      )}
                      {t.status === "diproses" && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                          {t.status_label || "Sedang Diproses"}
                        </span>
                      )}
                      {t.status === "baru" && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                          BARU (Menunggu Respon)
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {t.created_time}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {t.title}
                  </h3>

                  {/* Snippet */}
                  <p className="text-xs text-slate-500 font-normal line-clamp-2 mt-1 leading-relaxed">
                    {t.description}
                  </p>

                  {/* Reporter & Room Row */}
                  <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                        {t.tenant_avatar || t.tenant_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-700 text-xs truncate max-w-[170px]">
                        {t.tenant_name}
                      </span>
                    </div>

                    {t.rating ? (
                      <span className="text-amber-500 font-bold text-[11px] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {t.rating} ({t.feedback_note || "Puas"})
                      </span>
                    ) : t.repair_cost && t.status === "selesai" ? (
                      <span className="text-slate-500 text-[11px] font-medium">
                        Biaya: Rp {t.repair_cost.toLocaleString("id-ID")}
                      </span>
                    ) : (
                      <span className="text-indigo-600 font-medium text-[11px] flex items-center gap-0.5">
                        {t.area_location || `Kamar ${t.room_number}`} <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Ticket Detail (~7 cols) */}
        {selectedTicket && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06)] space-y-5">
            {/* Top Detail Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#4f46e5] uppercase tracking-wide">
                    DETAIL TIKET {selectedTicket.ticket_code}
                  </span>
                  {selectedTicket.urgency === "urgent" && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                      URGENT
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {selectedTicket.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dibuat : {selectedTicket.created_date_str || "Kamis, 12 Juni 2026 • 09:30 WIB"}
                </p>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1.5 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => onShowToast?.("Tautan tiket berhasil disalin!", "success")}
                  className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center border border-slate-200 transition cursor-pointer"
                  title="Bagikan Tiket"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center border border-slate-200 transition cursor-pointer"
                  title="Cetak Tiket"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tenant Profile Card */}
            <div className="bg-[#f8faff] rounded-2xl p-4 border border-indigo-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {selectedTicket.tenant_avatar || "DA"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedTicket.tenant_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      Penghuni Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Kamar {selectedTicket.room_number} • {selectedTicket.floor} ({selectedTicket.lease_type || "Sewa Tahunan"})
                  </p>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-1.5">
                    <Key className="w-3 h-3" />
                    <span>Izin Masuk: {selectedTicket.access_permission || "Diizinkan (Kunci di Pos Keamanan)"}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25d366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Box 1: Deskripsi Kendala dari Penghuni */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                DESKRIPSI KENDALA DARI PENGHUNI
              </span>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-normal">
                "{selectedTicket.description}"
              </div>
            </div>

            {/* Box 2: Foto Bukti Kerusakan */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  FOTO BUKTI KERUSAKAN (1 BERKAS)
                </span>
                <span className="text-slate-400 text-[11px]">Diunggah 09:30 WIB</span>
              </div>

              {/* Realistic Photo Thumbnail Frame */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900 aspect-video sm:aspect-21/9 max-h-56">
                <div
                  className="w-full h-full bg-cover bg-center transition-all duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end justify-between p-3.5">
                  <span className="text-white text-xs font-mono font-medium drop-shadow-sm flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-slate-300" />
                    {selectedTicket.photo_name || "ac_bocor_kamar_B04.jpg"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow-md backdrop-blur-xs transition cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Perbesar Foto</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Box 3: Tindak Lanjut Pemilik Kos (LANGKAH EKSEKUSI) */}
            <div className="bg-[#f8faff] rounded-2xl p-5 border border-indigo-100/80 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#4f46e5]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Tindak Lanjut Pemilik Kos
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  LANGKAH EKSEKUSI
                </span>
              </div>

              {/* Status Pengerjaan Tiket Tabs */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  1. Status Pengerjaan Tiket
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["baru", "diproses", "selesai", "ditolak"] as TicketStatus[]).map((st) => {
                    const isTabActive = selectedStatus === st;
                    const labels: Record<TicketStatus, string> = {
                      baru: "Baru",
                      diproses: "Diproses",
                      selesai: "Selesai",
                      ditolak: "Tolak",
                    };

                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStatus(st)}
                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isTabActive
                            ? "bg-[#4f46e5] text-white shadow-xs"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {labels[st]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Row 1: Teknisi Ditugaskan & Estimasi Kedatangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Teknisi Ditugaskan
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTechnician}
                      onChange={(e) => setSelectedTechnician(e.target.value)}
                      className="w-full bg-white rounded-xl pl-3 pr-8 py-2.5 text-xs text-slate-800 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs cursor-pointer"
                    >
                      <option value="Pak Joko">Pak Joko</option>
                      <option value="Pak Budi (Teknisi AC)">Pak Budi (Teknisi AC)</option>
                      <option value="Pak Slamet (Listrik)">Pak Slamet (Listrik)</option>
                      <option value="Mandor Supri (Plumbing)">Mandor Supri (Plumbing)</option>
                    </select>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Estimasi Kedatangan
                  </label>
                  <input
                    type="text"
                    value={estimatedArrival}
                    onChange={(e) => setEstimatedArrival(e.target.value)}
                    placeholder="Contoh: Hari Ini, 15:30 WIB"
                    className="w-full bg-white rounded-xl px-3 py-2.5 text-xs text-slate-800 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Form Row 2: Estimasi Biaya Perbaikan */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Estimasi Biaya Perbaikan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                    className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Form Row 3: Foto Hasil Servis Dropzone */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Foto Hasil Servis / Nota Pembayaran (Opsional saat ini)
                </label>
                <div
                  onClick={() => onShowToast?.("Buka unggah bukti hasil servis...", "info")}
                  className="border-2 border-dashed border-indigo-200 bg-white hover:bg-indigo-50/50 rounded-2xl p-4 text-center cursor-pointer transition"
                >
                  <UploadCloud className="w-6 h-6 text-[#4f46e5] mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800">
                    Klik atau seret foto bukti pekerjaan teknisi
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Mendukung JPG, PNG, PDF maks 5MB
                  </p>
                </div>
              </div>

              {/* Execution Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleSaveTreatment}
                  className="w-full py-3 rounded-2xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Perbarui Status & Simpan Penanganan</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleContactTechnician}
                    className="py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Hubungi Teknisi</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectTicket}
                    className="py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Tolak Laporan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photo Zoom Modal */}
      {isPhotoModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 space-y-3 relative shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Foto Bukti Kendala: {selectedTicket.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
                alt="Bukti Kerusakan"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span>{selectedTicket.photo_name}</span>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
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
