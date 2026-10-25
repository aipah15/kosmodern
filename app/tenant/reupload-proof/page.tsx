"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Upload, CheckCircle2, Clock } from "lucide-react";
import { TenantHeader } from "@/components/tenant/TenantHeader";
import { TenantBottomNav } from "@/components/tenant/TenantBottomNav";
import { useTenantPortal } from "@/modules/tenant-portal/context";
import { formatRupiah } from "@/lib/utils/currency";
import { formatDateIndo } from "@/lib/utils/date";

// Halaman tindak lanjut bukti pembayaran yang ditolak pengelola.
// Setelah ditolak, tagihan kembali berstatus belum dibayar sehingga unggah ulang memakai alur pembayaran biasa.
export default function TenantReuploadProofPage() {
  const { proofs, billing, owner, tenant } = useTenantPortal();

  const rejected = proofs.filter((p) => {
    if (p.status !== "rejected") return false;
    return !proofs.some(
      (other) =>
        other.id !== p.id &&
        other.invoice_number === p.invoice_number &&
        new Date(other.created_at || 0).getTime() > new Date(p.created_at || 0).getTime()
    );
  });
  const latest = rejected[0] ?? null;
  const waitingVerification = billing.state === "verifikasi";

  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 flex flex-col relative overflow-x-hidden">
      <TenantHeader activeNav="tagihan" />

      <main className="relative z-10 w-full max-w-lg md:max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-28 md:pb-12 space-y-4">
        <Link
          href="/tenant/bills"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Riwayat Tagihan</span>
        </Link>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Unggah Ulang Bukti Bayar</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kamar {tenant.room_number} • {tenant.full_name}
          </p>
        </div>

        {latest ? (
          <div className="bg-white rounded-3xl p-5 border border-rose-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Bukti bayar {latest.period || ""} ditolak</span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p>
                Nominal: <strong>{formatRupiah(latest.amount)}</strong> • Diunggah {formatDateIndo(latest.created_at, true)}
              </p>
              <p>
                Invoice: <span className="font-mono">{latest.invoice_number || "-"}</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 leading-relaxed">
              <strong className="text-rose-700">Catatan {owner.name}: </strong>
              {latest.rejection_reason || "Bukti transfer tidak dapat diverifikasi."}
            </div>
            {latest.proof_image_url && (
              <a
                href={latest.proof_image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#4f46e5] hover:underline"
              >
                Lihat bukti yang ditolak
              </a>
            )}
          </div>
        ) : waitingVerification ? (
          <div className="bg-white rounded-3xl p-5 border border-blue-200 shadow-xs flex items-start gap-3 text-xs text-slate-600">
            <Clock className="w-5 h-5 text-blue-500 shrink-0" />
            <p>Bukti pembayaran Anda sudah terkirim dan sedang diverifikasi pengelola. Tidak perlu mengunggah ulang.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-xs flex items-start gap-3 text-xs text-slate-600">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p>Tidak ada bukti pembayaran yang perlu diunggah ulang.</p>
          </div>
        )}

        {latest && billing.payableBills.length > 0 && (
          <Link
            href="/tenant/pay"
            className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Bayar &amp; Unggah Bukti Baru ({formatRupiah(billing.total)})</span>
          </Link>
        )}
      </main>

      <TenantBottomNav
        activeTab="tagihan"
        onChangeTab={(tab) => {
          if (tab === "beranda") window.location.href = "/tenant";
          else if (tab === "tagihan") window.location.href = "/tenant/bills";
          else if (tab === "laporan") window.location.href = "/tenant/maintenance";
          else if (tab === "penyimpanan") window.location.href = "/tenant/storage";
          else if (tab === "makanan") window.location.href = "/tenant/food";
        }}
      />
    </div>
  );
}
