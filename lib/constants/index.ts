// Konstanta informasi umum properti kos
export const DEFAULT_PROPERTY = {
  name: "Kost Yusi",
  tagline: "Kost Eksklusif & Modern",
  address: "Jl. Sigura - Gura IV No.6, Kota Malang",
  ownerName: "Arifa Andya Nafiisa",
  ownerRole: "Pemilik Properti",
  ownerPhone: "081298441201",
  ownerEmail: "owner@kostyusi.com",
};

// Rekening resmi pembayaran sewa kos
export const OFFICIAL_BANK_ACCOUNTS = [
  {
    id: "bca",
    bankName: "Bank Central Asia (BCA)",
    shortName: "BCA",
    accountNumber: "8730192844",
    accountHolder: "Arifa Andya Nafiisa",
    logoColor: "bg-blue-50 text-blue-700",
  },
  {
    id: "mandiri",
    bankName: "Bank Mandiri",
    shortName: "MANDIRI",
    accountNumber: "1370029381029",
    accountHolder: "Arifa Andya Nafiisa",
    logoColor: "bg-amber-50 text-amber-700",
  },
  {
    id: "bri",
    bankName: "Bank Rakyat Indonesia (BRI)",
    shortName: "BRI",
    accountNumber: "0028192847291",
    accountHolder: "Arifa Andya Nafiisa",
    logoColor: "bg-sky-50 text-sky-700",
  },
];

// Daftar fasilitas kamar default
export const DEFAULT_ROOM_FACILITIES = [
  "AC (Air Conditioner)",
  "Kamar Mandi Dalam",
  "Water Heater",
  "Smart Door Lock",
  "Kasur Springbed",
  "Meja & Kursi Kerja",
  "Lemari Pakaian 2 Pintu",
  "Wi-Fi Cepat",
];

// Tipe kamar kos yang tersedia
export const ROOM_TYPES = [
  "Deluxe AC",
  "Standard AC",
  "Superior AC",
  "VIP Suite",
];

// Kategori tagihan kos
export const BILL_CATEGORIES = [
  { id: "sewa", label: "Sewa Kamar Bulanan" },
  { id: "listrik", label: "Token Listrik / Daya Tambahan" },
  { id: "air", label: "Iuran Air & Kebersihan" },
  { id: "denda", label: "Denda Keterlambatan" },
  { id: "deposit", label: "Deposit Awal Jaminan" },
  { id: "lainnya", label: "Biaya Tambahan Lainnya" },
];
