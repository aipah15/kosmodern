"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building,
  Bed,
  Check,
  Plus,
  Snowflake,
  Bath,
  Flame,
  KeyRound,
  Armchair,
  DoorClosed,
  AppWindow,
  Refrigerator,
  Wifi,
  Tv,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Room, RoomFormData } from "@/types/room";
import { DEFAULT_PROPERTY } from "@/lib/constants";

interface RoomEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room | null;
  onSave: (roomData: RoomFormData, roomId?: string) => Promise<void>;
}

// Available default facilities with appropriate icons
const AVAILABLE_FACILITIES = [
  { id: "AC (Air Conditioner)", label: "AC (Air Conditioner)", shortLabel: "AC", icon: Snowflake },
  { id: "Kamar Mandi Dalam", label: "Kamar Mandi Dalam", shortLabel: "KM Dalam", icon: Bath },
  { id: "Water Heater", label: "Water Heater", shortLabel: "Water Heater", icon: Flame },
  { id: "Smart Door Lock", label: "Smart Door Lock", shortLabel: "Smart Lock", icon: KeyRound },
  { id: "Kasur Springbed", label: "Kasur Springbed", shortLabel: "Springbed", icon: Bed },
  { id: "Meja & Kursi Kerja", label: "Meja & Kursi Kerja", shortLabel: "Meja Belajar", icon: Armchair },
  { id: "Lemari Pakaian 2 Pintu", label: "Lemari Pakaian 2 Pintu", shortLabel: "Lemari Pakaian", icon: DoorClosed },
  { id: "Jendela Luar / Sirkulasi", label: "Jendela Luar / Sirkulasi", shortLabel: "Jendela Luar", icon: AppWindow },
  { id: "Kulkas Mini Pribadi", label: "Kulkas Mini Pribadi", shortLabel: "Kulkas Mini", icon: Refrigerator },
  { id: "Wi-Fi 100Mbps", label: "Wi-Fi Super Cepat 100Mbps", shortLabel: "Wi-Fi 100Mbps", icon: Wifi },
];

export const RoomEditModal: React.FC<RoomEditModalProps> = ({
  isOpen,
  onClose,
  room,
  onSave,
}) => {
  const [roomNumber, setRoomNumber] = useState("");
  const [floor, setFloor] = useState("Lantai 1");
  const [roomType, setRoomType] = useState("Deluxe AC (3×4 meter)");
  const [customRoomTypes, setCustomRoomTypes] = useState<string[]>([
    "Deluxe AC (3×4 meter)",
    "Standard Single",
    "Standard AC",
    "Suite VIP",
  ]);
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const [price, setPrice] = useState<number>(1500000);
  const [status, setStatus] = useState<"available" | "occupied" | "maintenance">("available");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [customFacilityInput, setCustomFacilityInput] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync form state when modal opens or room changes
  useEffect(() => {
    if (room) {
      setRoomNumber(room.room_number.startsWith("Kamar ") ? room.room_number : `Kamar ${room.room_number}`);
      setFloor(room.floor || "Lantai 1");
      setRoomType(room.room_type || "Deluxe AC (3×4 meter)");
      setPrice(Number(room.price) || 1500000);
      
      const st = (room.status === "occupied" || room.status === "terisi") 
        ? "occupied" 
        : (room.status === "maintenance" || room.status === "perbaikan") 
          ? "maintenance" 
          : "available";
      setStatus(st);

      // Map existing room facilities
      const matched: string[] = [];
      (room.facilities || []).forEach((f) => {
        const found = AVAILABLE_FACILITIES.find(
          (af) => af.label.toLowerCase() === f.toLowerCase() || 
                  af.shortLabel.toLowerCase() === f.toLowerCase() ||
                  af.id.toLowerCase() === f.toLowerCase()
        );
        if (found) {
          if (!matched.includes(found.id)) matched.push(found.id);
        } else {
          if (!matched.includes(f)) matched.push(f);
        }
      });
      setSelectedFacilities(matched.length > 0 ? matched : [
        "AC (Air Conditioner)",
        "Kamar Mandi Dalam",
        "Water Heater",
        "Smart Door Lock",
        "Kasur Springbed",
        "Meja & Kursi Kerja",
        "Lemari Pakaian 2 Pintu",
      ]);
      setDescription(room.description || "Posisi menghadap matahari pagi, stopkontak ganda samping ranjang, kran air baru diganti.");
    } else {
      // Defaults for new room
      setRoomNumber("Kamar B-06");
      setFloor("Lantai 2");
      setRoomType("Deluxe AC (3×4 meter)");
      setPrice(1995000);
      setStatus("available");
      setSelectedFacilities([
        "AC (Air Conditioner)",
        "Kamar Mandi Dalam",
        "Water Heater",
        "Smart Door Lock",
        "Kasur Springbed",
        "Meja & Kursi Kerja",
        "Lemari Pakaian 2 Pintu",
      ]);
      setDescription("Posisi menghadap matahari pagi, stopkontak ganda samping ranjang, kran air baru diganti.");
    }
  }, [room, isOpen]);

  if (!isOpen) return null;

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const handleAddCustomFacility = () => {
    const trimmed = customFacilityInput.trim();
    if (trimmed && !selectedFacilities.includes(trimmed)) {
      setSelectedFacilities((prev) => [...prev, trimmed]);
      setCustomFacilityInput("");
    }
  };

  const handleAddNewRoomType = () => {
    const trimmed = newTypeName.trim();
    if (trimmed && !customRoomTypes.includes(trimmed)) {
      setCustomRoomTypes((prev) => [...prev, trimmed]);
      setRoomType(trimmed);
      setNewTypeName("");
      setIsAddingType(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Clean up room number
      const cleanNumber = roomNumber.replace(/^Kamar\s+/i, "").trim() || roomNumber.trim();

      // Convert selected facilities to short labels for compact display
      const mappedFacilities = selectedFacilities.map((f) => {
        const found = AVAILABLE_FACILITIES.find((af) => af.id === f || af.label === f);
        return found ? found.shortLabel : f;
      });

      await onSave(
        {
          room_number: cleanNumber,
          floor,
          room_type: roomType,
          price: Number(price),
          status,
          facilities: mappedFacilities,
          description,
          property_name: DEFAULT_PROPERTY.name,
        },
        room?.id
      );
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[28px] w-full max-w-2xl shadow-2xl border border-slate-100/80 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#4f46e5] text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Perbarui/edit properti &amp; fasilitas
                </h3>
                <span className="bg-indigo-50 text-indigo-700 font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Unit Wisma Melati
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Masukkan detail spesifikasi kamar, konfigurasi fasilitas, dan harga sewa bulanan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Scrollable Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {/* Row 1: Room Number & Floor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nomor / Kode Kamar <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <Bed className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Kamar B-06"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Gunakan penamaan unik agar mudah diidentifikasi
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Posisi Lantai <span className="text-rose-500">*</span>
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              >
                <option value="Lantai 1">Lantai 1</option>
                <option value="Lantai 2">Lantai 2</option>
                <option value="Lantai 3">Lantai 3</option>
                <option value="Lantai 3 • Sudut Tenang">Lantai 3 • Sudut Tenang</option>
                <option value="Lantai 4">Lantai 4</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Menentukan klasifikasi visual di peta lantai
              </p>
            </div>
          </div>

          {/* Row 2: Room Type & Monthly Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Tipe Kamar <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingType(!isAddingType)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  + Tipe Baru
                </button>
              </div>

              {isAddingType ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="Nama tipe baru..."
                    className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewRoomType}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                >
                  {customRoomTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Tarif Sewa Bulanan <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-slate-600">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  min={0}
                  step={50000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full pl-10 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
                <span className="absolute right-3.5 text-[11px] font-medium text-slate-400">
                  / Bulan
                </span>
              </div>
            </div>
          </div>

          {/* Status Awal Unit */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Status Awal Unit
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Kosong (Emerald / Siap Huni) */}
              <button
                type="button"
                onClick={() => setStatus("available")}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                  status === "available"
                    ? "border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    status === "available"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {status === "available" && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
                <div>
                  <span className="text-xs font-bold block">Kosong (Siap Huni)</span>
                </div>
              </button>

              {/* Option 2: Terisi (Blue / Occupied) */}
              <button
                type="button"
                onClick={() => setStatus("occupied")}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                  status === "occupied"
                    ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    status === "occupied"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {status === "occupied" && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
                <div>
                  <span className="text-xs font-bold block">Terisi</span>
                </div>
              </button>

              {/* Option 3: Renovasi/Perbaikan (Amber / Maintenance) */}
              <button
                type="button"
                onClick={() => setStatus("maintenance")}
                className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                  status === "maintenance"
                    ? "border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    status === "maintenance"
                      ? "border-amber-500 bg-amber-500 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {status === "maintenance" && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
                <div>
                  <span className="text-xs font-bold block">Renovasi / Perbaikan</span>
                </div>
              </button>
            </div>
          </div>

          {/* Fasilitas Kamar (Pilih yang Tersedia) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-800">
                Fasilitas Kamar (Pilih yang Tersedia)
              </label>
              <span className="text-[11px] font-semibold text-slate-500">
                {selectedFacilities.length} Fasilitas terpilih
              </span>
            </div>

            {/* Checkbox grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {AVAILABLE_FACILITIES.map((facility) => {
                const isSelected = selectedFacilities.includes(facility.id);
                const Icon = facility.icon;
                return (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => toggleFacility(facility.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? "border-[#4f46e5] bg-indigo-50/70 text-indigo-900 font-semibold"
                        : "border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? "bg-[#4f46e5] text-white"
                          : "border border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#4f46e5]" : "text-slate-400"}`} />
                    <span className="truncate">{facility.label}</span>
                  </button>
                );
              })}

              {/* Custom facilities that were added */}
              {selectedFacilities
                .filter((sf) => !AVAILABLE_FACILITIES.some((af) => af.id === sf))
                .map((cf) => (
                  <button
                    key={cf}
                    type="button"
                    onClick={() => toggleFacility(cf)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#4f46e5] bg-indigo-50/70 text-indigo-900 font-semibold text-xs transition cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded-md bg-[#4f46e5] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="truncate">{cf}</span>
                  </button>
                ))}
            </div>

            {/* Add extra custom facility input */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={customFacilityInput}
                onChange={(e) => setCustomFacilityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomFacility();
                  }
                }}
                placeholder="+ Tambah fasilitas lainnya (misal: TV Android 32 Inch, Dispenser Galon)..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
              <button
                type="button"
                onClick={handleAddCustomFacility}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-[#4f46e5] font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Catatan Khusus Kamar */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Catatan Khusus Kamar
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Posisi menghadap matahari pagi, stopkontak ganda samping ranjang, kran air baru diganti."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan &amp; Publikasikan Kamar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
