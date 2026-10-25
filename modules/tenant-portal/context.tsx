"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { authService } from "@/modules/auth/services/authService";
import { DEFAULT_PROPERTY } from "@/lib/constants";
import { PortalData, portalService, getBillingOverview, BillingOverview } from "./services/portalService";

interface TenantPortalContextValue extends PortalData {
  billing: BillingOverview;
  wifi: { ssid: string; password: string };
  owner: { name: string; phone: string; address: string; propertyName: string };
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const TenantPortalContext = createContext<TenantPortalContextValue | null>(null);

export function useTenantPortal(): TenantPortalContextValue {
  const ctx = useContext(TenantPortalContext);
  if (!ctx) throw new Error("useTenantPortal harus dipakai di dalam TenantPortalProvider");
  return ctx;
}

const FullScreenMessage: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8faff] text-slate-800 px-6 text-center">
    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
      <Sparkles className="w-6 h-6" />
    </div>
    <span className="text-sm font-semibold text-slate-700">{title}</span>
    {subtitle && <span className="text-xs text-slate-400 mt-1 max-w-sm">{subtitle}</span>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// Menyediakan data penghuni yang sedang login ke seluruh halaman /tenant
export const TenantPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notTenant, setNotTenant] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const reload = useCallback(async (uid: string) => {
    const result = await portalService.load(uid);
    if (!result) {
      setNotTenant(true);
      setData(null);
    } else {
      setNotTenant(false);
      setData(result);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!mounted) return;
        if (!user) {
          window.location.replace("/");
          return;
        }
        setUserId(user.id);
        await reload(user.id);
      } catch (err: any) {
        console.error("Gagal memuat portal penghuni:", err);
        if (mounted) setError(err?.message || "Gagal memuat data");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reload]);

  const refresh = useCallback(async () => {
    if (userId) await reload(userId);
  }, [userId, reload]);

  const logout = useCallback(async () => {
    await authService.signOut();
    window.location.href = "/";
  }, []);

  const value = useMemo<TenantPortalContextValue | null>(() => {
    if (!data) return null;
    const profile = data.propertySettings?.profile || {};
    return {
      ...data,
      billing: getBillingOverview(data.bills),
      wifi: { ssid: profile.wifiName || "", password: profile.wifiPassword || "" },
      owner: {
        name: profile.ownerName || DEFAULT_PROPERTY.ownerName,
        phone: profile.ownerPhone || DEFAULT_PROPERTY.ownerPhone,
        address: profile.address || DEFAULT_PROPERTY.address,
        propertyName: profile.propertyName || data.tenant.property_name || DEFAULT_PROPERTY.name,
      },
      refresh,
      logout,
    };
  }, [data, refresh, logout]);

  if (isLoading) {
    return <FullScreenMessage title="Memuat data penghuni..." />;
  }
  if (error) {
    return (
      <FullScreenMessage
        title="Gagal memuat portal penghuni"
        subtitle={error}
        action={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-[#4f46e5] text-white text-xs font-bold cursor-pointer"
          >
            Coba Lagi
          </button>
        }
      />
    );
  }
  if (notTenant || !value) {
    return (
      <FullScreenMessage
        title="Akun ini belum terhubung ke data penghuni"
        subtitle="Masuk menggunakan akun penghuni, atau hubungi pengelola kos untuk menautkan akun Anda."
        action={
          <div className="flex items-center gap-2">
            <a href="/admin" className="px-4 py-2 rounded-xl bg-indigo-50 text-[#4f46e5] text-xs font-bold">
              Portal Pemilik
            </a>
            <button
              type="button"
              onClick={() => {
                authService.signOut().finally(() => (window.location.href = "/"));
              }}
              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold cursor-pointer"
            >
              Keluar
            </button>
          </div>
        }
      />
    );
  }

  return <TenantPortalContext.Provider value={value}>{children}</TenantPortalContext.Provider>;
};
