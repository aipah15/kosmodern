import pg from 'pg';

const { Client } = pg;

async function seed() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to database. Updating schema & seeding data...');

    // Add extra columns if they don't exist
    await client.query(`
      ALTER TABLE public.rooms 
        ADD COLUMN IF NOT EXISTS floor text DEFAULT 'Lt. 1',
        ADD COLUMN IF NOT EXISTS room_type text DEFAULT 'Deluxe',
        ADD COLUMN IF NOT EXISTS property_name text DEFAULT 'Perumahan Kost Yusi',
        ADD COLUMN IF NOT EXISTS property_address text DEFAULT 'Jl. Sigura - Gura IV No.6';

      ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS nik text,
        ADD COLUMN IF NOT EXISTS room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL;
    `);

    // Ensure room B-04 exists
    const roomRes = await client.query(`
      INSERT INTO public.rooms (room_number, floor, room_type, property_name, property_address, price, status)
      VALUES ('B-04', 'Lt. 1', 'Deluxe', 'Perumahan Kost Yusi', 'Jl. Sigura - Gura IV No.6', 1500000, 'available')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);

    let roomId;
    if (roomRes.rows.length > 0) {
      roomId = roomRes.rows[0].id;
    } else {
      const existing = await client.query(`SELECT id FROM public.rooms WHERE room_number = 'B-04' LIMIT 1;`);
      roomId = existing.rows[0]?.id;
    }

    // Insert invitation codes: KOST-YUSI-2026 and KOS-MELATI-8821
    await client.query(`
      INSERT INTO public.invitations (code, room_id, is_used)
      VALUES 
        ('KOST-YUSI-2026', $1, false),
        ('KOS-MELATI-8821', $1, false)
      ON CONFLICT (code) DO UPDATE 
      SET room_id = EXCLUDED.room_id, is_used = false;
    `, [roomId]);

    console.log('Seeding completed successfully! Invitation codes KOST-YUSI-2026 and KOS-MELATI-8821 are ready.');
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await client.end();
  }
}

seed();
