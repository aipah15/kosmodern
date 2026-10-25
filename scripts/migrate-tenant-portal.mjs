import pg from 'pg';

const { Client } = pg;

// Menambahkan kolom yang dibutuhkan portal penghuni (/tenant) agar data per penghuni dapat disimpan dan difilter.
// Jalankan: DATABASE_URL=... node scripts/migrate-tenant-portal.mjs
async function migrateTenantPortal() {
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
      -- Laporan kerusakan: pemilik laporan & jenis lokasi (kamar pribadi / area umum)
      ALTER TABLE public.maintenance_tickets
        ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS location_type text DEFAULT 'pribadi';

      -- Kulkas bersama: pemilik, kedaluwarsa, jumlah, rak, foto, catatan
      ALTER TABLE public.communal_fridge_items
        ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS tenant_phone text,
        ADD COLUMN IF NOT EXISTS expiry_date date,
        ADD COLUMN IF NOT EXISTS quantity_note text,
        ADD COLUMN IF NOT EXISTS shelf_type text,
        ADD COLUMN IF NOT EXISTS photo_url text,
        ADD COLUMN IF NOT EXISTS notes text;

      -- Barang di area bersama: pemilik & foto
      ALTER TABLE public.communal_area_items
        ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS tenant_phone text,
        ADD COLUMN IF NOT EXISTS photo_url text;

      -- Bukti pembayaran: satu bukti dapat melunasi beberapa invoice sekaligus
      ALTER TABLE public.payment_proofs
        ADD COLUMN IF NOT EXISTS invoice_numbers text[];

      -- Hapus nilai bawaan "contoh" pada rekening/penerima bukti bayar
      ALTER TABLE public.payment_proofs ALTER COLUMN bank_receiver DROP DEFAULT;
      ALTER TABLE public.payment_proofs ALTER COLUMN account_receiver DROP DEFAULT;
      ALTER TABLE public.payment_proofs ALTER COLUMN receiver_name DROP DEFAULT;
      ALTER TABLE public.payment_proofs ALTER COLUMN period DROP DEFAULT;

      CREATE INDEX IF NOT EXISTS idx_bills_tenant_id ON public.bills (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_payment_proofs_tenant_id ON public.payment_proofs (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_maintenance_tickets_tenant_id ON public.maintenance_tickets (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_fridge_items_tenant_id ON public.communal_fridge_items (tenant_id);
      CREATE INDEX IF NOT EXISTS idx_area_items_tenant_id ON public.communal_area_items (tenant_id);
    `);

    console.log('Migrasi portal penghuni selesai.');
  } finally {
    await client.end();
  }
}

migrateTenantPortal().catch((err) => {
  console.error('Migrasi gagal:', err.message);
  process.exit(1);
});
