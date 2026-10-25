import { createClient } from "@/lib/supabase/client";
import { uploadImageToStorage } from "@/lib/utils/storage";
import { announcementService } from "@/modules/announcements/services/announcementService";
import { tenantService } from "@/modules/tenants/services/tenantService";
import { AnnouncementItem } from "@/types/announcement";
import { Bill } from "@/types/bill";
import { CommunalAreaItem, CommunalFridgeItem } from "@/types/communal";
import { MaintenanceTicket, TicketUrgency } from "@/types/maintenance";
import { BankAccount, PaymentSettings } from "@/types/payment-settings";
import { PaymentProofItem } from "@/types/proof";
import { Tenant } from "@/types/tenant";

// Kolom tambahan khusus portal penghuni (lihat scripts/migrate-tenant-portal.mjs)
export type TenantTicket = MaintenanceTicket & {
  tenant_id?: string | null;
  location_type?: "pribadi" | "umum" | null;
};

export type TenantFridgeItem = CommunalFridgeItem & {
  tenant_id?: string | null;
  tenant_phone?: string | null;
  expiry_date?: string | null;
  quantity_note?: string | null;
  shelf_type?: string | null;
  photo_url?: string | null;
  notes?: string | null;
};

export type TenantAreaItem = CommunalAreaItem & {
  tenant_id?: string | null;
  tenant_phone?: string | null;
  photo_url?: string | null;
};

export interface PropertySettingsRow {
  id: string;
  profile: Record<string, any>;
  policies: Record<string, any>;
}

export interface PortalData {
  tenant: Tenant;
  bills: Bill[];
  proofs: PaymentProofItem[];
  announcements: AnnouncementItem[];
  tickets: TenantTicket[];
  fridgeItems: TenantFridgeItem[];
  areaItems: TenantAreaItem[];
  bankAccounts: BankAccount[];
  paymentSettings: PaymentSettings | null;
  propertySettings: PropertySettingsRow | null;
}

const OUTSTANDING = ["unpaid", "belum_bayar", "overdue", "terlambat", "pending", "menunggu_verifikasi"];

function unwrap<T>(res: { data: T | null; error: { message: string } | null }, label: string): T {
  if (res.error) throw new Error(`${label}: ${res.error.message}`);
  return (res.data ?? ([] as unknown)) as T;
}

// Pengumuman yang relevan untuk satu penghuni (semua, per lantai, atau spesifik)
function announcementsForTenant(all: AnnouncementItem[], tenant: Tenant): AnnouncementItem[] {
  return all.filter((a) => {
    if (a.target_audience === "floor") return (a.target_floors || []).includes(tenant.floor);
    if (a.target_audience === "specific") return (a.target_tenant_ids || []).includes(tenant.id);
    return true;
  });
}

export const portalService = {
  // Muat seluruh data portal untuk penghuni yang sedang login. Mengembalikan null jika akun bukan penghuni.
  async load(userId: string): Promise<PortalData | null> {
    const supabase = createClient();
    const tenant = await tenantService.getTenantByUserId(userId);
    if (!tenant) return null;

    const [bills, proofs, allAnnouncements, tickets, fridge, area, banks, payRes, propRes] =
      await Promise.all([
        supabase.from("bills").select("*").eq("tenant_id", tenant.id).order("due_date", { ascending: false }),
        supabase.from("payment_proofs").select("*").eq("tenant_id", tenant.id).order("created_at", { ascending: false }),
        announcementService.getAnnouncements(),
        supabase
          .from("maintenance_tickets")
          .select("*")
          .or(`tenant_id.eq.${tenant.id},location_type.eq.umum`)
          .order("created_at", { ascending: false }),
        supabase.from("communal_fridge_items").select("*").order("created_at", { ascending: false }),
        supabase.from("communal_area_items").select("*").eq("is_seized", false).order("created_at", { ascending: false }),
        supabase.from("bank_accounts").select("*").eq("is_active", true).order("is_primary", { ascending: false }),
        supabase.from("payment_settings").select("*").limit(1).maybeSingle(),
        supabase.from("property_settings").select("*").limit(1).maybeSingle(),
      ]);

    return {
      tenant,
      bills: unwrap<Bill[]>(bills, "Tagihan").filter((b) => b.status !== "draft"),
      proofs: unwrap<PaymentProofItem[]>(proofs, "Bukti pembayaran"),
      announcements: announcementsForTenant(allAnnouncements, tenant),
      tickets: unwrap<TenantTicket[]>(tickets, "Laporan kerusakan"),
      fridgeItems: unwrap<TenantFridgeItem[]>(fridge, "Kulkas bersama"),
      areaItems: unwrap<TenantAreaItem[]>(area, "Barang area bersama"),
      bankAccounts: unwrap<BankAccount[]>(banks, "Rekening"),
      paymentSettings: (payRes.data as PaymentSettings | null) ?? null,
      // tabel property_settings bisa belum dimigrasi; abaikan error agar portal tetap terbuka
      propertySettings: propRes.error ? null : ((propRes.data as PropertySettingsRow | null) ?? null),
    };
  },

  // Kirim bukti transfer untuk satu atau beberapa tagihan sekaligus
  async submitPaymentProof(input: {
    tenant: Tenant;
    bills: Bill[];
    bank: BankAccount | null;
    senderBank: string;
    senderName: string;
    note: string;
    file: File;
  }): Promise<void> {
    const supabase = createClient();
    const { tenant, bills, bank, file } = input;
    if (bills.length === 0) throw new Error("Tidak ada tagihan yang dibayar.");

    const upload = await uploadImageToStorage({ file, folder: "payment-proofs" });
    if (upload.error || !upload.publicUrl) {
      throw new Error(`Gagal mengunggah bukti: ${upload.error?.message || "kesalahan tidak diketahui"}`);
    }

    const main = bills[0];
    const total = bills.reduce((acc, b) => acc + Number(b.amount || 0) + Number(b.fine_amount || 0), 0);
    const now = new Date();

    const { error } = await supabase.from("payment_proofs").insert({
      invoice_number: main.invoice_number,
      invoice_numbers: bills.map((b) => b.invoice_number),
      tenant_id: tenant.id,
      resident_name: tenant.full_name,
      tenant_name: tenant.full_name,
      room_number: tenant.room_number,
      floor: tenant.floor,
      property_name: tenant.property_name,
      amount: total,
      bank_name: input.senderBank,
      bank_sender: input.senderBank,
      sender_name: input.senderName,
      bank_receiver: bank?.bank_name ?? null,
      account_receiver: bank?.account_number ?? null,
      receiver_name: bank?.account_holder ?? null,
      time_transfer: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      transfer_date_time: now.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }),
      period: main.period,
      note: input.note || null,
      tenant_message: input.note || null,
      proof_image_url: upload.publicUrl,
      status: "pending",
    });
    if (error) throw new Error(`Gagal menyimpan bukti pembayaran: ${error.message}`);

    const { error: billError } = await supabase
      .from("bills")
      .update({ status: "pending", updated_at: now.toISOString() })
      .in("id", bills.map((b) => b.id));
    if (billError) throw new Error(`Gagal memperbarui status tagihan: ${billError.message}`);
  },

  // Buat laporan kerusakan baru
  async createTicket(input: {
    tenant: Tenant;
    title: string;
    description: string;
    urgency: TicketUrgency;
    locationType: "pribadi" | "umum";
    areaLocation?: string;
    accessPermission: string;
    photo?: File | null;
  }): Promise<TenantTicket> {
    const supabase = createClient();
    const { tenant } = input;

    let photoUrl: string | null = null;
    let photoName: string | null = null;
    if (input.photo) {
      const up = await uploadImageToStorage({ file: input.photo, folder: "tickets" });
      if (up.error || !up.publicUrl) {
        throw new Error(`Gagal mengunggah foto: ${up.error?.message || "kesalahan tidak diketahui"}`);
      }
      photoUrl = up.publicUrl;
      photoName = input.photo.name;
    }

    const { data: codes } = await supabase.from("maintenance_tickets").select("ticket_code");
    const maxCode = (codes || []).reduce((max: number, r: { ticket_code: string }) => {
      const n = parseInt(String(r.ticket_code).replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);

    const urgencyLabels: Record<TicketUrgency, string> = {
      urgent: "URGENSI TINGGI (< 3 jam)",
      medium: "SEDANG (1x24 jam)",
      low: "RINGAN",
    };
    const now = new Date();

    const { data, error } = await supabase
      .from("maintenance_tickets")
      .insert({
        ticket_code: `#TK-${String(maxCode + 1).padStart(4, "0")}`,
        tenant_id: tenant.id,
        title: input.title,
        description: input.description,
        urgency: input.urgency,
        urgency_label: urgencyLabels[input.urgency],
        status: "baru",
        status_label: "Menunggu Respon",
        tenant_name: tenant.full_name,
        tenant_avatar: tenant.full_name.slice(0, 2).toUpperCase(),
        room_number: tenant.room_number,
        floor: tenant.floor,
        access_permission: input.accessPermission,
        tenant_phone: tenant.phone,
        location_type: input.locationType,
        area_location:
          input.locationType === "umum"
            ? input.areaLocation || "Area Umum"
            : `Kamar ${tenant.room_number} • ${tenant.floor}`,
        created_time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        created_date_str: now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        photo_url: photoUrl,
        photo_name: photoName,
        assigned_technician: null,
        estimated_arrival: null,
        repair_cost: 0,
      })
      .select()
      .single();
    if (error) throw new Error(`Gagal mengirim laporan: ${error.message}`);
    return data as TenantTicket;
  },

  // Konfirmasi penghuni bahwa perbaikan sudah selesai + penilaian
  async confirmTicketDone(ticketId: string, rating: number | null, feedback: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("maintenance_tickets")
      .update({
        status: "selesai",
        status_label: "Selesai (Dikonfirmasi Penghuni)",
        rating,
        feedback_note: feedback || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);
    if (error) throw new Error(`Gagal mengonfirmasi tiket: ${error.message}`);
  },

  // Daftarkan makanan/minuman ke kulkas bersama
  async createFridgeItem(input: {
    tenant: Tenant;
    name: string;
    quantityNote: string;
    shelfType: string;
    shelfLabel: string;
    expiryDate: string; // YYYY-MM-DD
    notes: string;
    photo?: File | null;
  }): Promise<TenantFridgeItem> {
    const supabase = createClient();
    const { tenant } = input;

    let photoUrl: string | null = null;
    if (input.photo) {
      const up = await uploadImageToStorage({ file: input.photo, folder: "fridge" });
      if (up.error || !up.publicUrl) {
        throw new Error(`Gagal mengunggah foto: ${up.error?.message || "kesalahan tidak diketahui"}`);
      }
      photoUrl = up.publicUrl;
    }

    const { data, error } = await supabase
      .from("communal_fridge_items")
      .insert({
        tenant_id: tenant.id,
        tenant_name: tenant.full_name,
        tenant_phone: tenant.phone,
        room_number: tenant.room_number,
        floor: tenant.floor,
        item_name: input.name,
        quantity_note: input.quantityNote,
        storage_location: input.shelfLabel,
        shelf_type: input.shelfType,
        entry_date: new Date().toISOString().slice(0, 10),
        expiry_date: input.expiryDate,
        status: "safe",
        status_label: "Aman",
        notes: input.notes || null,
        photo_url: photoUrl,
      })
      .select()
      .single();
    if (error) throw new Error(`Gagal menyimpan barang kulkas: ${error.message}`);
    return data as TenantFridgeItem;
  },

  async deleteFridgeItem(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("communal_fridge_items").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus barang: ${error.message}`);
  },

  // Titipkan barang di area bersama
  async createAreaItem(input: {
    tenant: Tenant;
    name: string;
    zoneId: string;
    zoneName: string;
    zoneSubtitle: string;
    note: string;
    photo?: File | null;
  }): Promise<TenantAreaItem> {
    const supabase = createClient();
    const { tenant } = input;

    let photoUrl: string | null = null;
    if (input.photo) {
      const up = await uploadImageToStorage({ file: input.photo, folder: "area-items" });
      if (up.error || !up.publicUrl) {
        throw new Error(`Gagal mengunggah foto: ${up.error?.message || "kesalahan tidak diketahui"}`);
      }
      photoUrl = up.publicUrl;
    }

    const { data, error } = await supabase
      .from("communal_area_items")
      .insert({
        tenant_id: tenant.id,
        tenant_name: tenant.full_name,
        tenant_phone: tenant.phone,
        room_number: tenant.room_number,
        zone_id: input.zoneId,
        zone_name: input.zoneName,
        zone_subtitle: input.zoneSubtitle,
        item_name: input.name,
        time_ago: "Baru saja",
        status: "normal",
        status_label: "Dicatat Penghuni",
        note: input.note || null,
        photo_url: photoUrl,
        is_seized: false,
      })
      .select()
      .single();
    if (error) throw new Error(`Gagal mencatat barang: ${error.message}`);
    return data as TenantAreaItem;
  },

  async deleteAreaItem(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("communal_area_items").delete().eq("id", id);
    if (error) throw new Error(`Gagal menghapus barang: ${error.message}`);
  },
};

// ---------- Turunan tagihan ----------

export type ActiveBillState = "belum_bayar" | "verifikasi" | "lunas" | "terlambat";

export interface BillingOverview {
  state: ActiveBillState;
  mainBill: Bill | null;
  extraBills: Bill[];
  payableBills: Bill[]; // tagihan yang dibayar bersamaan (utama + tambahan)
  total: number;
  isPendingVerification: boolean;
}

const billTotal = (b: Bill) => Number(b.amount || 0) + Number(b.fine_amount || 0);

export function getBillingOverview(bills: Bill[], today = new Date()): BillingOverview {
  const outstanding = bills
    .filter((b) => OUTSTANDING.includes(b.status))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  if (outstanding.length === 0) {
    const lastPaid = bills.find((b) => b.status === "paid" || b.status === "lunas") ?? null;
    return { state: "lunas", mainBill: lastPaid, extraBills: [], payableBills: [], total: 0, isPendingVerification: false };
  }

  const mainBill = outstanding.find((b) => b.bill_category === "sewa") ?? outstanding[0];
  const extraBills = outstanding.filter((b) => b.id !== mainBill.id);
  const payableBills = [mainBill, ...extraBills.filter((b) => !["pending", "menunggu_verifikasi"].includes(b.status))];
  const isPendingVerification = ["pending", "menunggu_verifikasi"].includes(mainBill.status);
  const isLate =
    ["overdue", "terlambat"].includes(mainBill.status) ||
    (!isPendingVerification && new Date(mainBill.due_date).getTime() < today.setHours(0, 0, 0, 0));

  return {
    state: isPendingVerification ? "verifikasi" : isLate ? "terlambat" : "belum_bayar",
    mainBill,
    extraBills,
    payableBills,
    total: [mainBill, ...extraBills].reduce((acc, b) => acc + billTotal(b), 0),
    isPendingVerification,
  };
}

export { billTotal };

// Hari lagi / lewat berapa hari relatif terhadap tanggal tertentu (negatif = sudah lewat)
export function daysUntil(dateStr: string | null | undefined, today = new Date()): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}
