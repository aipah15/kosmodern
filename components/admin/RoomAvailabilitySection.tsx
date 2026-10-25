"use client";

import React from "react";
import { Bed, KeyRound, Wrench, Home } from "lucide-react";

interface RoomAvailabilitySectionProps {
  onManageRooms?: () => void;
}

export const RoomAvailabilitySection: React.FC<RoomAvailabilitySectionProps> = ({
  onManageRooms,
}) => {
  return (
    <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-[0_15px_35px_-15px_rgba(79,70,229,0.06),0_5px_15px_-5px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              KETERSEDIAAN UNIT
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Kondisi Kamar Saat Ini
            </h3>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center">
            <Bed className="w-4 h-4" />
          </div>
        </div>

        {/* Progress Bar & Summary */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-700">Total 10 Kamar</span>
            <span className="text-emerald-600 font-bold">8 Terisi (80%)</span>
          </div>

          {/* Segmented bar matching Image */}
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex gap-0.5 p-0.5">
            <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: "80%" }}></div>
            <div className="h-full bg-blue-500" style={{ width: "10%" }}></div>
            <div className="h-full bg-amber-500 rounded-r-full" style={{ width: "10%" }}></div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Terisi (8)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Kosong (1)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Perbaikan (1)
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-3">
          {/* Kamar Siap Huni */}
          <div className="bg-[#f8faff] border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Kamar Siap Huni
                </h4>
                <p className="text-[10px] text-slate-400 font-normal">
                  Siap disewakan langsung
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-blue-600">
              1 Kamar
            </span>
          </div>

          {/* Kamar Perbaikan */}
          <div className="bg-[#f8faff] border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Kamar Perbaikan
                </h4>
                <p className="text-[10px] text-slate-400 font-normal">
                  AC &amp; peremajaan cat
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-amber-600">
              1 Kamar
            </span>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={onManageRooms}
        className="w-full mt-5 py-2.5 px-4 bg-[#eef2ff] hover:bg-indigo-100 text-[#4f46e5] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>Kelola Ketersediaan Kamar</span>
      </button>
    </div>
  );
};
