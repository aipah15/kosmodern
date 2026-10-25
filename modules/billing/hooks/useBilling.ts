"use client";

import { useState, useEffect, useCallback } from "react";
import { Bill, BillFilterTab, BillStatus, CreateExtraBillFormData } from "@/types/bill";
import { billingService } from "@/modules/billing/services/billingService";

// Hook untuk mengelola data tagihan, filter pembayaran, dan penagihan
export function useBilling(initialFilter: BillFilterTab = "all") {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<BillFilterTab>(initialFilter);
  const [error, setError] = useState<string | null>(null);

  // Memuat data tagihan dari server
  const loadBills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await billingService.getBills(filterTab);
      setBills(data);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat daftar tagihan.");
    } finally {
      setIsLoading(false);
    }
  }, [filterTab]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  // Update status pembayaran tagihan
  const updateStatus = async (id: string, status: BillStatus) => {
    const updated = await billingService.updateBillStatus(id, status);
    setBills((prev) => prev.map((b) => (b.id === id ? updated : b)));
    return updated;
  };

  // Buat tagihan ekstra untuk beberapa penghuni
  const createExtra = async (formData: CreateExtraBillFormData) => {
    const created = await billingService.createExtraBills(formData);
    await loadBills();
    return created;
  };

  return {
    bills,
    isLoading,
    filterTab,
    setFilterTab,
    error,
    refreshBills: loadBills,
    updateStatus,
    createExtra,
  };
}
