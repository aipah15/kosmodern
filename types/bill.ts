export type BillStatus =
  | "paid"
  | "pending"
  | "unpaid"
  | "overdue"
  | "draft"
  | "lunas"
  | "menunggu_verifikasi"
  | "belum_bayar"
  | "terlambat";

export type BillCategory =
  | "sewa"
  | "listrik"
  | "air"
  | "denda"
  | "deposit"
  | "lainnya";

export interface Bill {
  id: string;
  invoice_number: string;
  tenant_id?: string | null;
  tenant_name: string;
  tenant_code?: string | null;
  tenant_phone?: string | null;
  room_id?: string | null;
  room_number: string;
  floor: string;
  room_type: string;
  property_name: string;
  bill_category: BillCategory;
  title: string;
  period: string;
  amount: number;
  fine_amount: number;
  status: BillStatus;
  due_date: string;
  paid_at?: string | null;
  payment_method?: string | null;
  proof_url?: string | null;
  notes?: string | null;
  send_whatsapp?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type BillFilterTab = "all" | "paid" | "pending" | "unpaid" | "overdue";

export interface CreateExtraBillFormData {
  selected_tenant_ids: string[];
  bill_category: BillCategory;
  title: string;
  amount_per_tenant: number;
  due_date: string;
  send_whatsapp: boolean;
  is_draft?: boolean;
}
