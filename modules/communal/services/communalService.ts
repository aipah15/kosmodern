import { createClient } from "@/lib/supabase/client";
import { CommunalFridgeItem, CommunalAreaItem } from "@/types/communal";

// Layanan pemantauan fasilitas bersama (Kulkas & Tempat Penyimpanan)
export const communalService = {
  // Mengambil daftar makanan/minuman di kulkas bersama
  async getFridgeItems(): Promise<CommunalFridgeItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("communal_fridge_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Layanan kulkas:", error.message);
      return [];
    }
    return (data || []) as CommunalFridgeItem[];
  },

  // Menambahkan item baru ke kulkas bersama
  async addFridgeItem(item: Partial<CommunalFridgeItem>): Promise<CommunalFridgeItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("communal_fridge_items")
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as CommunalFridgeItem;
  },

  // Menghapus atau menandai item kulkas sudah diambil/dibuang
  async removeFridgeItem(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("communal_fridge_items").delete().eq("id", id);
    if (error) throw error;
  },

  // Mengambil daftar barang di area penyimpanan/ruang komunal
  async getStorageItems(): Promise<CommunalAreaItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("communal_area_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Layanan area komunal:", error.message);
      return [];
    }
    return (data || []) as CommunalAreaItem[];
  },

  // Mendaftarkan titipan barang baru
  async addStorageItem(item: Partial<CommunalAreaItem>): Promise<CommunalAreaItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("communal_area_items")
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as CommunalAreaItem;
  },

  // Menyita barang yang lewat batas waktu penitipan
  async seizeStorageItem(id: string, note?: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("communal_area_items")
      .update({
        is_seized: true,
        status: "transit",
        status_label: "Disita / Ditegur",
        note,
      })
      .eq("id", id);

    if (error) throw error;
  },
};
