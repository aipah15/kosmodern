// Ubah nomor telepon lokal (08xx / +62xx) menjadi format wa.me tanpa tanda baca (62xx)
export function toWaNumber(phone: string | null | undefined): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return `62${digits}`;
}
