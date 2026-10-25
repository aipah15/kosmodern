import React from "react";
import { TenantPortalProvider } from "@/modules/tenant-portal/context";

// Provider memuat data penghuni di sisi klien, jadi validasi navigasi instan dinonaktifkan untuk segmen ini
export const instant = false;

// Layout pembungkus portal penghuni yang sepenuhnya responsif (Mobile, Tablet, dan Desktop)
export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#f8faff] text-slate-800 antialiased flex flex-col items-center justify-start selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <div className="w-full min-h-screen flex flex-col relative bg-transparent">
        <TenantPortalProvider>{children}</TenantPortalProvider>
      </div>
    </div>
  );
}
