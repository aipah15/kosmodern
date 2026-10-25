import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function seedAdmin() {
  await client.connect();
  console.log('Connected to Supabase. Creating admin account & seeding dashboard data...');

  const adminEmail = 'owner@kostyusi.com';
  const adminPassword = 'admin123456';
  const adminName = 'Arifa Andya Nafiisa';
  const adminPhone = '+6281299887766';

  await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  // Check if user already exists
  const check = await client.query(`SELECT id FROM auth.users WHERE email = $1`, [adminEmail]);
  let adminId;

  if (check.rows.length > 0) {
    adminId = check.rows[0].id;
    await client.query(`
      UPDATE auth.users
      SET 
        encrypted_password = crypt($1::text, gen_salt('bf')),
        email_confirmed_at = now(),
        raw_user_meta_data = jsonb_build_object('full_name', $2::text, 'role', 'owner', 'phone', $3::text)
      WHERE id = $4
    `, [adminPassword, adminName, adminPhone, adminId]);
  } else {
    const insert = await client.query(`
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        $1::text,
        crypt($2::text, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', $3::text, 'role', 'owner', 'phone', $4::text),
        now(),
        now()
      )
      RETURNING id;
    `, [adminEmail, adminPassword, adminName, adminPhone]);
    adminId = insert.rows[0].id;
  }

  // Ensure profile is updated as owner
  await client.query(`
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES ($1, $2, $3, 'owner')
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        role = 'owner';
  `, [adminId, adminName, adminPhone]);

  console.log(`Admin account created successfully!
  Email: ${adminEmail}
  Password: ${adminPassword}
  Name: ${adminName}
  Role: owner`);

  // Create payment_proofs table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.payment_proofs (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      room_number text NOT NULL,
      resident_name text NOT NULL,
      amount numeric(12,2) NOT NULL,
      bank_name text NOT NULL,
      time_transfer text NOT NULL,
      note text,
      status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow read payment proofs" ON public.payment_proofs;
    CREATE POLICY "Allow read payment proofs"
      ON public.payment_proofs FOR SELECT
      TO anon, authenticated
      USING (true);

    DROP POLICY IF EXISTS "Allow update payment proofs" ON public.payment_proofs;
    CREATE POLICY "Allow update payment proofs"
      ON public.payment_proofs FOR ALL
      TO anon, authenticated
      USING (true);

    DELETE FROM public.payment_proofs;

    INSERT INTO public.payment_proofs (room_number, resident_name, amount, bank_name, time_transfer, note, status)
    VALUES
      ('B-04', 'Azka Andya', 1575000, 'BCA', '14:15 WIB', 'Transfer via BCA Mobile a.n Azka Andya...', 'pending'),
      ('B-01', 'Sarah Nabilla', 1500000, 'BCA', '13:40 WIB', 'Sewa kamar kost putri bulan November Sarah...', 'pending'),
      ('A-01', 'Riana', 1350000, 'Mandiri', '11:20 WIB', 'Sewa kamar bulan November', 'pending'),
      ('B-05', 'Salma Ramadhani', 1500000, 'BRI', '09:10 WIB', 'Transfer langsung via BRIMO a.n Salma.R', 'pending');
  `);

  console.log('Payment proofs and dashboard records seeded successfully!');
  await client.end();
}

seedAdmin().catch(err => {
  console.error('Seed admin error:', err);
  process.exit(1);
});
