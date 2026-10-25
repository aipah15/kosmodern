import { createClient } from "@/lib/supabase/client";
import { Bill, BillFilterTab, BillStatus, CreateExtraBillFormData } from "@/types/bill";

// Layanan pengelolaan tagihan sewa dan biaya tambahan
export const billingService = {
  // Mengambil seluruh daftar tagihan dengan opsi filter status
  async getBills(filterTab: BillFilterTab = "all"): Promise<Bill[]> {
    const supabase = createClient();
    let query = supabase
      .from("bills")
      .select("*")
      .order("due_date", { ascending: false });

    if (filterTab === "paid") {
      query = query.in("status", ["paid", "lunas"]);
    } else if (filterTab === "pending") {
      query = query.in("status", ["pending", "menunggu_verifikasi"]);
    } else if (filterTab === "unpaid") {
      query = query.in("status", ["unpaid", "belum_bayar"]);
    } else if (filterTab === "overdue") {
      query = query.in("status", ["overdue", "terlambat"]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Bill[];
  },

  // Mengambil daftar tagihan milik satu penghuni tertentu
  async getBillsByTenantId(tenantId: string): Promise<Bill[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("due_date", { ascending: false });

    if (error) throw error;
    return (data || []) as Bill[];
  },

  // Membuat tagihan tambahan untuk satu atau beberapa penghuni sekaligus
  async createExtraBills(formData: CreateExtraBillFormData) {
    const supabase = createClient();

    // Ambil data penghuni yang dipilih
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select("*")
      .in("id", formData.selected_tenant_ids);

    if (tenantsError || !tenants) {
      throw new Error("Gagal mengambil data penghuni terpilih.");
    }

    const newBills = tenants.map((tenant) => ({
      invoice_number: `INV-${Date.now().toString().slice(-6)}-${tenant.room_number}`,
      tenant_id: tenant.id,
      tenant_name: tenant.full_name,
      tenant_code: tenant.tenant_code,
      tenant_phone: tenant.phone,
      room_id: tenant.room_id,
      room_number: tenant.room_number,
      floor: tenant.floor,
      property_name: tenant.property_name,
      bill_category: formData.bill_category,
      title: formData.title,
      period: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
      amount: formData.amount_per_tenant,
      fine_amount: 0,
      status: formData.is_draft ? "draft" : "unpaid",
      due_date: formData.due_date,
      send_whatsapp: formData.send_whatsapp,
    }));

    const { data, error } = await supabase.from("bills").insert(newBills).select();
    if (error) throw error;
    return data;
  },

  // Memperbarui status pembayaran tagihan
  async updateBillStatus(id: string, status: BillStatus): Promise<Bill> {
    const supabase = createClient();
    const isPaid = status === "paid" || status === "lunas";

    const { data, error } = await supabase
      .from("bills")
      .update({
        status,
        paid_at: isPaid ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Bill;
  },

  // Menghitung ringkasan total tagihan dan pembayaran
  async getBillingSummary() {
    const bills = await this.getBills("all");
    const totalBills = bills.length;
    const paidBills = bills.filter((b) => b.status === "paid" || b.status === "lunas");
    // Tagihan belum dibayar yang sudah lewat jatuh tempo dihitung terlambat, konsisten dengan daftar tunggakan
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const isPastDue = (b: { due_date: string }) => !!b.due_date && new Date(b.due_date).getTime() < startOfToday;
    const overdueBills = bills.filter(
      (b) =>
        b.status === "overdue" ||
        b.status === "terlambat" ||
        ((b.status === "unpaid" || b.status === "belum_bayar") && isPastDue(b))
    );
    const unpaidBills = bills.filter(
      (b) => (b.status === "unpaid" || b.status === "belum_bayar") && !overdueBills.includes(b)
    );

    // Uang masuk dihitung hanya untuk tagihan yang dilunasi pada bulan berjalan
    const now = new Date();
    const paidThisMonth = paidBills.filter((b) => {
      const paidAt = new Date(b.paid_at || b.updated_at || b.created_at || 0);
      return paidAt.getMonth() === now.getMonth() && paidAt.getFullYear() === now.getFullYear();
    });
    const totalRevenue = paidThisMonth.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    // Total tunggakan = belum dibayar + terlambat (termasuk denda)
    const pendingRevenue = [...unpaidBills, ...overdueBills].reduce(
      (acc, curr) => acc + Number(curr.amount || 0) + Number(curr.fine_amount || 0),
      0
    );

    return {
      totalBills,
      paidCount: paidBills.length,
      unpaidCount: unpaidBills.length,
      overdueCount: overdueBills.length,
      totalRevenue,
      pendingRevenue,
    };
  },
};
