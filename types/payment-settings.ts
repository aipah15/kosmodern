export interface BankAccount {
  id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_holder: string;
  branch?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentSettings {
  id?: string;
  qris_merchant_name: string;
  qris_nmid: string;
  qris_city: string;
  qris_postal_code: string;
  qris_image_url?: string;
  qris_is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
