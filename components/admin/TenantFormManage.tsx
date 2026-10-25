"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Building,
  UserCheck,
  Calendar,
  CreditCard,
  Phone,
  Copy,
  Check,
  Send,
  Save,
  Info,
  Sparkles,
} from "lucide-react";
import { Tenant, TenantFormData } from "@/types/tenant";
import { Room } from "@/types/room";

interface TenantFormManageProps {
  tenant?: Tenant | null;
  rooms: Room[];
  onBack: () => void;
  onSave: (formData: TenantFormData, tenantId?: string) => Promise<void>;
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
}

export const TenantFormManage: React.FC<TenantFormManageProps> = ({
  tenant,
  rooms,
  onBack,
  onSave,
  onShowToast,
}) => {
  const [fullName, setFullName] = useState("");
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [checkInDate, setCheckInDate] = useState("2024-09-01");
  const [dueDateDay, setDueDateDay] = useState(1);
  const [rentAmount, setRentAmount] = useState(1500000);
  const [depositAmount, setDepositAmount] = useState(500000);

  const [invitationCode, setInvitationCode] = useState("KM-B04-9842");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available rooms for allocation (empty rooms + current tenant's room)
  const availableRoomsCount = rooms.filter(
    (r) => r.status === "available" || r.status === "kosong" || (tenant && r.room_number === tenant.room_number)
  ).length;

  useEffect(() => {
    if (tenant) {
      setFullName(tenant.full_name || "");
      setNik(tenant.nik || "");
      const cleanPhone = tenant.phone.replace(/^\+62\s*/, "").replace(/^0/, "");
      setPhone(cleanPhone);
      setEmail(tenant.email || "");
      setOccupation(
        tenant.occupation
          ? `${tenant.occupation}${tenant.institution ? `/${tenant.institution}` : ""}`
          : "Mahasiswa/Universitas Negeri Malang"
      );
      setEmergencyName(
        tenant.emergency_contact_name
          ? `${tenant.emergency_contact_name} (${tenant.emergency_contact_relation || "Keluarga"})`
          : "Bpk. Hendra Pratama (Ayah)"
      );
      setEmergencyPhone(tenant.emergency_contact_phone || "0811-9876-5432");

      // Match room
      const currentRoom = rooms.find((r) => r.room_number === tenant.room_number);
      if (currentRoom) {
        setSelectedRoomId(currentRoom.id);
        setRentAmount(Number(currentRoom.price) || 1500000);
      } else if (rooms.length > 0) {
        setSelectedRoomId(rooms[0].id);
        setRentAmount(Number(rooms[0].price) || 1500000);
      }

      setCheckInDate(tenant.check_in_date || "2024-09-01");
      setDueDateDay(tenant.due_date_day || 1);
      setDepositAmount(Number(tenant.deposit_amount) || 500000);
      setInvitationCode(tenant.invitation_code || `KM-${tenant.room_number || "B04"}-${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      // Default initial data for new tenant creation matching Image 4
      setFullName("Azka Andya Safira");
      setNik("321123456789");
      setPhone("812-3456-7890");
      setEmail("azkaandya@gmail.com");
      setOccupation("Mahasiswa/Universitas Negeri Malang");
      setEmergencyName("Bpk. Hendra Pratama (Ayah)");
      setEmergencyPhone("0811-9876-5432");

      const defaultRoom = rooms.find((r) => r.room_number === "B-04") || rooms[0];
      if (defaultRoom) {
        setSelectedRoomId(defaultRoom.id);
        setRentAmount(Number(defaultRoom.price) || 1500000);
      }
      setCheckInDate("2024-09-01");
      setDueDateDay(1);
      setDepositAmount(500000);
      setInvitationCode("KM-B04-9842");
    }
  }, [tenant, rooms]);

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setRentAmount(Number(room.price) || 1500000);
      setInvitationCode(`KM-${room.room_number.replace(/^Kamar\s+/i, "")}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const inviteUrl = `kosmodern.id/join?code=${invitationCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${inviteUrl}`);
    setCopiedLink(true);
    onShowToast("Tautan undangan digital disalin ke clipboard!", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const rawNumber = phone.replace(/[^0-9]/g, "");
    const waNumber = rawNumber.startsWith("0") ? `62${rawNumber.substring(1)}` : rawNumber.startsWith("62") ? rawNumber : `62${rawNumber}`;
    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
    const roomName = selectedRoom ? `Kamar ${selectedRoom.room_number}` : "Kamar Kost Yusi";

    const text = `Halo Kak ${fullName}, selamat datang di Kost Yusi!\n\nBerikut tautan aktivasi mandiri portal penghuni untuk ${roomName}:\nhttps://${inviteUrl}\n\nKode Undangan: ${invitationCode}\nSilakan gunakan tautan di atas untuk melengkapi profil & cek tagihan berkala. Terima kasih!`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      onShowToast("Mohon lengkapi Nama dan Nomor WhatsApp aktif.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
      const cleanPhone = phone.startsWith("0") ? phone : `0${phone.replace(/^[+62\s-]+/, "")}`;

      // Split emergency contact name & relation
      let emName = emergencyName;
      let emRel = "Orang Tua";
      const match = emergencyName.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        emName = match[1].trim();
        emRel = match[2].trim();
      }

      // Split occupation & institution
      let occ = occupation;
      let inst = "";
      if (occupation.includes("/")) {
        const parts = occupation.split("/");
        occ = parts[0].trim();
        inst = parts[1].trim();
      }

      await onSave(
        {
          full_name: fullName,
          nik: nik || undefined,
          phone: cleanPhone,
          email: email || undefined,
          occupation: occ,
          institution: inst,
          emergency_contact_name: emName,
          emergency_contact_relation: emRel,
          emergency_contact_phone: emergencyPhone,
          room_id: selectedRoomId,
          room_number: selectedRoom ? selectedRoom.room_number : "B-04",
          floor: selectedRoom ? selectedRoom.floor : "Lt. 1",
          room_type: selectedRoom ? selectedRoom.room_type : "Deluxe",
          check_in_date: checkInDate,
          due_date_day: Number(dueDateDay) || 1,
          rent_amount: Number(rentAmount),
          deposit_amount: Number(depositAmount),
          invitation_code: invitationCode,
        },
        tenant?.id
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalFirstBill = Number(rentAmount) + Number(depositAmount);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Header matching Image 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kelola Data Penghuni
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Lengkapi identitas penyewa, alokasikan kamar kosong, dan buat kode undangan digital untuk verifikasi mandiri penghuni.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar</span>
        </button>
      </div>

      {/* Two Column Form Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Informasi Pribadi & Identitas */}
        <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Informasi Pribadi &amp; Identitas
                </h3>
                <p className="text-[11px] text-slate-400">
                  Data primer penyewa kosan aktif
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              • Aktif Terverifikasi
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Azka Andya Safira"
                  className="w-full pl-3.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* NIK */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                NIK / No. KTP <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                placeholder="321123456789"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                  +62
                </span>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="812-3456-7890"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Nomor ini digunakan untuk pengiriman tagihan &amp; kode akses pintu pintar.
              </p>
            </div>

            {/* Pekerjaan */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Pekerjaan / Instansi / Kampus
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Mahasiswa/Universitas Negeri Malang"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Kontak Darurat */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">
                Kontak Darurat
              </label>
              <p className="text-[10px] text-slate-400 mb-2">
                Keluarga atau kerabat terdekat bila terjadi keadaan mendesak
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Nama Lengkap (Hubungan)"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="0811-9876-5432"
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Kamar & Jadwal Penagihan */}
        <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Kamar &amp; Jadwal Penagihan
                </h3>
                <p className="text-[11px] text-slate-400">
                  Alokasi unit, siklus jatuh tempo &amp; deposit
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4f46e5] border border-indigo-100">
              Kost Yusi
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Alokasi Kamar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Alokasi Kamar &amp; Fasilitas <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {availableRoomsCount} Kamar Kosong Siap Huni
                </span>
              </div>

              <select
                value={selectedRoomId}
                onChange={(e) => handleRoomChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Kamar {r.room_number} ({r.floor || "Lt. 1"}) • {r.facilities?.slice(0, 3).join(", ") || "AC, KM Dalam"} - Rp {Number(r.price).toLocaleString("id-ID")} / bln
                  </option>
                ))}
              </select>
            </div>

            {/* Dates: Check-In & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tanggal Masuk (Check-In) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Jatuh Tempo Tiap Tanggal
                  </label>
                  <span className="text-[10px] text-slate-400">Tiap Bulan</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dueDateDay}
                  onChange={(e) => setDueDateDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Helper Info Banner */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-indigo-900">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                Otomatis dihitung tiap tanggal 1 (mengikuti tanggal masuk, dapat disesuaikan kebutuhan).
              </span>
            </div>

            {/* Estimasi Biaya Sewa Pertama Card */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200/60">
                <span>Estimasi Biaya Sewa Pertama</span>
                <span className="text-[10px] text-slate-400 font-normal">Kalkulasi Otomatis</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Sewa Pokok Bulan Pertama:</span>
                <span className="font-bold text-slate-800">Rp {rentAmount.toLocaleString("id-ID")}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  Deposit Jaminan Awal:
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-semibold">
                    Dapat Dikembalikan
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-24 px-2 py-0.5 bg-white border border-slate-200 rounded text-right font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200/80">
                <span className="font-extrabold text-slate-900">Total Tagihan Awal Pertama:</span>
                <span className="font-black text-[#4f46e5] text-base">
                  Rp {totalFirstBill.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Aktivasi & Undangan Digital Penghuni matching Image 4 */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Aktivasi &amp; Undangan Digital Penghuni
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kirim tautan onboarding mandiri agar penyewa dapat melengkapi profil dan mengakses portal tagihan.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </>
            )}
          </button>
        </div>

        {/* Digital Invite Row */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Tautan Akses Aktivasi Mandiri Penghuni
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Berlaku 7 Hari
              </span>
            </div>

            {/* URL Box & Code */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 shadow-xs">
                <span>{inviteUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="ml-2 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                  title="Salin tautan"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <span className="text-xs font-bold text-slate-700">
                KODE: <span className="text-[#4f46e5] font-mono">{invitationCode}</span>
              </span>
            </div>
          </div>

          {/* Big Green WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex flex-col items-center justify-center px-6 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white rounded-2xl shadow-md shadow-emerald-500/20 transition cursor-pointer shrink-0 text-center"
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Bagikan via WhatsApp</span>
            </div>
            <span className="text-[10px] text-emerald-100 font-medium">
              Menggunakan template pesan resmi
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};
