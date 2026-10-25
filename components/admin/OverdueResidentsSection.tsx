"use client";

import React from "react";
import { Bell, MessageCircle } from "lucide-react";

export const OverdueResidentsSection: React.FC = () => {
  const overdues = [
    {
      id: "1",
      room_number: "A-02",
      name: "Rizka Salsabila",
      initials: "RS",
      daysOverdue: 11,
      dueDate: "6 Okt 2026",
      principal: 1300000,
      lateFee: 75000,
      total: 1350000,
      phone: "081234567890",
    },
  ];

  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06),0_5px_15px_-5px_rgba(0,0,0,0.02)] border border-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Bell className="w-4 h-4" />
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
        <span className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-100">
          3 Penghuni • Denda Berjalan
        </span>
      </div>

      {/* Resident List */}
      <div className="space-y-3">
        {overdues.map((item) => (
          <div
            key={item.id}
            className="bg-[#f8faff] border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Resident Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-center shrink-0">
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

            {/* Breakdown */}
            <div className="flex items-center flex-wrap gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-normal">
                  Jatuh tempo:
                </span>
                <span className="font-bold text-slate-800">{item.dueDate}</span>
              </div>

              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] text-slate-400 block font-normal">
                  Pokok:
                </span>
                <span className="font-bold text-slate-800">
                  Rp {item.principal.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] text-rose-500 block font-normal">
                  Denda:
                </span>
                <span className="font-bold text-rose-600">
                  Rp {item.lateFee.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                  TOTAL TAGIHAN
                </span>
                <span className="text-sm font-bold text-rose-600">
                  Rp {item.total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* WhatsApp Reminder Button */}
            <a
              href={`https://wa.me/62${item.phone.replace(/^0/, "")}?text=Halo%20Kak%20${encodeURIComponent(item.name)},%20ini%20pengingat%20dari%20Kost%20Yusi%20mengenai%20tagihan%20kamar%20${item.room_number}%20sebesar%20Rp%20${item.total.toLocaleString("id-ID")}.%20Mohon%20segera%20dikonfirmasi.`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
            >
              {/* WhatsApp Icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Kirim WhatsApp</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
