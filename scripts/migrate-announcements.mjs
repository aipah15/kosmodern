import pg from 'pg';

const { Client } = pg;

async function migrateAnnouncements() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Creating announcements table...');

    // 1. Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.announcements (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        title text NOT NULL,
        category text CHECK (category IN ('umum', 'tagihan', 'perawatan', 'ketertiban', 'darurat')) DEFAULT 'perawatan',
        category_label text DEFAULT 'Perawatan & Perbaikan',
        content text NOT NULL,
        target_audience text CHECK (target_audience IN ('all', 'floor', 'specific')) DEFAULT 'all',
        target_label text DEFAULT 'Semua Penghuni Wisma Melati',
        target_floors text[],
        target_tenant_ids text[],
        is_pinned boolean DEFAULT true,
        is_important boolean DEFAULT true,
        attachments jsonb DEFAULT '[]'::jsonb,
        created_by text DEFAULT 'Ibu Hj. Ratna Juwita',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    // 2. Enable RLS
    await client.query(`
      ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public access to announcements" ON public.announcements;
      CREATE POLICY "Public access to announcements"
        ON public.announcements
        FOR ALL
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);
    `);

    // 3. Seed announcement matching screenshot
    console.log('Seeding announcement matching screenshot...');
    await client.query(`DELETE FROM public.announcements;`);

    const initialContent = `Yth. Seluruh Penghuni Wisma Melati,

Sehubungan dengan adanya pembersihan tandon air utama dan penggantian pipa suplai lantai 2, kami informasikan bahwa aliran air bersih akan dihentikan sementara pada:
• Hari/Tanggal: Sabtu, 18 Oktober 2026
• Waktu: Pukul 09.00 - 13.00 WIB
• Wilayah terdampak: Seluruh kamar Lantai 1 & Lantai 2

Mohon untuk menampung air secukupnya pada bak atau ember kamar masing-masing sebelum jadwal pemadaman dimulai. Terima kasih atas pengertian dan kerjasamanya.`;

    await client.query(
      `INSERT INTO public.announcements (
        title, category, category_label, content, target_audience, target_label, is_pinned, is_important, attachments, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        'Pemadaman Air Sementara Sabtu, 18 Oktober',
        'perawatan',
        'Perawatan & Perbaikan',
        initialContent,
        'all',
        'Semua Penghuni Wisma Melati',
        true,
        true,
        JSON.stringify([
          { name: 'jadwal_pembersihan_tandon.pdf', size: '1.2 MB' },
          { name: 'surat_pemberitahuan_teknisi.jpg', size: '850 KB' },
        ]),
        'Ibu Hj. Ratna Juwita',
      ]
    );

    console.log('Successfully created and seeded announcements table!');
    await client.end();
  } catch (error) {
    console.error('Error migrating announcements:', error);
    process.exit(1);
  }
}

migrateAnnouncements();
