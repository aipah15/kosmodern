import { createClient } from "@/lib/supabase/client";
import { InvitationData, UserRegisteredData } from "@/types/auth";

// Layanan autentikasi, session, dan aktivasi kode undangan
export const authService = {
  // Masuk menggunakan email dan kata sandi
  async signIn(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Keluar dari akun
  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Mengambil data user yang sedang login beserta role-nya
  async getCurrentUser() {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const role = user.user_metadata?.role || "tenant";
    return {
      ...user,
      role,
      isOwner: role === "owner" || user.email === "owner@kostyusi.com",
    };
  },

  // Verifikasi keabsahan kode undangan kamar
  async verifyInvitationCode(code: string): Promise<InvitationData> {
    const supabase = createClient();
    const cleanCode = code.trim().toUpperCase();

    const { data, error } = await supabase
      .from("invitations")
      .select("*, room:rooms(*)")
      .eq("code", cleanCode)
      .single();

    if (error || !data) {
      throw new Error("Kode undangan tidak ditemukan atau tidak valid.");
    }

    if (data.is_used) {
      throw new Error("Kode undangan ini sudah pernah digunakan.");
    }

    return data as InvitationData;
  },

  // Pendaftaran dan aktivasi akun penghuni baru via kode undangan
  async completeRegistration(formData: {
    fullName: string;
    email: string;
    phone: string;
    nik: string;
    password: string;
    invitation: InvitationData;
  }): Promise<UserRegisteredData> {
    const supabase = createClient();

    // 1. Buat akun auth baru
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          role: "tenant",
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Gagal membuat akun.");
    }

    const userId = authData.user.id;
    const room = formData.invitation.room;

    // 2. Masukkan data ke tabel penghuni (tenants). Kegagalan di sini harus terlihat,
    //    jangan sampai kamar ditandai terisi tanpa baris penghuni.
    if (room) {
      const tenantCode = `KM-P${Math.floor(100 + Math.random() * 900)}`;
      const { data: tenantRow, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          tenant_code: tenantCode,
          user_id: userId,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          nik: formData.nik,
          room_id: room.id,
          room_number: room.room_number,
          floor: room.floor,
          property_name: room.property_name || "Kost Yusi",
          room_type: room.room_type,
          rent_amount: room.price,
          status: "active",
          bill_status: "unpaid",
          invitation_code: formData.invitation.code,
        })
        .select("id")
        .single();

      if (tenantError || !tenantRow) {
        throw new Error(
          `Akun dibuat, tetapi data penghuni gagal disimpan: ${tenantError?.message || "tidak diketahui"}. Hubungi pengelola.`
        );
      }

      // 3. Tandai kamar terisi dan tautkan ke baris penghuni
      const { error: roomError } = await supabase
        .from("rooms")
        .update({ status: "occupied", tenant_name: formData.fullName })
        .eq("id", room.id);
      if (roomError) throw new Error(`Gagal memperbarui status kamar: ${roomError.message}`);
    }

    // 4. Tandai kode undangan sudah terpakai
    const { error: inviteError } = await supabase
      .from("invitations")
      .update({ is_used: true, used_by: userId })
      .eq("id", formData.invitation.id);
    if (inviteError) throw new Error(`Gagal menandai kode undangan: ${inviteError.message}`);

    return {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      nik: formData.nik,
      propertyName: room?.property_name || "Kost Yusi",
      roomNumber: room?.room_number || "-",
      floor: room?.floor || "-",
      invitationCode: formData.invitation.code,
    };
  },

  // Mengirim tautan reset kata sandi ke email
  async resetPassword(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?screen=reset-password`,
    });
    if (error) throw error;
  },
};
