import { createClient } from "@/lib/supabase/client";
import { AnnouncementItem } from "@/types/announcement";

// Layanan publikasi pengumuman dan siaran info kos
export const announcementService = {
  // Mengambil daftar seluruh pengumuman aktif
  async getAnnouncements(): Promise<AnnouncementItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Layanan pengumuman:", error.message);
      return [];
    }
    return (data || []) as AnnouncementItem[];
  },

  // Membuat dan menyiarkan pengumuman baru
  async createAnnouncement(
    announcement: Partial<AnnouncementItem>
  ): Promise<AnnouncementItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("announcements")
      .insert({
        ...announcement,
        is_pinned: announcement.is_pinned || false,
        is_important: announcement.is_important || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AnnouncementItem;
  },

  // Menghapus pengumuman
  async deleteAnnouncement(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;
  },
};
