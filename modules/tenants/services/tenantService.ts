import { createClient } from "@/lib/supabase/client";
import { Tenant, TenantFormData, TenantStatus } from "@/types/tenant";

// Layanan pengelolaan data penghuni kos
export const tenantService = {
  // Mengambil daftar seluruh penghuni kos
  async getTenants(status?: TenantStatus): Promise<Tenant[]> {
    const supabase = createClient();
    let query = supabase
      .from("tenants")
      .select("*")
      .order("room_number", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    const tenants = (data || []) as Tenant[];

    // Lantai, tipe, dan nomor kamar diambil dari tabel rooms (sumber kebenaran);
    // salinan di baris tenants bisa tidak sinkron.
    const { data: rooms } = await supabase.from("rooms").select("id, room_number, floor, room_type");
    const byId = new Map((rooms || []).map((r) => [r.id, r]));
    return tenants.map((t) => {
      const room = t.room_id ? byId.get(t.room_id) : undefined;
      return room
        ? { ...t, room_number: room.room_number, floor: room.floor ?? t.floor, room_type: room.room_type ?? t.room_type }
        : t;
    });
  },

  // Mengambil data penghuni berdasarkan ID
  async getTenantById(id: string): Promise<Tenant | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Tenant;
  },

  // Mengambil data profil penghuni berdasarkan Auth User ID
  async getTenantByUserId(userId: string): Promise<Tenant | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as Tenant | null;
  },

  // Menambahkan data penghuni baru secara manual oleh pemilik
  async createTenant(formData: TenantFormData): Promise<Tenant> {
    const supabase = createClient();
    const tenantCode = `P-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from("tenants")
      .insert({
        ...formData,
        tenant_code: tenantCode,
        status: "active",
        bill_status: "unpaid",
      })
      .select()
      .single();

    if (error) throw error;

    // Sinkronkan status kamar menjadi occupied
    if (formData.room_id) {
      await supabase
        .from("rooms")
        .update({
          status: "occupied",
          tenant_name: formData.full_name,
        })
        .eq("id", formData.room_id);
    }

    return data as Tenant;
  },

  // Memperbarui data informasi penghuni
  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tenants")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Tenant;
  },

  // Menghapus penghuni dan mengosongkan status kamar
  async deleteTenant(id: string, roomId?: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("tenants").delete().eq("id", id);
    if (error) throw error;

    if (roomId) {
      await supabase
        .from("rooms")
        .update({
          status: "available",
          tenant_name: null,
        })
        .eq("id", roomId);
    }
  },

  // Membuat kode undangan pendaftaran baru untuk kamar tertentu
  async generateInviteCode(roomId: string): Promise<string> {
    const supabase = createClient();
    const randomCode = `KOS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const { error } = await supabase.from("invitations").insert({
      code: randomCode,
      room_id: roomId,
      is_used: false,
    });

    if (error) throw error;
    return randomCode;
  },
};
