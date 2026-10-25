export type ProofStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentProofItem {
  id: string;
  invoice_number?: string;
  invoice_numbers?: string[] | null;
  tenant_id?: string;
  tenant_name: string;
  resident_name: string;
  room_number: string;
  floor?: string;
  property_name?: string;
  amount: number;
  bank_name: string;
  bank_sender?: string;
  account_sender?: string;
  sender_name?: string;
  bank_receiver?: string;
  account_receiver?: string;
  receiver_name?: string;
  time_transfer: string;
  transfer_date_time?: string;
  period?: string;
  note?: string;
  tenant_message?: string;
  proof_image_url?: string;
  reference_number?: string;
  status: ProofStatus;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ProofFilterTab = 'pending' | 'all' | 'approved' | 'rejected';
