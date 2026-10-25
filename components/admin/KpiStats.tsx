"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Receipt,
  Check,
  Hourglass,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { billingService } from "@/modules/billing/services/billingService";
import { tenantService } from "@/modules/tenants/services/tenantService";
import { proofService } from "@/modules/billing/services/proofService";
import { formatRupiah } from "@/lib/utils/currency";

// Kartu indikator kinerja utama (KPI) Dasbor Keuangan dan Distribusi Penagihan
export const KpiStats: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingRevenue: 0,
    paidCount: 0,
    unpaidCount: 0,
    overdueCount: 0,
    pendingProofsCount: 0,
    totalTenants: 0,
  });
  const [loadError, setLoadError] = useState<string | null>(null);

  // Memuat data ringkasan keuangan dan status tagihan terbaru
  useEffect(() => {
    async function loadKpiData() {
      try {
        const [summary, tenants, proofs] = await Promise.all([
          billingService.getBillingSummary(),
          tenantService.getTenants(),
          proofService.getPaymentProofs("pending"),
        ]);

        setStats({
          totalRevenue: summary.totalRevenue,
          pendingRevenue: summary.pendingRevenue,
          paidCount: summary.paidCount,
          unpaidCount: summary.unpaidCount,
          overdueCount: summary.overdueCount,
          pendingProofsCount: proofs.length,
          totalTenants: tenants.filter((t) => t.status === "active").length,
        });
        setLoadError(null);
      } catch (err: any) {
        console.error("Gagal memuat metrik KPI:", err);
        setLoadError(err?.message || "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    loadKpiData();
  }, []);

  const [currentMonthYear, setCurrentMonthYear] = useState("");

  useEffect(() => {
    setCurrentMonthYear(
      new Date().toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      })
    );
  }, []);

  return (
    <>
    {loadError && (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
        Gagal memuat ringkasan dasbor: {loadError}
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 sm:gap-5">
      {/* Kartu 1: Total Uang Masuk */}
      <div className="xl:col-span-3 bg-white rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              TOTAL UANG MASUK
            </span>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Bulan Berjalan ({currentMonthYear})
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 leading-none">
            {formatRupiah(stats.totalRevenue)}
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
            <TrendingUp className="w-3 h-3" />
            <span>Arus Kas Masuk Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Kartu 2: Total Tunggakan */}
      <div className="xl:col-span-3 bg-white rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              TOTAL TUNGGAKAN
            </span>
            <span className="text-xs text-slate-500 font-medium mt-0.5 block">
              Belum diselesaikan
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-2xl sm:text-[28px] font-black tracking-tight text-rose-600 leading-none">
            {formatRupiah(stats.pendingRevenue)}
          </div>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[11px] font-semibold border border-rose-100">
            <AlertTriangle className="w-3 h-3" />
            <span>{stats.overdueCount + stats.unpaidCount} Kamar Perlu Ditagih</span>
          </div>
        </div>
      </div>

      {/* Kartu 3: Distribusi Status Penagihan Kamar */}
      <div className="xl:col-span-6 bg-white rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              STATUS PENAGIHAN SEWA
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Distribusi Pembayaran Penghuni
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
            {stats.totalTenants} Penghuni Aktif
          </span>
        </div>

        {/* 4 Kotak Status Pembayaran */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Status 1: Lunas */}
          <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[10px] font-bold tracking-wider">LUNAS</span>
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-emerald-700 block leading-tight">
                {stats.paidCount}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">
                Penghuni
              </span>
            </div>
          </div>

          {/* Status 2: Menunggu Verifikasi */}
          <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-800">
              <span className="text-[10px] font-bold tracking-wider">VERIFIKASI</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-amber-700 block leading-tight">
                {stats.pendingProofsCount} Bukti
              </span>
              <span className="text-[11px] text-amber-600 font-medium">
                Perlu ditinjau
              </span>
            </div>
          </div>

          {/* Status 3: Belum Bayar */}
          <div className="bg-sky-50/80 rounded-2xl p-3 border border-sky-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-sky-800">
              <span className="text-[10px] font-bold tracking-wider">BELUM BAYAR</span>
              <Hourglass className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-sky-700 block leading-tight">
                {stats.unpaidCount}
              </span>
              <span className="text-[11px] text-sky-600 font-medium">
                Menunggu transfer
              </span>
            </div>
          </div>

          {/* Status 4: Terlambat */}
          <div className="bg-rose-50/80 rounded-2xl p-3 border border-rose-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-[10px] font-bold tracking-wider">TERLAMBAT</span>
              <Clock className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-rose-700 block leading-tight">
                {stats.overdueCount}
              </span>
              <span className="text-[11px] text-rose-600 font-medium">
                Denda berjalan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
