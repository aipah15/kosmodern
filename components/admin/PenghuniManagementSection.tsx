"use client";

import React, { useState, useEffect } from "react";
import { Tenant, TenantFormData } from "@/types/tenant";
import { Room } from "@/types/room";
import { TenantListSection } from "./TenantListSection";
import { TenantDetailProfile } from "./TenantDetailProfile";
import { TenantFormManage } from "./TenantFormManage";
import { tenantService } from "@/modules/tenants/services/tenantService";
import { roomService } from "@/modules/rooms/services/roomService";
import { billingService } from "@/modules/billing/services/billingService";

interface PenghuniManagementSectionProps {
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onNavigateToVerification?: () => void;
  initialSelectedTenantName?: string | null;
}

// Komponen manajemen penghuni kos terpadu
export const PenghuniManagementSection: React.FC<PenghuniManagementSectionProps> = ({
  onShowToast,
  onNavigateToVerification,
  initialSelectedTenantName,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "detail" | "create" | "edit">("list");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data penghuni dan kamar via service layer
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tenantsData, roomsData] = await Promise.all([
        tenantService.getTenants(),
        roomService.getRooms(),
      ]);

      // Status tagihan diturunkan dari tabel bills, bukan kolom tenants.bill_status yang bisa usang
      const bills = await billingService.getBills("all");
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      const activeTenants = (tenantsData || [])
        .filter((t) => t.status !== "inactive")
        .map((t) => {
          const mine = bills
            .filter((b) => b.tenant_id === t.id && !["paid", "lunas", "draft"].includes(b.status))
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
          if (mine.length === 0) {
            return { ...t, bill_status: "paid" as const, overdue_days: 0, fine_amount: 0 };
          }
          const first = mine[0];
          const pending = mine.some((b) => b.status === "pending" || b.status === "menunggu_verifikasi");
          const late = new Date(first.due_date).getTime() < startOfToday && !pending;
          const overdueDays = late ? Math.ceil((startOfToday - new Date(first.due_date).getTime()) / 86400000) : 0;
          return {
            ...t,
            bill_status: (pending ? "waiting_verification" : late ? "overdue" : "unpaid") as Tenant["bill_status"],
            overdue_days: overdueDays,
            fine_amount: Number(first.fine_amount || 0),
            bill_period: first.period,
            bill_amount: Number(first.amount || 0),
          };
        });
      setTenants(activeTenants);

      setRooms(roomsData || []);

      // Cek apakah ada penghuni awal yang diminta dibuka profilnya
      if (initialSelectedTenantName) {
        const match = activeTenants.find(
          (t) => t.full_name.toLowerCase() === initialSelectedTenantName.toLowerCase()
        );
        if (match) {
          setSelectedTenant(match);
          setViewMode("detail");
        }
      }
    } catch (err: any) {
      console.error("Gagal memuat data penghuni:", err);
      onShowToast(`Gagal memuat data penghuni: ${err?.message || "kesalahan jaringan"}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [initialSelectedTenantName]);

  const handleSelectTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setViewMode("detail");
  };

  const handleStartCreate = () => {
    setSelectedTenant(null);
    setViewMode("create");
  };

  const handleStartEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setViewMode("edit");
  };

  const handleCheckOut = async (tenant: Tenant) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menonaktifkan penghuni ${tenant.full_name} dari Kamar ${tenant.room_number}?`);
    if (!confirmed) return;

    try {
      // 1. Nonaktifkan status penghuni via tenantService
      await tenantService.updateTenant(tenant.id, { status: "inactive" });

      // 2. Kosongkan unit kamar via roomService
      if (tenant.room_id) {
        await roomService.updateRoom(tenant.room_id, {
          status: "available",
          tenant_name: null,
        });
      }

      setTenants((prev) => prev.filter((t) => t.id !== tenant.id));
      setViewMode("list");
      setSelectedTenant(null);
      onShowToast(`Penghuni ${tenant.full_name} berhasil di-check out. Kamar ${tenant.room_number} kini Siap Huni.`, "success");
    } catch (err: any) {
      onShowToast(`Gagal check out penghuni: ${err?.message || "kesalahan jaringan"}`, "error");
    }
  };

  const handleSaveTenant = async (formData: TenantFormData, tenantId?: string) => {
    try {
      if (tenantId) {
        const updated = await tenantService.updateTenant(tenantId, formData);

        setTenants((prev) => prev.map((t) => (t.id === tenantId ? { ...t, ...updated } : t)));
        if (selectedTenant && selectedTenant.id === tenantId) {
          setSelectedTenant({ ...selectedTenant, ...updated });
        }

        onShowToast(`Data penghuni ${formData.full_name} berhasil diperbarui!`, "success");
        setViewMode("detail");
      } else {
        const created = await tenantService.createTenant(formData);

        setTenants((prev) => [created, ...prev]);
        setSelectedTenant(created);

        onShowToast(`Penghuni ${formData.full_name} berhasil ditambahkan! Tautan aktivasi siap dibagikan.`, "success");
        setViewMode("list");
      }
    } catch (err: any) {
      console.error("Gagal menyimpan data penghuni:", err);
      onShowToast(`Gagal menyimpan data penghuni: ${err.message}`, "error");
      throw err;
    }
  };

  return (
    <div>
      {viewMode === "list" && (
        <TenantListSection
          tenants={tenants}
          isLoading={isLoading}
          onRefresh={fetchData}
          onSelectTenant={handleSelectTenant}
          onCreateTenant={handleStartCreate}
          onShowToast={onShowToast}
          onNavigateToVerification={onNavigateToVerification}
        />
      )}

      {viewMode === "detail" && selectedTenant && (
        <TenantDetailProfile
          tenant={selectedTenant}
          onBack={() => setViewMode("list")}
          onEdit={handleStartEdit}
          onCheckOut={handleCheckOut}
          onShowToast={onShowToast}
          onReviewPayment={onNavigateToVerification}
        />
      )}

      {(viewMode === "create" || viewMode === "edit") && (
        <TenantFormManage
          tenant={viewMode === "edit" ? selectedTenant : null}
          rooms={rooms}
          onBack={() => setViewMode(selectedTenant ? "detail" : "list")}
          onSave={handleSaveTenant}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
