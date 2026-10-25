"use client";

import React, { useState } from "react";
import {
  X,
  Receipt,
  Download,
  AlertTriangle,
  Upload,
  Check,
  Package,
  Calendar,
  Sparkles,
  Refrigerator,
} from "lucide-react";

interface ServiceModalsProps {
  activeModal: "riwayat" | "rusak" | "barang" | "kulkas" | "kuitansi" | null;
  onClose: () => void;
}

export const ServiceModals: React.FC<ServiceModalsProps> = ({
  activeModal,
  onClose,
}) => {
  // Lapor Rusak state
  const [complaintCategory, setComplaintCategory] = useState("AC / Pendingin");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Kulkas Bersama state
  const [fridgeItemName, setFridgeItemName] = useState("");
  const [fridgeCompartment, setFridgeCompartment] = useState("Rak Tengah (Lt. 1)");
  const [fridgeSuccess, setFridgeSuccess] = useState(false);

  // Barang Luar state
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("Rak Sepatu Pribadi");
  const [itemSuccess, setItemSuccess] = useState(false);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-[430px] bg-white rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-250">
        {/* ================= 1. RIWAYAT BAYAR ================= */}
        {activeModal === "riwayat" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Riwayat Pembayaran
                  </h3>
                  <p className="text-[11px] text-slate-400">Kamar B-04 • Azka Andya</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Month 1: Oktober 2026 */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      Oktober 2026
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      LUNAS
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    Rp 1.500.000
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Dibayar: 28 Sep 2026 via BCA VA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Mengunduh Kuitansi Resmi Oktober 2026 (PDF)")}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#4f46e5] shadow-2xs text-xs font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>

              {/* Month 2: September 2026 */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      September 2026
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      LUNAS
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    Rp 1.500.000
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Dibayar: 27 Ags 2026 via QRIS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Mengunduh Kuitansi Resmi September 2026 (PDF)")}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#4f46e5] shadow-2xs text-xs font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>

              {/* Month 3: Agustus 2026 */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      Agustus 2026
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      LUNAS
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">
                    Rp 1.500.000
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Dibayar: 29 Jul 2026 via Mandiri VA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Mengunduh Kuitansi Resmi Agustus 2026 (PDF)")}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#4f46e5] shadow-2xs text-xs font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-4 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ================= 2. LAPOR RUSAK ================= */}
        {activeModal === "rusak" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Lapor Kerusakan Kamar
                  </h3>
                  <p className="text-[11px] text-slate-400">Teknisi Kost Yusi (Pak Joko)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {complaintSuccess ? (
              <div className="mt-5 text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Laporan Berhasil Terkirim!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Tiket kerusakan telah diteruskan ke pemilik kos dan tim teknisi (Pak Joko). Teknisi akan memeriksa hari ini.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setComplaintSuccess(false);
                    onClose();
                  }}
                  className="mt-4 px-6 py-2 bg-[#4f46e5] text-white rounded-xl text-xs font-semibold"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setComplaintSuccess(true);
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kategori Kerusakan
                  </label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                  >
                    <option value="AC / Pendingin">AC Kurang Dingin / Bocor Air</option>
                    <option value="Kran / Kamar Mandi">Kran Air / Shower Macet / Bocor</option>
                    <option value="Kelistrikan / Lampu">Lampu Kamar Mati / Saklar Rusak</option>
                    <option value="WiFi / Internet">Koneksi WiFi Lemah / Putus-putus</option>
                    <option value="Pintu / Kunci Smart">Kunci Kamar / Smart Lock Kendala</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Detail Kerusakan <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    placeholder="Contoh: AC meneteskan air ke lantai sejak semalam dan suaranya berisik..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4f46e5]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Izin Akses Saat Kamar Kosong
                  </label>
                  <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]">
                    <option>Boleh masuk (Kunci cadangan di Pos Keamanan)</option>
                    <option>Hanya saat saya ada di kamar kos</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer"
                >
                  Kirim Laporan Kerusakan
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= 3. BARANG LUAR ================= */}
        {activeModal === "barang" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Registrasi Barang Luar Kamar
                  </h3>
                  <p className="text-[11px] text-slate-400">Area Lorong & Selasar Bersama</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {itemSuccess ? (
              <div className="mt-5 text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Barang Berhasil Diregistrasi!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Stiker tag "Kamar B-04" telah dicatat oleh pengurus kos. Barang aman dari pembersihan rutin bulanan.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setItemSuccess(false);
                    onClose();
                  }}
                  className="mt-4 px-6 py-2 bg-[#4f46e5] text-white rounded-xl text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setItemSuccess(true);
                }}
                className="mt-4 space-y-3"
              >
                <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-xs text-purple-900">
                  Semua barang di luar pintu kamar wajib didaftarkan agar tidak disita saat penertiban koridor/selasar setiap tanggal 15.
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Jenis Barang
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                  >
                    <option value="Rak Sepatu Pribadi">Rak Sepatu Pribadi (Maks 3 Tingkat)</option>
                    <option value="Gantungan Jemuran">Gantungan Jemuran Lipat</option>
                    <option value="Galon Cadangan">Galon Air Cadangan</option>
                    <option value="Kotak Paket / Box">Storage Box Tertutup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Keterangan / Warna Barang
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Contoh: Rak sepatu plastik warna hitam abu-abu"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer"
                >
                  Daftarkan Barang
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= 4. KULKAS BERSAMA ================= */}
        {activeModal === "kulkas" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Refrigerator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Label Kulkas Bersama
                  </h3>
                  <p className="text-[11px] text-slate-400">Pantry Lantai 1 & Lantai 2</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {fridgeSuccess ? (
              <div className="mt-5 text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Label Makanan Berhasil Dibuat!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Stiker digital "B-04 • Azka Andya" aktif selama 5 hari ke depan. Pengurus kos tidak akan membuang makanan Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFridgeSuccess(false);
                    onClose();
                  }}
                  className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFridgeSuccess(true);
                }}
                className="mt-4 space-y-3"
              >
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                  Setiap makanan/minuman yang ditaruh di kulkas bersama wajib dilabeli stiker nama & nomor kamar. Makanan tanpa label akan dibersihkan setiap hari Minggu malam.
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Makanan / Minuman
                  </label>
                  <input
                    type="text"
                    value={fridgeItemName}
                    onChange={(e) => setFridgeItemName(e.target.value)}
                    placeholder="Contoh: Susu UHT 1 Liter & Buah Apel"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Lokasi Penyimpanan
                  </label>
                  <select
                    value={fridgeCompartment}
                    onChange={(e) => setFridgeCompartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4f46e5]"
                  >
                    <option value="Rak Tengah (Lt. 1)">Kulkas Lt. 1 - Rak Tengah</option>
                    <option value="Freezer (Lt. 1)">Kulkas Lt. 1 - Freezer Atas</option>
                    <option value="Pintu Samping (Lt. 1)">Kulkas Lt. 1 - Rak Botol Samping</option>
                    <option value="Kulkas Lt. 2">Kulkas Lt. 2 - Rak Utama</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer"
                >
                  Buat Label Stiker Digital
                </button>
              </form>
            )}
          </div>
        )}

        {/* ================= 5. KUITANSI PEMBAYARAN RESMI ================= */}
        {activeModal === "kuitansi" && (
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Kuitansi Resmi Pembayaran
                  </h3>
                  <p className="text-[11px] text-slate-400">#KWT-202611-0042</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="font-extrabold text-sm text-slate-900 block">KOST YUSI</span>
                <span className="text-[10px] text-slate-500">Ibu Hj. Ratna Juwita • Jakarta</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Diterima Dari:</span>
                <span className="font-bold text-slate-800">Azka Andya (Kamar B-04)</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Uraian:</span>
                <span className="font-semibold text-slate-800 text-right">
                  Sewa Kamar B-04 + Listrik Kulkas (Nov 2026)
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Jumlah Lunas:</span>
                <span className="font-extrabold text-emerald-700 text-sm">Rp 1.550.000</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold text-emerald-700">LUNAS TERVERIFIKASI</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => alert("Mengunduh Kuitansi PDF")}
                className="flex-1 py-2.5 bg-[#4f46e5] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
