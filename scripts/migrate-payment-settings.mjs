import pg from 'pg';

const { Client } = pg;

async function migrateAndSeedPaymentSettings() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Creating bank_accounts and payment_settings tables...');

    // 1. Create bank_accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.bank_accounts (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        bank_name text NOT NULL,
        bank_code text NOT NULL,
        account_number text NOT NULL,
        account_holder text NOT NULL,
        branch text,
        is_primary boolean DEFAULT false,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    // 2. Create payment_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.payment_settings (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        qris_merchant_name text DEFAULT 'KOST YUSI - ARIFA ANDYA NAFIISA',
        qris_nmid text DEFAULT 'ID1020039201928',
        qris_city text DEFAULT 'JAKARTA SELATAN',
        qris_postal_code text DEFAULT '12430',
        qris_image_url text DEFAULT '',
        qris_is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    // 3. Configure RLS
    await client.query(`
      ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public full access to bank_accounts" ON public.bank_accounts;
      CREATE POLICY "Public full access to bank_accounts"
        ON public.bank_accounts
        FOR ALL
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Public full access to payment_settings" ON public.payment_settings;
      CREATE POLICY "Public full access to payment_settings"
        ON public.payment_settings
        FOR ALL
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);
    `);

    // 4. Seed bank_accounts
    console.log('Seeding bank_accounts matching screenshot...');
    await client.query(`DELETE FROM public.bank_accounts;`);

    const accounts = [
      {
        bank_name: 'Bank Central Asia (BCA)',
        bank_code: 'BCA',
        account_number: '842-019-3821',
        account_holder: 'Arifa Andya Nafiisa',
        branch: 'KCU Wisma Asri',
        is_primary: true,
        is_active: true,
      },
      {
        bank_name: 'Bank Mandiri',
        bank_code: 'MNDR',
        account_number: '137-00-1928374-1',
        account_holder: 'Arifa Andya Nafiisa',
        branch: 'KC Fatmawati',
        is_primary: false,
        is_active: true,
      },
      {
        bank_name: 'Bank Rakyat Indonesia (BRI)',
        bank_code: 'BRI',
        account_number: '0341-01-082910-50-2',
        account_holder: 'Arifa Andya Nafiisa',
        branch: 'Unit Cilandak Barat',
        is_primary: false,
        is_active: true,
      },
    ];

    for (const acc of accounts) {
      await client.query(
        `INSERT INTO public.bank_accounts (
          bank_name, bank_code, account_number, account_holder, branch, is_primary, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          acc.bank_name,
          acc.bank_code,
          acc.account_number,
          acc.account_holder,
          acc.branch,
          acc.is_primary,
          acc.is_active,
        ]
      );
    }

    // 5. Seed payment_settings
    await client.query(`DELETE FROM public.payment_settings;`);
    await client.query(`
      INSERT INTO public.payment_settings (
        qris_merchant_name, qris_nmid, qris_city, qris_postal_code, qris_is_active
      ) VALUES (
        'KOST YUSI - ARIFA ANDYA NAFIISA', 'ID1020039201928', 'JAKARTA SELATAN', '12430', true
      );
    `);

    console.log('Successfully migrated and seeded bank_accounts and payment_settings!');
    await client.end();
  } catch (error) {
    console.error('Error migrating payment settings:', error);
    process.exit(1);
  }
}

migrateAndSeedPaymentSettings();
