import pg from 'pg';

const { Client } = pg;

// Menambahkan tabel property_settings (profil properti & kebijakan sewa) dan
// menghapus nilai default "contoh" pada maintenance_tickets agar tiket baru tidak
// terisi teknisi / biaya palsu. Jalankan: DATABASE_URL=... node scripts/migrate-property-settings.mjs
async function migratePropertySettings() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL belum diatur.');
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.property_settings (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        profile jsonb NOT NULL DEFAULT '{}'::jsonb,
        policies jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      ALTER TABLE public.property_settings ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Authenticated manage property_settings" ON public.property_settings;
      CREATE POLICY "Authenticated manage property_settings"
        ON public.property_settings
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    `);

    await client.query(`
      ALTER TABLE public.maintenance_tickets ALTER COLUMN tenant_phone DROP DEFAULT;
      ALTER TABLE public.maintenance_tickets ALTER COLUMN photo_name DROP DEFAULT;
      ALTER TABLE public.maintenance_tickets ALTER COLUMN assigned_technician DROP DEFAULT;
      ALTER TABLE public.maintenance_tickets ALTER COLUMN estimated_arrival DROP DEFAULT;
      ALTER TABLE public.maintenance_tickets ALTER COLUMN repair_cost SET DEFAULT 0;
      ALTER TABLE public.maintenance_tickets ALTER COLUMN status SET DEFAULT 'baru';
      ALTER TABLE public.auto_reminder_settings ALTER COLUMN next_schedule DROP DEFAULT;
    `);

    console.log('Migrasi property_settings selesai.');
  } finally {
    await client.end();
  }
}

migratePropertySettings().catch((err) => {
  console.error('Migrasi gagal:', err.message);
  process.exit(1);
});
