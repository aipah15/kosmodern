import pg from 'pg';

const { Client } = pg;

async function migrateAndSeedBills() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Updating bills table & schema...');

    // Drop and re-create bills with full modern schema
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.bills (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        invoice_number text UNIQUE NOT NULL,
        tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
        tenant_name text NOT NULL,
        tenant_code text,
        tenant_phone text,
        room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
        room_number text NOT NULL,
        floor text DEFAULT 'Lt. 1',
        room_type text DEFAULT 'Deluxe AC',
        property_name text DEFAULT 'Kost Yusi',
        bill_category text CHECK (bill_category IN ('sewa', 'listrik', 'air', 'denda', 'deposit', 'lainnya')) DEFAULT 'sewa',
        title text NOT NULL,
        period text NOT NULL,
        amount numeric(12,2) NOT NULL DEFAULT 0,
        fine_amount numeric(12,2) DEFAULT 0,
        status text CHECK (status IN ('paid', 'pending', 'unpaid', 'overdue', 'draft', 'lunas', 'menunggu_verifikasi', 'belum_bayar', 'terlambat')) DEFAULT 'unpaid',
        due_date date NOT NULL,
        paid_at timestamptz,
        payment_method text,
        proof_url text,
        notes text,
        send_whatsapp boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      -- Add columns if bills table already existed with old schema
      ALTER TABLE public.bills 
        ADD COLUMN IF NOT EXISTS invoice_number text,
        ADD COLUMN IF NOT EXISTS tenant_name text,
        ADD COLUMN IF NOT EXISTS tenant_code text,
        ADD COLUMN IF NOT EXISTS tenant_phone text,
        ADD COLUMN IF NOT EXISTS room_number text,
        ADD COLUMN IF NOT EXISTS floor text DEFAULT 'Lt. 1',
        ADD COLUMN IF NOT EXISTS room_type text DEFAULT 'Deluxe AC',
        ADD COLUMN IF NOT EXISTS property_name text DEFAULT 'Kost Yusi',
        ADD COLUMN IF NOT EXISTS bill_category text DEFAULT 'sewa',
        ADD COLUMN IF NOT EXISTS title text,
        ADD COLUMN IF NOT EXISTS fine_amount numeric(12,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS payment_method text,
        ADD COLUMN IF NOT EXISTS notes text,
        ADD COLUMN IF NOT EXISTS send_whatsapp boolean DEFAULT true,
        ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

      -- Make tenant_id nullable if it was NOT NULL
      ALTER TABLE public.bills ALTER COLUMN tenant_id DROP NOT NULL;
      ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_status_check;
      ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_tenant_id_fkey;
      ALTER TABLE public.bills DROP CONSTRAINT IF EXISTS bills_room_id_fkey;

      -- Make sure invoice_number has unique index
      CREATE UNIQUE INDEX IF NOT EXISTS bills_invoice_number_idx ON public.bills (invoice_number);

      -- Enable RLS
      ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow select bills" ON public.bills;
      CREATE POLICY "Allow select bills"
        ON public.bills FOR SELECT
        TO anon, authenticated
        USING (true);

      DROP POLICY IF EXISTS "Allow update bills" ON public.bills;
      CREATE POLICY "Allow update bills"
        ON public.bills FOR UPDATE
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow insert bills" ON public.bills;
      CREATE POLICY "Allow insert bills"
        ON public.bills FOR INSERT
        TO anon, authenticated
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow delete bills" ON public.bills;
      CREATE POLICY "Allow delete bills"
        ON public.bills FOR DELETE
        TO anon, authenticated
        USING (true);
    `);

    console.log('Bills schema & RLS configured.');

    // Fetch existing rooms & tenants to link IDs
    const tenantsRes = await client.query('SELECT id, full_name, tenant_code, phone, room_number, floor, room_type FROM public.tenants;');
    const tenantsMap = {};
    tenantsRes.rows.forEach(t => {
      tenantsMap[t.full_name] = t;
    });

    const sampleBills = [
      {
        invoice_number: 'INV-202609-001',
        tenant_name: 'Alya Syarifah',
        tenant_code: 'KM-P084',
        tenant_phone: '0812-9844-1201',
        room_number: 'B-02',
        floor: 'Lt. 1',
        room_type: 'Deluxe AC',
        property_name: 'Kost Yusi',
        bill_category: 'sewa',
        title: 'Sewa Kamar + Kulkas + Mesin Cuci',
        period: 'September 2026',
        due_date: '2026-09-18',
        paid_at: '2026-09-18T09:20:00Z',
        amount: 1600000,
        fine_amount: 0,
        payment_method: 'Transfer BCA',
        status: 'paid',
        proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      },
      {
        invoice_number: 'INV-202611-002',
        tenant_name: 'Azka Andya Safira',
        tenant_code: 'KM-P015',
        tenant_phone: '0813-8877-3321',
        room_number: 'B-04',
        floor: 'Lt. 1',
        room_type: 'Deluxe AC',
        property_name: 'Kost Yusi',
        bill_category: 'sewa',
        title: 'Sewa Kamar + Kulkas',
        period: 'November 2026',
        due_date: '2026-11-01',
        amount: 1575000,
        fine_amount: 0,
        payment_method: 'Transfer BCA',
        status: 'pending',
        proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      },
      {
        invoice_number: 'INV-202610-003',
        tenant_name: 'Fitriah Ramadhani',
        tenant_code: 'KM-P042',
        tenant_phone: '0856-4321-9988',
        room_number: 'A-04',
        floor: 'Lt. 2',
        room_type: 'Standard AC',
        property_name: 'Kost Yusi',
        bill_category: 'sewa',
        title: 'Sewa Kamar + Freezer',
        period: 'Oktober 2026',
        due_date: '2026-10-10',
        paid_at: '2026-10-10T14:15:00Z',
        amount: 1350000,
        fine_amount: 0,
        payment_method: 'QRIS',
        status: 'paid',
        proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      },
      {
        invoice_number: 'INV-202610-004',
        tenant_name: 'Nia Syahrini',
        tenant_code: 'KM-P057',
        tenant_phone: '0821-4433-2210',
        room_number: 'A-03',
        floor: 'Lt. 2',
        room_type: 'Standard AC',
        property_name: 'Kost Yusi',
        bill_category: 'sewa',
        title: 'Sewa Kamar',
        period: 'Oktober 2026',
        due_date: '2026-10-19',
        amount: 1300000,
        fine_amount: 0,
        payment_method: 'Belum dibayar',
        status: 'unpaid',
      },
      {
        invoice_number: 'INV-202611-005',
        tenant_name: 'Riana',
        tenant_code: 'KM-P061',
        tenant_phone: '0811-9988-7766',
        room_number: 'A-01',
        floor: 'Lt. 2',
        room_type: 'Standard AC',
        property_name: 'Kost Yusi',
        bill_category: 'sewa',
        title: 'Sewa Kamar + Kulkas',
        period: 'November 2026',
        due_date: '2026-11-12',
        amount: 1350000,
        fine_amount: 0,
        payment_method: 'Transfer Mandiri',
        status: 'pending',
        proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      },
      {
        invoice_number: 'INV-202610-006',
        tenant_name: 'Rizka Salsabila',
        tenant_code: 'KM-P102',
        tenant_phone: '0819-0123-4567',
        room_number: 'A-02',
        floor: 'Lt. 2',
        room_type: 'Standard AC',
        property_name: 'Kost Yusi',
        bill_category: 'denda',
        title: 'Denda Keterlambatan',
        period: 'Oktober 2026',
        due_date: '2026-10-06',
        amount: 1350000,
        fine_amount: 50000,
        payment_method: 'Belum dibayar',
        status: 'overdue',
      },
      {
        invoice_number: 'INV-202611-007',
        tenant_name: 'Salma Ramadhani',
        tenant_code: 'KM-P028',
        tenant_phone: '0877-3312-8899',
        room_number: 'B-05',
        floor: 'Lt. 1',
        room_type: 'Deluxe AC',
        property_name: 'Kost Yusi',
        bill_category: 'sewa',
        title: 'Sewa Kamar',
        period: 'November 2026',
        due_date: '2026-11-05',
        amount: 1500000,
        fine_amount: 0,
        payment_method: 'Transfer BRI',
        status: 'pending',
        proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      },
      {
        invoice_number: 'INV-202611-008',
        tenant_name: 'Sarah S',
        tenant_code: 'KM-P019',
        tenant_phone: '0878-5544-3322',
        room_number: 'B-01',
        floor: 'Lt. 1',
        room_type: 'Deluxe AC',
        property_name: 'Kost Yusi',
        bill_category: 'sewa',
        title: 'Sewa Kamar',
        period: 'November 2026',
        due_date: '2026-11-17',
        amount: 1500000,
        fine_amount: 0,
        payment_method: 'Transfer BCA',
        status: 'pending',
        proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      },
    ];

    for (const b of sampleBills) {
      const tenantMatch = tenantsMap[b.tenant_name] || null;
      const tenantId = tenantMatch ? tenantMatch.id : null;

      await client.query(`
        INSERT INTO public.bills (
          invoice_number, tenant_id, tenant_name, tenant_code, tenant_phone,
          room_number, floor, room_type, property_name, bill_category, title,
          period, due_date, paid_at, amount, fine_amount, payment_method, status, proof_url
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        ON CONFLICT (invoice_number) DO UPDATE SET
          tenant_name = EXCLUDED.tenant_name,
          tenant_code = EXCLUDED.tenant_code,
          tenant_phone = EXCLUDED.tenant_phone,
          room_number = EXCLUDED.room_number,
          floor = EXCLUDED.floor,
          room_type = EXCLUDED.room_type,
          title = EXCLUDED.title,
          period = EXCLUDED.period,
          due_date = EXCLUDED.due_date,
          paid_at = EXCLUDED.paid_at,
          amount = EXCLUDED.amount,
          fine_amount = EXCLUDED.fine_amount,
          payment_method = EXCLUDED.payment_method,
          status = EXCLUDED.status,
          proof_url = EXCLUDED.proof_url,
          updated_at = now();
      `, [
        b.invoice_number,
        tenantId,
        b.tenant_name,
        b.tenant_code,
        b.tenant_phone,
        b.room_number,
        b.floor,
        b.room_type,
        b.property_name,
        b.bill_category,
        b.title,
        b.period,
        b.due_date,
        b.paid_at || null,
        b.amount,
        b.fine_amount || 0,
        b.payment_method,
        b.status,
        b.proof_url || null,
      ]);
    }

    const countRes = await client.query('SELECT count(*) FROM public.bills;');
    console.log(`Bills seeded successfully! Total: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error('Bills migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrateAndSeedBills();
