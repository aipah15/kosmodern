export type TicketUrgency = 'urgent' | 'medium' | 'low';
export type TicketStatus = 'baru' | 'diproses' | 'selesai' | 'ditolak';

export interface MaintenanceTicket {
  id: string;
  ticket_code: string;
  title: string;
  description: string;
  urgency: TicketUrgency;
  urgency_label?: string;
  status: TicketStatus;
  status_label?: string;
  tenant_name: string;
  tenant_avatar?: string;
  room_number: string;
  floor?: string;
  lease_type?: string;
  access_permission?: string;
  tenant_phone?: string;
  area_location?: string;
  created_time?: string;
  created_date_str?: string;
  photo_url?: string;
  photo_name?: string;
  assigned_technician?: string;
  estimated_arrival?: string;
  repair_cost?: number;
  rating?: number | null;
  feedback_note?: string | null;
  completion_note?: string | null;
  created_at?: string;
  updated_at?: string;
}
