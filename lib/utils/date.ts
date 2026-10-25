// Format tanggal standar Indonesia (contoh: 25 Oktober 2026)
export function formatDateIndo(
  dateInput: string | Date | null | undefined,
  includeTime = false
): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return new Intl.DateTimeFormat("id-ID", options).format(date);
}

// Format waktu relatif (contoh: 2 hari yang lalu, baru saja)
export function getRelativeTimeIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  return formatDateIndo(date);
}
