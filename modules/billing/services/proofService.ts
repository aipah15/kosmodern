import { createClient } from "@/lib/supabase/client";
import { PaymentProofItem, ProofFilterTab } from "@/types/proof";

// Layanan pengunggahan dan verifikasi bukti transfer pembayaran
export const proofService = {
  // Mengambil daftar bukti pembayaran yang masuk
  async getPaymentProofs(filterTab: ProofFilterTab = "all"): Promise<PaymentProofItem[]> {
    const supabase = createClient();
    let query = supabase
      .from("payment_proofs")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterTab === "pending") {
      query = query.eq("status", "pending");
    } else if (filterTab === "rejected") {
      query = query.eq("status", "rejected");
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as PaymentProofItem[];
  },

  // Mengunggah bukti transfer baru oleh penghuni
  async submitPaymentProof(proofData: Partial<PaymentProofItem>): Promise<PaymentProofItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("payment_proofs")
      .insert({
        ...proofData,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data as PaymentProofItem;
  },

  // Menyetujui bukti transfer dan memperbarui status tagihan menjadi lunas
  async approveProof(proofId: string, invoiceNumber?: string): Promise<void> {
    const supabase = createClient();

    // 1. Update status bukti menjadi approved
    const { error: proofError } = await supabase
      .from("payment_proofs")
      .update({
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", proofId);

    if (proofError) throw proofError;

    // 2. Ubah status seluruh tagihan yang dibayar lewat bukti ini menjadi paid
    const { data: proof } = await supabase
      .from("payment_proofs")
      .select("invoice_number, invoice_numbers, bank_name")
      .eq("id", proofId)
      .maybeSingle();
    const invoices = Array.from(
      new Set([...(proof?.invoice_numbers || []), proof?.invoice_number, invoiceNumber].filter(Boolean))
    ) as string[];

    if (invoices.length > 0) {
      const { error: billError } = await supabase
        .from("bills")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: proof?.bank_name || null,
          updated_at: new Date().toISOString(),
        })
        .in("invoice_number", invoices);

      if (billError) throw billError;
    }
  },

  // Menolak bukti transfer dengan alasan penolakan
  async rejectProof(proofId: string, reason: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("payment_proofs")
      .update({
        status: "rejected",
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proofId);

    if (error) throw error;

    // Kembalikan tagihan terkait ke status belum dibayar agar penghuni bisa mengunggah ulang
    const { data: proof } = await supabase
      .from("payment_proofs")
      .select("invoice_number, invoice_numbers")
      .eq("id", proofId)
      .maybeSingle();
    const invoices = Array.from(
      new Set([...(proof?.invoice_numbers || []), proof?.invoice_number].filter(Boolean))
    ) as string[];
    if (invoices.length > 0) {
      const { error: billError } = await supabase
        .from("bills")
        .update({ status: "unpaid", updated_at: new Date().toISOString() })
        .in("invoice_number", invoices)
        .in("status", ["pending", "menunggu_verifikasi"]);
      if (billError) throw billError;
    }
  },
};
