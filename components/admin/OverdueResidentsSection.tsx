"use client";

import React, { useState, useEffect } from "react";
import { Bell, MessageCircle, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { billingService } from "@/modules/billing/services/billingService";
import { formatRupiah } from "@/lib/utils/currency";
import { DEFAULT_PROPERTY } from "@/lib/constants";
import { Bill } from "@/types/bill";

interface OverdueItem {
  id: string;
  room_number: string;
  name: string;
  initials: string;
  daysOverdue: number;
  dueDate: string;
  principal: number;
  lateFee: number;
  total: number;
  phone: string;
}

// Komponen daftar penghuni yang melewati jatuh tempo sewa pada dasbor admin
export const OverdueResidentsSection: React.FC = () => {
  const [overdues, setOverdues] = useState<OverdueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Memuat tagihan terlambat secara langsung via billingService
  const loadOverdueData = async () => {
    try {
      setIsLoading(true);
      const allBills = await billingService.getBills("all");
      const today = new Date();
      // Tagihan terlambat: status overdue, atau belum dibayar dan sudah lewat jatuh tempo
      const bills = allBills.filter((b) => {
        if (b.status === "overdue" || b.status === "terlambat") return true;
        const unpaid = b.status === "unpaid" || b.status === "belum_bayar";
        return unpaid && !!b.due_date && new Date(b.due_date).getTime() < today.getTime();
      });
      {
        const mapped: OverdueItem[] = bills.map((bill: Bill, idx: number) => {
          const due = bill.due_date ? new Date(bill.due_date) : today;
          const diffTime = Math.max(0, today.getTime() - due.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
          const lateFee = Number(bill.fine_amount || 0);
          const principal = Number(bill.amount || 0);

          return {
            id: bill.id || String(idx),
            room_number: bill.room_number || "-",
            name: bill.tenant_name || "Penghuni",
            initials: (bill.tenant_name || "P")
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase(),
            daysOverdue: diffDays,
            dueDate: bill.due_date
              ? new Date(bill.due_date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Bulan ini",
            principal,
            lateFee,
            total: principal + lateFee,
            phone: bill.tenant_phone || "",
          };
        });
        setOverdues(mapped);
        setLoadError(null);
      }
    } catch (err: any) {
      console.error("Gagal mengambil data tagihan terlambat:", err);
      setLoadError(err?.message || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverdueData();
  }, []);

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06),0_5px_15px_-5px_rgba(0,0,0,0.02)] border border-slate-100">
      {/* Header Bagian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 shadow-xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Penghuni Melewati Jatuh Tempo (Terlambat)
            </h3>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              Tagihan aktif melewati batas tanggal pembayaran yang disepakati
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={loadOverdueData}
            title="Segarkan data tunggakan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-100">
            {overdues.length} Penghuni • Denda Berjalan
          </span>
        </div>
      </div>

      {/* Daftar Penghuni Terlambat */}
      <div className="space-y-3">
        {overdues.map((item) => {
          const waMessage = `Halo Kak ${item.name}, kami menginfokan dari ${DEFAULT_PROPERTY.name} (Ibu ${DEFAULT_PROPERTY.ownerName}) bahwa tagihan sewa kamar ${item.room_number} telah melewati jatuh tempo (${item.daysOverdue} hari). Total yang harus dibayarkan: ${formatRupiah(item.total)}. Mohon segera melakukan transfer ya Kak. Terima kasih!`;
          const waUrl = `https://wa.me/62${item.phone.replace(/^0/, "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waMessage)}`;

          return (
            <div
              key={item.id}
              className="bg-[#f8faff] hover:bg-rose-50/20 border border-slate-100 hover:border-rose-200/60 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all"
            >
              {/* Profil Singkat Penghuni */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {item.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md">
                      Kamar {item.room_number}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-block">
                    Terlambat {item.daysOverdue} Hari
                  </span>
                </div>
              </div>

              {/* Rincian Finansial & Denda */}
              <div className="flex items-center flex-wrap gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">
                    Jatuh tempo:
                  </span>
                  <span className="font-bold text-slate-800">{item.dueDate}</span>
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <span className="text-[10px] text-slate-400 block font-normal">
                    Pokok Sewa:
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatRupiah(item.principal)}
                  </span>
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <span className="text-[10px] text-rose-500 block font-normal">
                    Denda:
                  </span>
                  <span className="font-bold text-rose-600">
                    {formatRupiah(item.lateFee)}
                  </span>
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                    TOTAL TAGIHAN
                  </span>
                  <span className="text-sm font-black text-rose-600">
                    {formatRupiah(item.total)}
                  </span>
                </div>
              </div>

              {/* Tombol Ingatkan WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Kirim WhatsApp</span>
              </a>
            </div>
          );
        })}

        {loadError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
            Gagal memuat tunggakan: {loadError}
          </div>
        )}
        {!loadError && !isLoading && overdues.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center gap-2">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <span className="font-semibold text-emerald-800">
              Semua pembayaran berjalan tepat waktu!
            </span>
            <span className="text-[11px] text-emerald-600">
              Tidak ada penghuni yang memiliki tunggakan jatuh tempo.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
