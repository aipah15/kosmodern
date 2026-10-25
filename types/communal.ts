export interface CommunalFridgeItem {
  id: string;
  tenant_name: string;
  room_number: string;
  floor?: string;
  item_name: string;
  storage_location: string;
  entry_date: string;
  status: 'expired' | 'warning' | 'safe';
  status_label: string;
  category?: string;
  created_at?: string;
}

export interface CommunalAreaItem {
  id: string;
  zone_id: string;
  zone_name: string;
  zone_subtitle?: string;
  item_name: string;
  tenant_name: string;
  room_number: string;
  time_ago: string;
  status: 'safe' | 'normal' | 'warning' | 'overdue' | 'transit';
  status_label: string;
  note?: string | null;
  is_seized?: boolean;
  created_at?: string;
}
