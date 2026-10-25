"use client";

import { useState, useEffect, useCallback } from "react";
import { Tenant, TenantFormData, TenantStatus } from "@/types/tenant";
import { tenantService } from "@/modules/tenants/services/tenantService";

// Hook untuk mengelola daftar dan mutasi data penghuni kos
export function useTenants(status?: TenantStatus) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memuat data penghuni dari database
  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tenantService.getTenants(status);
      setTenants(data);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data penghuni.");
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // Tambah penghuni baru
  const addTenant = async (formData: TenantFormData) => {
    const newTenant = await tenantService.createTenant(formData);
    setTenants((prev) => [...prev, newTenant]);
    return newTenant;
  };

  // Update informasi penghuni
  const editTenant = async (id: string, updates: Partial<Tenant>) => {
    const updated = await tenantService.updateTenant(id, updates);
    setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  // Hapus penghuni
  const removeTenant = async (id: string, roomId?: string) => {
    await tenantService.deleteTenant(id, roomId);
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    tenants,
    isLoading,
    error,
    refreshTenants: loadTenants,
    addTenant,
    editTenant,
    removeTenant,
  };
}
