// Format angka menjadi mata uang Rupiah (contoh: Rp 1.500.000)
export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "Rp 0";
  }
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

// Konversi string inputan rupiah kembali ke angka murni
export function parseRupiah(formattedText: string): number {
  const cleanNumber = formattedText.replace(/[^0-9]/g, "");
  return cleanNumber ? parseInt(cleanNumber, 10) : 0;
}
