import pg from 'pg';

const { Client } = pg;

async function migrateMaintenanceAndReminders() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Creating maintenance_tickets and reminder tables...');

    // 1. Create maintenance_tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        ticket_code text NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        urgency text CHECK (urgency IN ('urgent', 'medium', 'low')) DEFAULT 'urgent',
        urgency_label text,
        status text CHECK (status IN ('baru', 'diproses', 'selesai', 'ditolak')) DEFAULT 'diproses',
        status_label text,
        tenant_name text NOT NULL,
        tenant_avatar text,
        room_number text NOT NULL,
        floor text DEFAULT 'Lantai 2',
        lease_type text DEFAULT 'Sewa Tahunan',
        access_permission text DEFAULT 'Diizinkan (Kunci di Pos Keamanan)',
        tenant_phone text DEFAULT '081298765432',
        area_location text,
        created_time text,
        created_date_str text,
        photo_url text,
        photo_name text DEFAULT 'ac_bocor_kamar_B04.jpg',
        assigned_technician text DEFAULT 'Pak Joko',
        estimated_arrival text DEFAULT 'Hari Ini, 15:30 WIB',
        repair_cost numeric(12,2) DEFAULT 120000,
        rating numeric(2,1),
        feedback_note text,
        completion_note text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    // 2. Create auto_reminder_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.auto_reminder_settings (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        engine_active boolean DEFAULT true,
        next_schedule text DEFAULT 'besok pukul 09:00 WIB untuk 4 penerima',
        quiet_hours_enabled boolean DEFAULT true,
        quiet_hours_start text DEFAULT '21:00',
        quiet_hours_end text DEFAULT '08:00',
        stop_on_payment boolean DEFAULT true,
        denda_repeat_days integer DEFAULT 2,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    // 3. Create reminder_cadence_steps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.reminder_cadence_steps (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        step_code text NOT NULL,
        title text NOT NULL,
        badge_text text,
        description text NOT NULL,
        scheduled_time text NOT NULL,
        is_active boolean DEFAULT true,
        template_message text NOT NULL,
        sort_order integer DEFAULT 1,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    // Configure RLS
    await client.query(`
      ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.auto_reminder_settings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.reminder_cadence_steps ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public access to maintenance_tickets" ON public.maintenance_tickets;
      CREATE POLICY "Public access to maintenance_tickets" ON public.maintenance_tickets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Public access to auto_reminder_settings" ON public.auto_reminder_settings;
      CREATE POLICY "Public access to auto_reminder_settings" ON public.auto_reminder_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Public access to reminder_cadence_steps" ON public.reminder_cadence_steps;
      CREATE POLICY "Public access to reminder_cadence_steps" ON public.reminder_cadence_steps FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    `);

    // 4. Seed maintenance_tickets matching screenshot 1
    console.log('Seeding maintenance_tickets...');
    await client.query(`DELETE FROM public.maintenance_tickets;`);

    const tickets = [
      {
        ticket_code: '#TK-0824',
        title: 'AC kamar bocor menetes air ke kasur',
        description: 'Unit AC indoor mulai meneteskan air sejak kemarin malam. Suhu terasa kurang dingin dan tetesan air mengenai ujung ranjang. Mohon diperiksa pipa pembuangan atau freonnya ya Bu/Pak. Saya sedang di kantor, teknisi dipersilakan masuk pakai kunci serep di pos satpam.',
        urgency: 'urgent',
        urgency_label: 'URGENSI TINGGI (< 3 jam)',
        status: 'diproses',
        status_label: 'Sedang Diproses',
        tenant_name: 'Dimas Arya Pratama',
        tenant_avatar: 'DA',
        room_number: 'B-04',
        floor: 'Lantai 2',
        lease_type: 'Sewa Tahunan',
        access_permission: 'Diizinkan (Kunci di Pos Keamanan)',
        tenant_phone: '081298765432',
        area_location: 'Kamar B-04 • Lantai 2',
        created_time: '1 jam yang lalu (09:30 WIB)',
        created_date_str: 'Kamis, 12 Juni 2026 • 09:30 WIB',
        photo_url: '',
        photo_name: 'ac_bocor_kamar_B04.jpg',
        assigned_technician: 'Pak Joko',
        estimated_arrival: 'Hari Ini, 15:30 WIB',
        repair_cost: 120000,
        rating: null,
        feedback_note: null,
        completion_note: null,
      },
      {
        ticket_code: '#TK-0825',
        title: 'Wi-Fi Router Lantai 2 sering putus-sambung',
        description: 'Koneksi sering RTO tiap 15 menit terutama saat jam kerja WFH. Lampu indikator internet pada router sempat berkedip merah.',
        urgency: 'medium',
        urgency_label: 'SEDANG (1x24 jam)',
        status: 'baru',
        status_label: 'BARU (Menunggu Respon)',
        tenant_name: 'Siti Rahmawati (didukung 3 penghuni lain)',
        tenant_avatar: 'SR',
        room_number: 'Area Umum',
        floor: 'Koridor Lt. 2',
        lease_type: 'Fasilitas Bersama',
        access_permission: 'Area Terbuka',
        tenant_phone: '081344556677',
        area_location: 'Area Umum • Koridor Lt. 2',
        created_time: 'Hari ini, 11:20 WIB',
        created_date_str: 'Kamis, 12 Juni 2026 • 11:20 WIB',
        photo_url: '',
        photo_name: 'router_wifi_lt2.jpg',
        assigned_technician: 'Pak Joko',
        estimated_arrival: 'Besok, 10:00 WIB',
        repair_cost: 0,
        rating: null,
        feedback_note: null,
        completion_note: null,
      },
      {
        ticket_code: '#TK-0822',
        title: 'Tekanan air lantai 2 & 3 mengecil / tandon kosong',
        description: 'Air keran shower sangat kecil sejak sore, suara mesin pendorong tandon mendengung tanpa mengalirkan air deras.',
        urgency: 'urgent',
        urgency_label: 'URGENSI TINGGI',
        status: 'diproses',
        status_label: 'Diproses (Pembersihan Pompa)',
        tenant_name: 'Aldi Pratama',
        tenant_avatar: 'AP',
        room_number: 'Kamar C-01',
        floor: 'Lantai 3',
        lease_type: 'Sewa Bulanan',
        access_permission: 'Akses Tandon Atap',
        tenant_phone: '081912345678',
        area_location: 'Tandon Atap Utama',
        created_time: '11 Jun 2026, 19:40 WIB',
        created_date_str: 'Rabu, 11 Juni 2026 • 19:40 WIB',
        photo_url: '',
        photo_name: 'pompa_tandon_atas.jpg',
        assigned_technician: 'Pak Joko',
        estimated_arrival: 'Hari Ini, 14:00 WIB',
        repair_cost: 150000,
        rating: null,
        feedback_note: null,
        completion_note: null,
      },
      {
        ticket_code: '#TK-0819',
        title: 'Kran wastafel kamar mandi merembes',
        description: 'Kran wastafel tidak bisa menutup rapat sehingga air terus menetes memenuhi ember.',
        urgency: 'low',
        urgency_label: 'SELESAI',
        status: 'selesai',
        status_label: 'Selesai',
        tenant_name: 'Dimas Arya',
        tenant_avatar: 'DA',
        room_number: 'B-04',
        floor: 'Lantai 2',
        lease_type: 'Sewa Tahunan',
        access_permission: 'Selesai Dikerjakan',
        tenant_phone: '081298765432',
        area_location: 'Kamar B-04',
        created_time: '05 Jun 2026',
        created_date_str: 'Jumat, 05 Juni 2026',
        photo_url: '',
        photo_name: 'kran_wastafel_b04.jpg',
        assigned_technician: 'Pak Joko (Ganti seal karet)',
        estimated_arrival: '05 Jun 2026',
        repair_cost: 50000,
        rating: 5.0,
        feedback_note: 'Puas',
        completion_note: 'Ganti seal karet',
      },
      {
        ticket_code: '#TK-0810',
        title: 'Lampu sorot gerbang parkir redup & berkedip',
        description: 'Lampu LED sorot gerbang malam hari berkedip sehingga area parkir motor agak remang.',
        urgency: 'low',
        urgency_label: 'SELESAI',
        status: 'selesai',
        status_label: 'Selesai',
        tenant_name: 'Budi Santoso',
        tenant_avatar: 'BS',
        room_number: 'A-01',
        floor: 'Lantai 1',
        lease_type: 'Sewa Bulanan',
        access_permission: 'Area Parkir',
        tenant_phone: '081765432109',
        area_location: 'Parkiran Motor Utama',
        created_time: '28 Mei 2026',
        created_date_str: 'Kamis, 28 Mei 2026',
        photo_url: '',
        photo_name: 'lampu_gerbang_depan.jpg',
        assigned_technician: 'Pak Joko',
        estimated_arrival: '28 Mei 2026',
        repair_cost: 75000,
        rating: 5.0,
        feedback_note: 'Puas',
        completion_note: 'Ganti lampu LED Philips 20W',
      },
    ];

    for (const t of tickets) {
      await client.query(
        `INSERT INTO public.maintenance_tickets (
          ticket_code, title, description, urgency, urgency_label, status, status_label,
          tenant_name, tenant_avatar, room_number, floor, lease_type, access_permission,
          tenant_phone, area_location, created_time, created_date_str, photo_url, photo_name,
          assigned_technician, estimated_arrival, repair_cost, rating, feedback_note, completion_note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
        [
          t.ticket_code, t.title, t.description, t.urgency, t.urgency_label, t.status, t.status_label,
          t.tenant_name, t.tenant_avatar, t.room_number, t.floor, t.lease_type, t.access_permission,
          t.tenant_phone, t.area_location, t.created_time, t.created_date_str, t.photo_url, t.photo_name,
          t.assigned_technician, t.estimated_arrival, t.repair_cost, t.rating, t.feedback_note, t.completion_note,
        ]
      );
    }

    // 5. Seed auto_reminder_settings & cadence steps matching screenshot 2
    console.log('Seeding auto_reminder_settings and reminder_cadence_steps...');
    await client.query(`DELETE FROM public.auto_reminder_settings;`);
    await client.query(`
      INSERT INTO public.auto_reminder_settings (
        engine_active, next_schedule, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, stop_on_payment, denda_repeat_days
      ) VALUES (
        true, 'besok pukul 09:00 WIB untuk 4 penerima', true, '21:00', '08:00', true, 2
      );
    `);

    await client.query(`DELETE FROM public.reminder_cadence_steps;`);
    const steps = [
      {
        step_code: 'H-7',
        title: 'Pemberitahuan Tagihan Terbit',
        badge_text: 'Awal Siklus',
        description: 'Memberi tahu penghuni bahwa invoice periode baru siap dicek & dibayarkan secara santai.',
        scheduled_time: 'Dijadwalkan Pukul 09:00 WIB',
        is_active: true,
        template_message: 'Halo kak {nama} ({kamar}), tagihan sewa kos di {nama_kos} periode {periode} sebesar {nominal} telah terbit. Jatuh tempo pada {jatuh_tempo}. Cek invoice di: {link_pembayaran}. Terima kasih! 🙏',
        sort_order: 1,
      },
      {
        step_code: 'H-3',
        title: 'Pengingat Awal Bersahabat',
        badge_text: 'Dipilih di Editor',
        description: 'Mengingatkan penghuni untuk menyiapkan saldo pembayaran sebelum jatuh tempo mendekat.',
        scheduled_time: 'Dijadwalkan Pukul 09:00 WIB • Tone Ramah',
        is_active: true,
        template_message: 'Halo kak {nama} ({kamar}), sekadar mengingatkan tagihan sewa kos di {nama_kos} periode {periode} sebesar {nominal} akan jatuh tempo pada {jatuh_tempo}. Mohon lakukan pembayaran melalui tautan berikut: {link_pembayaran}. Terima kasih! 🙏',
        sort_order: 2,
      },
      {
        step_code: 'H-1',
        title: 'Pengingat Batas Akhir Besok',
        badge_text: 'Penting',
        description: 'Penegasan tanggal pembayaran sebelum terkena sanksi atau administrasi denda keterlambatan.',
        scheduled_time: 'Dijadwalkan Pukul 10:00 WIB',
        is_active: true,
        template_message: 'Halo kak {nama} ({kamar}), besok ({jatuh_tempo}) adalah batas akhir pembayaran sewa kamar {kamar} sebesar {nominal}. Mohon selesaikan via {link_pembayaran} agar terhindar dari denda. Terima kasih!',
        sort_order: 3,
      },
      {
        step_code: 'Hari-H',
        title: 'Peringatan Jatuh Tempo Hari Ini',
        badge_text: 'Mendesak',
        description: 'Notifikasi urgent batas pelunasan tagihan sewa kos adalah hari ini sebelum pukul 23:59 WIB.',
        scheduled_time: 'Dijadwalkan Pukul 08:30 WIB',
        is_active: true,
        template_message: 'PENTING: Halo kak {nama}, hari ini adalah JATUH TEMPO pembayaran sewa {kamar} ({nominal}). Batas pelunasan sebelum pukul 23:59 WIB. Bayar sekarang: {link_pembayaran}. Terima kasih!',
        sort_order: 4,
      },
      {
        step_code: 'H+1',
        title: 'Penagihan Keterlambatan & Informasi Denda',
        badge_text: 'Tertunggak',
        description: 'Penegasan akumulasi denda sewa kos harian dan instruksi pelunasan segera.',
        scheduled_time: 'Kirim setiap 2 hari sekali',
        is_active: true,
        template_message: 'PERINGATAN: Halo kak {nama}, pembayaran sewa {kamar} telah melewati jatuh tempo ({jatuh_tempo}). Denda harian telah diakumulasikan. Total tagihan saat ini: {nominal}. Harap segera lunasi di: {link_pembayaran}.',
        sort_order: 5,
      },
    ];

    for (const s of steps) {
      await client.query(
        `INSERT INTO public.reminder_cadence_steps (
          step_code, title, badge_text, description, scheduled_time, is_active, template_message, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [s.step_code, s.title, s.badge_text, s.description, s.scheduled_time, s.is_active, s.template_message, s.sort_order]
      );
    }

    console.log('Successfully seeded maintenance_tickets, auto_reminder_settings, and reminder_cadence_steps!');
    await client.end();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateMaintenanceAndReminders();
