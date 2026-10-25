export type RoomStatus =
  | "available"
  | "occupied"
  | "maintenance"
  | "kosong"
  | "terisi"
  | "perbaikan";

export interface Room {
  id: string;
  room_number: string;
  floor: string;
  room_type: string;
  price: number;
  status: RoomStatus;
  description?: string | null;
  image_url?: string | null;
  facilities: string[];
  tenant_name?: string | null;
  tenant_avatar?: string | null;
  tenant_id?: string | null;
  maintenance_title?: string | null;
  maintenance_note?: string | null;
  property_name?: string;
  property_address?: string;
  created_at?: string;
  updated_at?: string;
}

export type RoomFilterTab = "all" | "occupied" | "available" | "maintenance";

export interface RoomFormData {
  room_number: string;
  floor: string;
  room_type: string;
  price: number;
  status: RoomStatus;
  facilities: string[];
  description: string;
  property_name?: string;
}
