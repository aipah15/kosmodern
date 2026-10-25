import { createClient } from "@/lib/supabase/client";
import { MaintenanceTicket, TicketStatus } from "@/types/maintenance";

// Layanan pelaporan dan pengelolaan perbaikan fasilitas kos
export const maintenanceService = {
  // Mengambil seluruh tiket laporan kerusakan fasilitas
  async getTickets(status?: TicketStatus): Promise<MaintenanceTicket[]> {
    const supabase = createClient();
    let query = supabase
      .from("maintenance_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      // Jika tabel belum tersedia atau terjadi kendala, kembalikan array kosong
      console.warn("Layanan tiket pemeliharaan:", error.message);
      return [];
    }
    return (data || []) as MaintenanceTicket[];
  },

  // Mengambil laporan perbaikan yang dibuat oleh penghuni tertentu
  async getTicketsByTenant(tenantName: string): Promise<MaintenanceTicket[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("maintenance_tickets")
      .select("*")
      .eq("tenant_name", tenantName)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data || []) as MaintenanceTicket[];
  },

  // Membuat tiket perbaikan baru oleh penghuni
  async createTicket(ticketData: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    const supabase = createClient();
    const ticketCode = `REP-${Date.now().toString().slice(-5)}`;

    const { data, error } = await supabase
      .from("maintenance_tickets")
      .insert({
        ...ticketData,
        ticket_code: ticketCode,
        status: "baru",
      })
      .select()
      .single();

    if (error) throw error;
    return data as MaintenanceTicket;
  },

  // Memperbarui status penanganan laporan (diproses, selesai, ditolak)
  async updateTicketStatus(
    id: string,
    status: TicketStatus,
    completionNote?: string
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("maintenance_tickets")
      .update({
        status,
        completion_note: completionNote,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },

  // Menugaskan teknisi dan waktu kedatangan
  async assignTechnician(
    id: string,
    technicianName: string,
    estimatedArrival: string
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("maintenance_tickets")
      .update({
        assigned_technician: technicianName,
        estimated_arrival: estimatedArrival,
        status: "diproses",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  },
};
