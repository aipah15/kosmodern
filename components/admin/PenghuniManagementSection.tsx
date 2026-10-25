"use client";

import React, { useState, useEffect } from "react";
import { Tenant, TenantFormData } from "@/types/tenant";
import { Room } from "@/types/room";
import { TenantListSection } from "./TenantListSection";
import { TenantDetailProfile } from "./TenantDetailProfile";
import { TenantFormManage } from "./TenantFormManage";
import { createClient } from "@/lib/supabase/client";

interface PenghuniManagementSectionProps {
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onNavigateToVerification?: () => void;
  initialSelectedTenantName?: string | null;
}

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

  const supabase = createClient();

  // Fetch tenants & rooms from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tenantsRes, roomsRes] = await Promise.all([
        supabase.from("tenants").select("*").order("check_in_date", { ascending: false }),
        supabase.from("rooms").select("*").order("room_number", { ascending: true }),
      ]);

      if (tenantsRes.error) throw tenantsRes.error;
      if (roomsRes.error) throw roomsRes.error;

      if (tenantsRes.data) {
        setTenants(tenantsRes.data as Tenant[]);

        // Check if initial tenant is requested (e.g. from RoomCard "Profil ↗")
        if (initialSelectedTenantName) {
          const match = (tenantsRes.data as Tenant[]).find(
            (t) => t.full_name.toLowerCase() === initialSelectedTenantName.toLowerCase()
          );
          if (match) {
            setSelectedTenant(match);
            setViewMode("detail");
          }
        }
      }

      if (roomsRes.data) {
        setRooms(roomsRes.data as Room[]);
      }
    } catch (err: any) {
      console.error("Error fetching tenants:", err.message);
      onShowToast("Gagal memuat data penghuni dari server.", "error");
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
      // 1. Update tenant status to inactive
      const { error: tenantErr } = await supabase
        .from("tenants")
        .update({
          status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", tenant.id);

      if (tenantErr) throw tenantErr;

      // 2. Update room status to available (kosong)
      if (tenant.room_number) {
        await supabase
          .from("rooms")
          .update({
            status: "available",
            tenant_name: null,
            updated_at: new Date().toISOString(),
          })
          .eq("room_number", tenant.room_number);
      }

      // Update state
      setTenants((prev) => prev.filter((t) => t.id !== tenant.id));
      setViewMode("list");
      setSelectedTenant(null);
      onShowToast(`Penghuni ${tenant.full_name} berhasil di-check out. Kamar ${tenant.room_number} kini Siap Huni.`, "success");
    } catch (err: any) {
      onShowToast(`Gagal memproses check-out: ${err.message}`, "error");
    }
  };

  const handleSaveTenant = async (formData: TenantFormData, tenantId?: string) => {
    try {
      if (tenantId) {
        // Update existing tenant
        const { error } = await supabase
          .from("tenants")
          .update({
            full_name: formData.full_name,
            nik: formData.nik,
            phone: formData.phone,
            email: formData.email,
            occupation: formData.occupation,
            institution: formData.institution,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_relation: formData.emergency_contact_relation,
            emergency_contact_phone: formData.emergency_contact_phone,
            room_id: formData.room_id,
            room_number: formData.room_number,
            floor: formData.floor,
            room_type: formData.room_type,
            check_in_date: formData.check_in_date,
            due_date_day: formData.due_date_day,
            rent_amount: formData.rent_amount,
            deposit_amount: formData.deposit_amount,
            invitation_code: formData.invitation_code,
            updated_at: new Date().toISOString(),
          })
          .eq("id", tenantId);

        if (error) throw error;

        // Update local state
        setTenants((prev) =>
          prev.map((t) =>
            t.id === tenantId
              ? {
                  ...t,
                  ...formData,
                }
              : t
          )
        );

        if (selectedTenant && selectedTenant.id === tenantId) {
          setSelectedTenant({
            ...selectedTenant,
            ...formData,
          });
        }

        onShowToast(`Data penghuni ${formData.full_name} berhasil diperbarui!`, "success");
        setViewMode("detail");
      } else {
        // Insert new tenant
        const newCode = `KM-P${String(tenants.length + 1).padStart(3, "0")}`;
        const { data, error } = await supabase
          .from("tenants")
          .insert([
            {
              tenant_code: newCode,
              full_name: formData.full_name,
              nik: formData.nik,
              phone: formData.phone,
              email: formData.email,
              occupation: formData.occupation,
              institution: formData.institution,
              emergency_contact_name: formData.emergency_contact_name,
              emergency_contact_relation: formData.emergency_contact_relation,
              emergency_contact_phone: formData.emergency_contact_phone,
              room_id: formData.room_id,
              room_number: formData.room_number,
              floor: formData.floor,
              property_name: "Kost Yusi",
              room_type: formData.room_type,
              check_in_date: formData.check_in_date,
              contract_type: "Bulanan",
              due_date_day: formData.due_date_day,
              rent_amount: formData.rent_amount,
              deposit_amount: formData.deposit_amount,
              status: "active",
              bill_status: "waiting_verification",
              bill_period: "Okt–Nov 2026",
              bill_amount: formData.rent_amount + formData.deposit_amount,
              overdue_days: 0,
              fine_amount: 0,
              invitation_code: formData.invitation_code,
            },
          ])
          .select();

        if (error) throw error;

        // Also update room to occupied and set tenant name
        await supabase
          .from("rooms")
          .update({
            status: "occupied",
            tenant_name: formData.full_name,
            updated_at: new Date().toISOString(),
          })
          .eq("room_number", formData.room_number);

        if (data && data.length > 0) {
          const created = data[0] as Tenant;
          setTenants((prev) => [created, ...prev]);
          setSelectedTenant(created);
        }

        onShowToast(`Penghuni ${formData.full_name} berhasil ditambahkan! Tautan aktivasi siap dibagikan.`, "success");
        setViewMode("list");
      }
    } catch (err: any) {
      console.error("Save tenant error:", err);
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
