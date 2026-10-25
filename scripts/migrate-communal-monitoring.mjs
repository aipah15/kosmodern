import pg from 'pg';

const { Client } = pg;

async function migrateCommunalMonitoring() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Creating communal monitoring tables...');

    // 1. Create communal_fridge_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.communal_fridge_items (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        tenant_name text NOT NULL,
        room_number text NOT NULL,
        floor text DEFAULT 'Lantai 1',
        item_name text NOT NULL,
        storage_location text NOT NULL,
        entry_date text NOT NULL,
        status text CHECK (status IN ('expired', 'warning', 'safe')) DEFAULT 'safe',
        status_label text NOT NULL,
        category text DEFAULT 'makanan',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    // 2. Create communal_area_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.communal_area_items (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        zone_id text NOT NULL,
        zone_name text NOT NULL,
        zone_subtitle text,
        item_name text NOT NULL,
        tenant_name text NOT NULL,
        room_number text NOT NULL,
        time_ago text NOT NULL,
        status text CHECK (status IN ('safe', 'normal', 'warning', 'overdue', 'transit')) DEFAULT 'normal',
        status_label text NOT NULL,
        note text,
        is_seized boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    // Enable RLS
    await client.query(`
      ALTER TABLE public.communal_fridge_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.communal_area_items ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public access to communal_fridge_items" ON public.communal_fridge_items;
      CREATE POLICY "Public access to communal_fridge_items" ON public.communal_fridge_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Public access to communal_area_items" ON public.communal_area_items;
      CREATE POLICY "Public access to communal_area_items" ON public.communal_area_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    `);

    // Seed communal_fridge_items matching Image 1
    console.log('Seeding communal_fridge_items...');
    await client.query(`DELETE FROM public.communal_fridge_items;`);

    const fridgeItems = [
      // Alya Syarifah (Kamar B-02 • Lantai 1)
      {
        tenant_name: 'Alya Syarifah',
        room_number: 'B-02',
        floor: 'Lantai 1',
        item_name: 'Susu UHT (1 Liter, Diamond)',
        storage_location: 'Rak Tengah',
        entry_date: '1 Okt 2026',
        status: 'expired',
        status_label: 'Sudah Kadaluarsa (2 Hari Lalu)',
        category: 'minuman',
      },
      {
        tenant_name: 'Alya Syarifah',
        room_number: 'B-02',
        floor: 'Lantai 1',
        item_name: 'Yogurt Greek Berry (2 Cup)',
        storage_location: 'Rak Atas',
        entry_date: '10 Okt 2026',
        status: 'warning',
        status_label: 'Kadaluarsa Besok (H-1)',
        category: 'olahan_susu',
      },
      {
        tenant_name: 'Alya Syarifah',
        room_number: 'B-02',
        floor: 'Lantai 1',
        item_name: 'Telur Ayam Omega (10 Butir)',
        storage_location: 'Rak Bawah',
        entry_date: '11 Okt 2026',
        status: 'safe',
        status_label: 'Aman (>7 hari)',
        category: 'bahan_mentah',
      },
      // Sarah Salsabila (Kamar B-01 • Lantai 1)
      {
        tenant_name: 'Sarah Salsabila',
        room_number: 'B-01',
        floor: 'Lantai 1',
        item_name: 'Buah Potong Semangka & Melon (1 Box)',
        storage_location: 'Rak Atas',
        entry_date: '15 Okt 2026',
        status: 'expired',
        status_label: 'Sudah Kadaluarsa (1 Hari Lalu)',
        category: 'buah',
      },
      {
        tenant_name: 'Sarah Salsabila',
        room_number: 'B-01',
        floor: 'Lantai 1',
        item_name: 'Keju Slice Melt (1 Pack, Kraft)',
        storage_location: 'Rak Atas',
        entry_date: '10 Okt 2026',
        status: 'safe',
        status_label: 'Aman (>7 hari)',
        category: 'olahan_susu',
      },
      // Nia Syahrini (Kamar A-03 • Lantai 2)
      {
        tenant_name: 'Nia Syahrini',
        room_number: 'A-03',
        floor: 'Lantai 2',
        item_name: 'Sisa Nasi Goreng Box (Kotak Kertas)',
        storage_location: 'Rak Tengah',
        entry_date: '10 Okt 2026',
        status: 'warning',
        status_label: 'Mendekati Batas (3 Hari Lagi)',
        category: 'makanan_matang',
      },
      {
        tenant_name: 'Nia Syahrini',
        room_number: 'A-03',
        floor: 'Lantai 2',
        item_name: 'Sosis Sapi Champ (Frozen Pack)',
        storage_location: 'Freezer',
        entry_date: '05 Okt 2026',
        status: 'safe',
        status_label: 'Aman (>7 hari)',
        category: 'frozen_food',
      },
      // Fajar Nugraha (Kamar A-05 • Lantai 1)
      {
        tenant_name: 'Fajar Nugraha',
        room_number: 'A-05',
        floor: 'Lantai 1',
        item_name: 'Minuman Kemasan Jus Apel (2 Botol)',
        storage_location: 'Pintu Kulkas',
        entry_date: '1 Jun 2026',
        status: 'safe',
        status_label: 'Aman (>7 hari)',
        category: 'minuman',
      },
    ];

    for (const item of fridgeItems) {
      await client.query(
        `INSERT INTO public.communal_fridge_items (
          tenant_name, room_number, floor, item_name, storage_location, entry_date, status, status_label, category
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          item.tenant_name, item.room_number, item.floor, item.item_name, item.storage_location, item.entry_date, item.status, item.status_label, item.category
        ]
      );
    }

    // Seed communal_area_items matching Image 2
    console.log('Seeding communal_area_items...');
    await client.query(`DELETE FROM public.communal_area_items;`);

    const areaItems = [
      // Jemuran Lantai 2
      {
        zone_id: 'jemuran_lt2',
        zone_name: 'Jemuran Lantai 2',
        zone_subtitle: 'Balkon Timur • Kapasitas 10 Slot',
        item_name: 'Jemuran Sprei Motif Bunga',
        tenant_name: 'Dimas Arya',
        room_number: 'B-04',
        time_ago: '4 Jam lalu',
        status: 'safe',
        status_label: 'Aman (<24 Jam)',
        note: null,
        is_seized: false,
      },
      {
        zone_id: 'jemuran_lt2',
        zone_name: 'Jemuran Lantai 2',
        zone_subtitle: 'Balkon Timur • Kapasitas 10 Slot',
        item_name: 'Handuk Mandi Biru & Kaos',
        tenant_name: 'Budi Santoso',
        room_number: 'A-01',
        time_ago: '1 Hari lalu',
        status: 'normal',
        status_label: 'Normal',
        note: null,
        is_seized: false,
      },
      {
        zone_id: 'jemuran_lt2',
        zone_name: 'Jemuran Lantai 2',
        zone_subtitle: 'Balkon Timur • Kapasitas 10 Slot',
        item_name: 'Selimut Tebal Abu-abu',
        tenant_name: 'Siti Rahmawati',
        room_number: 'B-02',
        time_ago: '3 Hari lalu (H-0)',
        status: 'warning',
        status_label: 'Mendekati Batas (Kuning)',
        note: null,
        is_seized: false,
      },
      // Rak Sepatu Koridor Depan
      {
        zone_id: 'rak_sepatu',
        zone_name: 'Rak Sepatu Koridor Depan',
        zone_subtitle: 'Akses Pintu Masuk Utama',
        item_name: 'Sepatu Lari Nike Pegasus',
        tenant_name: 'Budi Santoso',
        room_number: 'A-01',
        time_ago: '1 Hari lalu',
        status: 'normal',
        status_label: 'Normal (Jemur Basah)',
        note: 'Masih di rak',
        is_seized: false,
      },
      {
        zone_id: 'rak_sepatu',
        zone_name: 'Rak Sepatu Koridor Depan',
        zone_subtitle: 'Akses Pintu Masuk Utama',
        item_name: 'Helm KYT Hitam Doff',
        tenant_name: 'Dimas Arya',
        room_number: 'B-04',
        time_ago: '2 Jam lalu',
        status: 'safe',
        status_label: 'Baru diletakkan',
        note: 'Tertata Rapi',
        is_seized: false,
      },
      {
        zone_id: 'rak_sepatu',
        zone_name: 'Rak Sepatu Koridor Depan',
        zone_subtitle: 'Akses Pintu Masuk Utama',
        item_name: 'Sandal Slop Gunung Eiger',
        tenant_name: 'Fajar Nugraha',
        room_number: 'A-05',
        time_ago: '4 Hari lalu',
        status: 'overdue',
        status_label: '4 Hari – Lewat Batas!',
        note: 'Tergelak di tengah koridor',
        is_seized: false,
      },
      // Teras & Koridor Lantai 1
      {
        zone_id: 'teras_lt1',
        zone_name: 'Teras & Koridor Lantai 1',
        zone_subtitle: 'Jalur Evakuasi Utama Kos',
        item_name: 'Paket Kardus Belanja Shopee Besar',
        tenant_name: 'Nadia Putri',
        room_number: 'A-02',
        time_ago: '4 Hari lalu',
        status: 'overdue',
        status_label: '4 Hari – Lewat Batas!',
        note: 'Lagi dinas luar kota',
        is_seized: false,
      },
      {
        zone_id: 'teras_lt1',
        zone_name: 'Teras & Koridor Lantai 1',
        zone_subtitle: 'Jalur Evakuasi Utama Kos',
        item_name: 'Koper Hitam 24 Inch',
        tenant_name: 'Rizky Fauzi',
        room_number: 'C-03',
        time_ago: '8 Jam lalu',
        status: 'transit',
        status_label: 'Transit Sementara',
        note: 'Siap Masuk Kamar',
        is_seized: false,
      },
      // Dapur Bersama Lantai 1
      {
        zone_id: 'dapur_lt1',
        zone_name: 'Dapur Bersama Lantai 1',
        zone_subtitle: 'Sink & Meja Island Komunal',
        item_name: 'Wajan Teflon & Spatula Kayu',
        tenant_name: 'Siti Rahmawati',
        room_number: 'B-02',
        time_ago: '5 Jam lalu',
        status: 'safe',
        status_label: 'Aman (Di Rak Tiris)',
        note: 'Sudah Dicuci',
        is_seized: false,
      },
      {
        zone_id: 'dapur_lt1',
        zone_name: 'Dapur Bersama Lantai 1',
        zone_subtitle: 'Sink & Meja Island Komunal',
        item_name: 'Blender Kaca Philips',
        tenant_name: 'Aldi Pratama',
        room_number: 'C-01',
        time_ago: '2 Hari lalu',
        status: 'warning',
        status_label: 'Perlu Dirapikan',
        note: null,
        is_seized: false,
      },
    ];

    for (const item of areaItems) {
      await client.query(
        `INSERT INTO public.communal_area_items (
          zone_id, zone_name, zone_subtitle, item_name, tenant_name, room_number, time_ago, status, status_label, note, is_seized
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          item.zone_id, item.zone_name, item.zone_subtitle, item.item_name, item.tenant_name, item.room_number, item.time_ago, item.status, item.status_label, item.note, item.is_seized
        ]
      );
    }

    console.log('Successfully seeded communal_fridge_items and communal_area_items!');
    await client.end();
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrateCommunalMonitoring();
