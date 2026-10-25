import { createClient } from "@/lib/supabase/client";
import { Room, RoomFilterTab, RoomFormData } from "@/types/room";

// Layanan pengelolaan data kamar kos
export const roomService = {
  // Mengambil daftar semua kamar dengan filter opsional
  async getRooms(filterTab: RoomFilterTab = "all"): Promise<Room[]> {
    const supabase = createClient();
    let query = supabase
      .from("rooms")
      .select("*")
      .order("room_number", { ascending: true });

    if (filterTab === "available") {
      query = query.in("status", ["available", "kosong"]);
    } else if (filterTab === "occupied") {
      query = query.in("status", ["occupied", "terisi"]);
    } else if (filterTab === "maintenance") {
      query = query.in("status", ["maintenance", "perbaikan"]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Room[];
  },

  // Mengambil detail satu kamar berdasarkan ID
  async getRoomById(id: string): Promise<Room | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Room;
  },

  // Menambahkan data kamar baru
  async createRoom(formData: RoomFormData): Promise<Room> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        room_number: formData.room_number,
        floor: formData.floor,
        room_type: formData.room_type,
        price: formData.price,
        status: formData.status,
        facilities: formData.facilities,
        description: formData.description,
        property_name: formData.property_name || "Kost Yusi",
      })
      .select()
      .single();

    if (error) throw error;
    return data as Room;
  },

  // Memperbarui data kamar
  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rooms")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Room;
  },

  // Menghapus data kamar
  async deleteRoom(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) throw error;
  },

  // Menghitung statistik ketersediaan kamar untuk kartu KPI
  async getRoomStats() {
    const rooms = await this.getRooms("all");
    const total = rooms.length;
    const occupied = rooms.filter(
      (r) => r.status === "occupied" || r.status === "terisi"
    ).length;
    const available = rooms.filter(
      (r) => r.status === "available" || r.status === "kosong"
    ).length;
    const maintenance = rooms.filter(
      (r) => r.status === "maintenance" || r.status === "perbaikan"
    ).length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return {
      total,
      occupied,
      available,
      maintenance,
      occupancyRate,
    };
  },
};
