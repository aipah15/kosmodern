"use client";

import React from "react";

interface TenantGreetingProps {
  userName?: string;
  roomNumber?: string;
  floor?: string;
  propertyName?: string;
}

export const TenantGreeting: React.FC<TenantGreetingProps> = ({
  userName = "Azka Andya",
  roomNumber = "B-04",
  floor = "Lt. 1",
  propertyName = "Kost Yusi",
}) => {
  return (
    <div className="w-full mt-2 mb-3.5">
      <h2 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
        <span>Halo, {userName}</span>
        <span className="text-xl inline-block origin-bottom-right hover:rotate-12 transition-transform">
          👋
        </span>
      </h2>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
        {/* Door / Key Room Icon */}
        <svg
          className="w-3.5 h-3.5 text-[#4f46e5] shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <circle cx="14" cy="12" r="1.5" />
        </svg>

        <span>
          Kamar {roomNumber} • {floor} | {propertyName}
        </span>
      </div>
    </div>
  );
};
