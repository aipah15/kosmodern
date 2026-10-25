"use client";

import React, { useState, useEffect } from "react";
import { Bill, CreateExtraBillFormData } from "@/types/bill";
import { Tenant } from "@/types/tenant";
import { BillingManagementSection } from "./BillingManagementSection";
import { ExtraBillFormSection } from "./ExtraBillFormSection";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PROPERTY } from "@/lib/constants";

interface TagihanManagementWrapperProps {
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onNavigateToProof?: () => void;
}

export const TagihanManagementWrapper: React.FC<TagihanManagementWrapperProps> = ({
  onShowToast,
  onNavigateToProof,
}) => {
  const [mode, setMode] = useState<"list" | "create_extra">("list");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function loadTenants() {
      try {
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .order("room_number", { ascending: true });

        if (!error && data) {
          setTenants(data as Tenant[]);
        }
      } catch (err: any) {
        console.error("Error loading tenants for bills:", err.message);
      }
    }
    loadTenants();
  }, [supabase]);

  const handleCreateExtraBill = async (formData: CreateExtraBillFormData) => {
    try {
      const selectedTenants = tenants.filter((t) => formData.selected_tenant_ids.includes(t.id));
      const today = new Date();
      const period = today.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

      const newBills = selectedTenants.map((tenant, idx) => {
        const randomSuffix = Math.floor(100 + Math.random() * 900) + idx;
        const invoiceNumber = `INV-MAN-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}-${randomSuffix}`;

        return {
          invoice_number: invoiceNumber,
          tenant_id: tenant.id,
          tenant_name: tenant.full_name,
          tenant_code: tenant.tenant_code,
          tenant_phone: tenant.phone,
          room_id: tenant.room_id || null,
          room_number: tenant.room_number,
          floor: tenant.floor || "Lt. 1",
          room_type: tenant.room_type || "Deluxe AC",
          property_name: DEFAULT_PROPERTY.name,
          bill_category: formData.bill_category,
          title: formData.title,
          period: period,
          amount: formData.amount_per_tenant,
          fine_amount: 0,
          status: formData.is_draft ? "draft" : "unpaid",
          due_date: formData.due_date,
          send_whatsapp: formData.send_whatsapp,
        };
      });

      const { error } = await supabase.from("bills").insert(newBills);
      if (error) throw error;

      onShowToast(
        `Berhasil menerbitkan tagihan ${formData.title} untuk ${selectedTenants.length} penghuni!`,
        "success"
      );
      setMode("list");
    } catch (err: any) {
      console.error("Create bill error:", err);
      onShowToast(`Gagal menerbitkan tagihan: ${err.message}`, "error");
      throw err;
    }
  };

  return (
    <div>
      {mode === "list" ? (
        <BillingManagementSection
          onShowCreateExtraBill={() => setMode("create_extra")}
          onShowToast={onShowToast}
          onNavigateToProof={onNavigateToProof}
        />
      ) : (
        <ExtraBillFormSection
          tenants={tenants}
          onBack={() => setMode("list")}
          onSubmit={handleCreateExtraBill}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
