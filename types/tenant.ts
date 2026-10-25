export type TenantStatus = "active" | "inactive" | "pending";

export type TenantBillStatus =
  | "waiting_verification"
  | "paid"
  | "unpaid"
  | "overdue";

export interface Tenant {
  id: string;
  tenant_code: string;
  full_name: string;
  email?: string | null;
  phone: string;
  nik?: string | null;
  occupation?: string | null;
  institution?: string | null;
  origin_city?: string | null;
  origin_address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relation?: string | null;
  emergency_contact_phone?: string | null;
  room_id?: string | null;
  room_number: string;
  floor: string;
  property_name: string;
  room_type: string;
  check_in_date: string;
  contract_type: string;
  due_date_day: number;
  rent_amount: number;
  deposit_amount: number;
  status: TenantStatus;
  bill_status: TenantBillStatus;
  bill_period: string;
  bill_amount: number;
  overdue_days: number;
  fine_amount: number;
  invitation_code?: string | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TenantFormData {
  full_name: string;
  nik?: string;
  phone: string;
  email?: string;
  occupation?: string;
  institution?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  room_id: string;
  room_number: string;
  floor: string;
  room_type: string;
  check_in_date: string;
  due_date_day: number;
  rent_amount: number;
  deposit_amount: number;
  invitation_code: string;
}
