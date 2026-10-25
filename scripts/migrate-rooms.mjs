import pg from 'pg';

const { Client } = pg;

async function migrateAndSeedRooms() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL. Applying rooms schema updates...');

    // 1. Add missing columns to public.rooms
    await client.query(`
      ALTER TABLE public.rooms 
        ADD COLUMN IF NOT EXISTS floor text DEFAULT 'Lantai 1',
        ADD COLUMN IF NOT EXISTS room_type text DEFAULT 'Deluxe AC',
        ADD COLUMN IF NOT EXISTS image_url text DEFAULT '',
        ADD COLUMN IF NOT EXISTS facilities text[] DEFAULT ARRAY['AC', 'KM Dalam', 'Springbed', 'Smart Lock'],
        ADD COLUMN IF NOT EXISTS tenant_name text,
        ADD COLUMN IF NOT EXISTS tenant_avatar text,
        ADD COLUMN IF NOT EXISTS maintenance_title text,
        ADD COLUMN IF NOT EXISTS maintenance_note text,
        ADD COLUMN IF NOT EXISTS property_name text DEFAULT 'Wisma Melati',
        ADD COLUMN IF NOT EXISTS property_address text DEFAULT 'Jl. Sigura - Gura IV No.6',
        ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

      -- Update status check constraint to support common statuses
      ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
      ALTER TABLE public.rooms ADD CONSTRAINT rooms_status_check 
        CHECK (status IN ('available', 'occupied', 'maintenance', 'kosong', 'terisi', 'perbaikan'));
    `);

    // 2. Set up RLS policies for rooms so owner can select, insert, update, and delete
    await client.query(`
      ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
      DROP POLICY IF EXISTS "Anyone authenticated can view rooms" ON public.rooms;
      CREATE POLICY "Anyone can view rooms"
        ON public.rooms FOR SELECT
        TO anon, authenticated
        USING (true);

      DROP POLICY IF EXISTS "Allow updating rooms" ON public.rooms;
      DROP POLICY IF EXISTS "Authenticated users can update rooms" ON public.rooms;
      CREATE POLICY "Allow updating rooms"
        ON public.rooms FOR UPDATE
        TO authenticated, anon
        USING (true)
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow inserting rooms" ON public.rooms;
      DROP POLICY IF EXISTS "Authenticated users can insert rooms" ON public.rooms;
      CREATE POLICY "Allow inserting rooms"
        ON public.rooms FOR INSERT
        TO authenticated, anon
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow deleting rooms" ON public.rooms;
      DROP POLICY IF EXISTS "Authenticated users can delete rooms" ON public.rooms;
      CREATE POLICY "Allow deleting rooms"
        ON public.rooms FOR DELETE
        TO authenticated, anon
        USING (true);
    `);

    console.log('Schema & RLS policies updated successfully.');

    // 3. Clear existing rooms or seed the 10 rooms matching Image 1
    // High quality room images
    const images = {
      deluxe1: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      standardSingle: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      deluxe2: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
      singleCalm: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      deluxeModern: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      maintenanceRoom: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      room7: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      room8: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      room9: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      vipRoom: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    };

    const initialRooms = [
      {
        room_number: 'B-04',
        floor: 'Lantai 1',
        room_type: 'Deluxe AC',
        price: 1500000,
        status: 'occupied',
        tenant_name: 'Azka Andya Safira',
        facilities: ['AC', 'KM Dalam', 'Springbed', 'Smart Lock', 'Water Heater'],
        image_url: images.deluxe1,
        property_name: 'Wisma Melati',
        description: 'Kamar nyaman lantai 1 dengan pencahayaan alami yang baik.',
      },
      {
        room_number: 'A-05',
        floor: 'Lantai 2',
        room_type: 'Standard Single',
        price: 1300000,
        status: 'available',
        tenant_name: null,
        facilities: ['AC', 'KM Luar', 'Meja Belajar', 'Lemari Pakaian'],
        image_url: images.standardSingle,
        property_name: 'Wisma Melati',
        description: 'Siap ditempati segera. Posisi menghadap matahari pagi, stopkontak ganda samping ranjang.',
      },
      {
        room_number: 'B-01',
        floor: 'Lantai 1',
        room_type: 'Deluxe AC',
        price: 1500000,
        status: 'occupied',
        tenant_name: 'Sarah Nabilla',
        facilities: ['AC', 'KM Dalam', 'Springbed', 'Smart Lock', 'Water Heater'],
        image_url: images.deluxe2,
        property_name: 'Wisma Melati',
        description: 'Dekat dengan pintu gerbang utama, akses kartu smart lock.',
      },
      {
        room_number: 'C-01',
        floor: 'Lantai 3 • Sudut Tenang',
        room_type: 'Standard Single',
        price: 1300000,
        status: 'occupied',
        tenant_name: 'Riana',
        facilities: ['AC', 'KM Dalam', 'Wi-Fi 100Mbps', 'Water Heater'],
        image_url: images.singleCalm,
        property_name: 'Wisma Melati',
        description: 'Sudut tenang paling hening di lantai 3, cocok untuk mahasiswa akhir.',
      },
      {
        room_number: 'B-05',
        floor: 'Lantai 1',
        room_type: 'Deluxe AC',
        price: 1500000,
        status: 'occupied',
        tenant_name: 'Salma Ramadhani',
        facilities: ['AC', 'KM Dalam', 'Springbed', 'Smart Lock'],
        image_url: images.deluxeModern,
        property_name: 'Wisma Melati',
        description: 'Kamar luas dengan cermin bulat estetis dan meja rias.',
      },
      {
        room_number: 'B-03',
        floor: 'Lantai 1',
        room_type: 'Deluxe AC',
        price: 1500000,
        status: 'maintenance',
        tenant_name: null,
        maintenance_title: 'Servis AC Berkala',
        maintenance_note: 'Pembersihan AC & Filter',
        facilities: ['AC Inverter', 'KM Dalam', 'Kasur Busa Super'],
        image_url: images.maintenanceRoom,
        property_name: 'Wisma Melati',
        description: 'Sedang dalam pembersihan AC & filter berkala oleh teknisi.',
      },
      {
        room_number: 'A-01',
        floor: 'Lantai 1',
        room_type: 'Standard AC',
        price: 1350000,
        status: 'occupied',
        tenant_name: 'Nadya Putri',
        facilities: ['AC', 'KM Dalam', 'Springbed', 'Meja Belajar'],
        image_url: images.room7,
        property_name: 'Wisma Melati',
        description: 'Lantai 1 dekat dapur bersama.',
      },
      {
        room_number: 'A-02',
        floor: 'Lantai 1',
        room_type: 'Deluxe AC',
        price: 1500000,
        status: 'occupied',
        tenant_name: 'Dimas Anggara',
        facilities: ['AC', 'KM Dalam', 'Springbed', 'Smart Lock', 'Water Heater'],
        image_url: images.room8,
        property_name: 'Wisma Melati',
        description: 'Kamar Deluxe lantai 1 dengan lemari dua pintu.',
      },
      {
        room_number: 'B-02',
        floor: 'Lantai 1',
        room_type: 'Deluxe AC',
        price: 1500000,
        status: 'occupied',
        tenant_name: 'Fathur Rahman',
        facilities: ['AC', 'KM Dalam', 'Springbed', 'Smart Lock', 'Wi-Fi 100Mbps'],
        image_url: images.room9,
        property_name: 'Wisma Melati',
        description: 'Koneksi Wi-Fi kencang dan meja kerja ergonomis.',
      },
      {
        room_number: 'C-02',
        floor: 'Lantai 3',
        room_type: 'Suite VIP',
        price: 1995000,
        status: 'occupied',
        tenant_name: 'Kezia Aurelia',
        facilities: ['AC', 'KM Dalam', 'Water Heater', 'Smart Door Lock', 'Kasur Springbed', 'Kulkas Mini Pribadi'],
        image_url: images.vipRoom,
        property_name: 'Wisma Melati',
        description: 'Suite VIP dengan kulkas mini dan pemandangan kota.',
      },
    ];

    for (const r of initialRooms) {
      await client.query(`
        INSERT INTO public.rooms (
          room_number, floor, room_type, price, status, 
          tenant_name, facilities, image_url, property_name, 
          description, maintenance_title, maintenance_note
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING;
      `, [
        r.room_number,
        r.floor,
        r.room_type,
        r.price,
        r.status,
        r.tenant_name,
        r.facilities,
        r.image_url,
        r.property_name,
        r.description,
        r.maintenance_title || null,
        r.maintenance_note || null,
      ]);
    }

    // Also update existing rooms if room_number matches
    for (const r of initialRooms) {
      await client.query(`
        UPDATE public.rooms SET
          floor = $2,
          room_type = $3,
          price = $4,
          status = $5,
          tenant_name = $6,
          facilities = $7,
          image_url = $8,
          property_name = $9,
          description = $10,
          maintenance_title = $11,
          maintenance_note = $12
        WHERE room_number = $1;
      `, [
        r.room_number,
        r.floor,
        r.room_type,
        r.price,
        r.status,
        r.tenant_name,
        r.facilities,
        r.image_url,
        r.property_name,
        r.description,
        r.maintenance_title || null,
        r.maintenance_note || null,
      ]);
    }

    const finalCount = await client.query('SELECT count(*) FROM public.rooms;');
    console.log(`Rooms seeded/updated! Total rooms in DB: ${finalCount.rows[0].count}`);
  } catch (err) {
    console.error('Migration & Seed error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrateAndSeedRooms();
