import pg from 'pg';

const { Client } = pg;

async function migrateAndSeedTenants() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Creating tenants table...');

    // 1. Create table public.tenants
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.tenants (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        tenant_code text NOT NULL UNIQUE,
        full_name text NOT NULL,
        email text,
        phone text NOT NULL,
        nik text,
        occupation text,
        institution text,
        origin_city text,
        origin_address text,
        emergency_contact_name text,
        emergency_contact_relation text,
        emergency_contact_phone text,
        room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
        room_number text,
        floor text,
        property_name text DEFAULT 'Kost Yusi',
        room_type text DEFAULT 'Deluxe',
        check_in_date date NOT NULL DEFAULT CURRENT_DATE,
        contract_type text DEFAULT 'Bulanan',
        due_date_day integer DEFAULT 1,
        rent_amount numeric(12,2) DEFAULT 1500000,
        deposit_amount numeric(12,2) DEFAULT 500000,
        status text CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
        bill_status text CHECK (bill_status IN ('waiting_verification', 'paid', 'unpaid', 'overdue')) DEFAULT 'waiting_verification',
        bill_period text DEFAULT 'Okt–Nov 2026',
        bill_amount numeric(12,2) DEFAULT 1575000,
        overdue_days integer DEFAULT 0,
        fine_amount numeric(12,2) DEFAULT 0,
        invitation_code text,
        user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      -- Enable RLS
      ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow select tenants" ON public.tenants;
      CREATE POLICY "Allow select tenants"
        ON public.tenants FOR SELECT
        TO anon, authenticated
        USING (true);

      DROP POLICY IF EXISTS "Allow update tenants" ON public.tenants;
      CREATE POLICY "Allow update tenants"
        ON public.tenants FOR UPDATE
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow insert tenants" ON public.tenants;
      CREATE POLICY "Allow insert tenants"
        ON public.tenants FOR INSERT
        TO anon, authenticated
        WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow delete tenants" ON public.tenants;
      CREATE POLICY "Allow delete tenants"
        ON public.tenants FOR DELETE
        TO anon, authenticated
        USING (true);
    `);

    console.log('Tenants table created & policies configured.');

    // Fetch rooms to link room_id
    const roomsRes = await client.query('SELECT id, room_number, floor, room_type, price FROM public.rooms;');
    const roomsMap = {};
    roomsRes.rows.forEach(r => {
      roomsMap[r.room_number] = r;
    });

    // 2. Seed the 8 active tenants matching the screenshots
    const tenantsData = [
      {
        tenant_code: 'KM-P084',
        full_name: 'Azka Andya Safira',
        email: 'azkaandya@gmail.com',
        phone: '0812-8821-9920',
        nik: '3273198829100003',
        occupation: 'Mahasiswa',
        institution: 'Universitas Negeri Malang',
        origin_city: 'Bekasi',
        origin_address: 'Jatiwaringin, Kota Bekasi',
        emergency_contact_name: 'Bpk. Hendra Pratama',
        emergency_contact_relation: 'Ayah Kandung',
        emergency_contact_phone: '0811-9876-5432',
        room_number: 'B-04',
        floor: 'Lt. 1',
        property_name: 'Kost Yusi',
        room_type: 'Tipe Deluxe',
        check_in_date: '2024-01-01',
        contract_type: 'Bulanan',
        due_date_day: 1,
        rent_amount: 1500000,
        deposit_amount: 500000,
        status: 'active',
        bill_status: 'waiting_verification',
        bill_period: 'Okt–Nov 2026',
        bill_amount: 1575000,
        overdue_days: 0,
        fine_amount: 0,
        invitation_code: 'KM-B04-9842',
      },
      {
        tenant_code: 'KM-P042',
        full_name: 'Sarah Nabilla',
        email: 'sarah.nabilla@gmail.com',
        phone: '0857-1928-3341',
        nik: '3271120987650002',
        occupation: 'Karyawan Swasta',
        institution: 'PT Digital Solusi',
        origin_city: 'Surabaya',
        origin_address: 'Gubeng, Kota Surabaya',
        emergency_contact_name: 'Ibu Ratna Nabilla',
        emergency_contact_relation: 'Ibu Kandung',
        emergency_contact_phone: '0812-9876-1122',
        room_number: 'B-01',
        floor: 'Lt. 1',
        property_name: 'Kost Yusi',
        room_type: 'Tipe Deluxe',
        check_in_date: '2023-08-17',
        contract_type: 'Bulanan',
        due_date_day: 1,
        rent_amount: 1500000,
        deposit_amount: 500000,
        status: 'active',
        bill_status: 'waiting_verification',
        bill_period: 'Okt–Nov 2026',
        bill_amount: 1500000,
        overdue_days: 0,
        fine_amount: 0,
        invitation_code: 'KM-B01-4412',
      },
      {
        tenant_code: 'KM-P092',
        full_name: 'Riana',
        email: 'riana.kost@gmail.com',
        phone: '0813-7729-1092',
        nik: '3578015509980004',
        occupation: 'Mahasiswa',
        institution: 'Universitas Brawijaya',
        origin_city: 'Sidoarjo',
        origin_address: 'Waru, Sidoarjo',
        emergency_contact_name: 'Bpk. Agus Santoso',
        emergency_contact_relation: 'Orang Tua',
        emergency_contact_phone: '0813-5566-7788',
        room_number: 'A-01',
        floor: 'Lt. 2',
        property_name: 'Kost Yusi',
        room_type: 'Tipe Standard single',
        check_in_date: '2023-11-12',
        contract_type: 'Bulanan',
        due_date_day: 1,
        rent_amount: 1300000,
        deposit_amount: 500000,
        status: 'active',
        bill_status: 'waiting_verification',
        bill_period: 'Okt–Nov 2026',
        bill_amount: 1300000,
        overdue_days: 0,
        fine_amount: 0,
        invitation_code: 'KM-A01-7729',
      },
      {
        tenant_code: 'KM-P110',
        full_name: 'Salma Ramadhani',
        email: 'salma.ramadhani@gmail.com',
        phone: '0821-9912-4411',
        nik: '3174094403010005',
        occupation: 'Mahasiswa',
        institution: 'Politeknik Negeri Malang',
        origin_city: 'Jakarta Selatan',
        origin_address: 'Tebet, Jakarta Selatan',
        emergency_contact_name: 'Hj. Farida',
        emergency_contact_relation: 'Ibu',
        emergency_contact_phone: '0812-3344-5566',
        room_number: 'B-05',
        floor: 'Lt. 1',
        property_name: 'Kost Yusi',
        room_type: 'Tipe Deluxe',
        check_in_date: '2024-03-05',
        contract_type: 'Bulanan',
        due_date_day: 1,
        rent_amount: 1500000,
        deposit_amount: 500000,
        status: 'active',
        bill_status: 'waiting_verification',
        bill_period: 'Okt–Nov 2026',
        bill_amount: 1500000,
        overdue_days: 0,
        fine_amount: 0,
        invitation_code: 'KM-B05-9912',
      },
      {
        tenant_code: 'KM-P055',
        full_name: 'Rizka Salsabila',
        email: 'rizka.salsabila@gmail.com',
        phone: '0878-3321-4455',
        nik: '3374026605020001',
        occupation: 'Mahasiswa',
        institution: 'Universitas Negeri Malang',
        origin_city: 'Semarang',
        origin_address: 'Banyumanik, Semarang',
        emergency_contact_name: 'Drs. Bambang Irawan',
        emergency_contact_relation: 'Ayah',
        emergency_contact_phone: '0812-7788-9900',
        room_number: 'A-02',
        floor: 'Lt. 2',
        property_name: 'Kost Yusi',
        room_type: 'Tipe Standard single',
        check_in_date: '2024-02-06',
        contract_type: 'Bulanan',
        due_date_day: 1,
        rent_amount: 1350000,
        deposit_amount: 500000,
        status: 'active',
        bill_status: 'overdue',
        bill_period: 'Okt–Nov 2026',
        bill_amount: 1400000,
        overdue_days: 11,
        fine_amount: 50000,
        invitation_code: 'KM-A02-3321',
      },
      {
        tenant_code: 'KM-P019',
        full_name: 'Nia Syahrini',
        email: 'nia.syahrini@gmail.com',
        phone: '0819-2234-9911',
        nik: '3201085208990008',
        occupation: 'Freelance Designer',
        institution: 'Remote Studio',
        origin_city: 'Bogor',
        origin_address: 'Cibinong, Bogor',
        emergency_contact_name: 'Bpk. Syahrul',
        emergency_contact_relation: 'Ayah',
        emergency_contact_phone: '0813-4455-6677',
        room_number: 'A-03',
        floor: 'Lt. 2',
        property_name: 'Kost Yusi',
        room_type: 'Tipe Standard single',
        check_in_date: '2022-09-19',
        contract_type: 'Bulanan',
        due_date_day: 1,
        rent_amount: 1300000,
        deposit_amount: 500000,
        status: 'active',
        bill_status: 'unpaid',
        bill_period: 'Okt–Nov 2026',
        bill_amount: 1300000,
        overdue_days: 0,
        fine_amount: 0,
        invitation_code: 'KM-A03-2234',
      },
      {
        tenant_code: 'KM-P061',
        full_name: 'Fitria Ramadhani',
        email: 'fitria.ramadhani@gmail.com',
        phone: '0812-4455-6677',
        nik: '3515096112000002',
        occupation: 'Mahasiswa',
        institution: 'Universitas Brawijaya',
        origin_city: 'Kediri',
        origin_address: 'Mojoroto, Kediri',
        emergency_contact_name: 'H. Suwandi',
        emergency_contact_relation: 'Orang Tua',
        emergency_contact_phone: '0812-6677-8899',
        room_number: 'A-04',
        floor: 'Lt. 2',
        property_name: 'Kost Yusi',
        room_type: 'Tipe Standard single',
        check_in_date: '2023-12-15',
        contract_type: 'Bulanan',
        due_date_day: 1,
        rent_amount: 1300000,
        deposit_amount: 500000,
        status: 'active',
        bill_status: 'paid',
        bill_period: 'Okt–Nov 2026',
        bill_amount: 1300000,
        overdue_days: 0,
        fine_amount: 0,
        invitation_code: 'KM-A04-4455',
      },
      {
        tenant_code: 'KM-P078',
        full_name: 'Alya Syarifah',
        email: 'alya.syarifah@gmail.com',
        phone: '0852-1122-3344',
        nik: '3171054101010006',
        occupation: 'Mahasiswa',
        institution: 'Universitas Negeri Malang',
        origin_city: 'Bandung',
        origin_address: 'Coblong, Kota Bandung',
        emergency_contact_name: 'Dra. Yuliana',
        emergency_contact_relation: 'Ibu',
        emergency_contact_phone: '0852-9988-7766',
        room_number: 'B-02',
        floor: 'Lt. 1',
        property_name: 'Kost Yusi',
        room_type: 'Tipe Deluxe',
        check_in_date: '2024-01-20',
        contract_type: 'Bulanan',
        due_date_day: 1,
        rent_amount: 1500000,
        deposit_amount: 500000,
        status: 'active',
        bill_status: 'paid',
        bill_period: 'Okt–Nov 2026',
        bill_amount: 1500000,
        overdue_days: 0,
        fine_amount: 0,
        invitation_code: 'KM-B02-1122',
      },
    ];

    for (const t of tenantsData) {
      const room = roomsMap[t.room_number];
      const roomId = room ? room.id : null;

      await client.query(`
        INSERT INTO public.tenants (
          tenant_code, full_name, email, phone, nik, occupation, institution,
          origin_city, origin_address, emergency_contact_name, emergency_contact_relation,
          emergency_contact_phone, room_id, room_number, floor, property_name, room_type,
          check_in_date, contract_type, due_date_day, rent_amount, deposit_amount,
          status, bill_status, bill_period, bill_amount, overdue_days, fine_amount,
          invitation_code
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28,
          $29
        )
        ON CONFLICT (tenant_code) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          nik = EXCLUDED.nik,
          occupation = EXCLUDED.occupation,
          institution = EXCLUDED.institution,
          origin_city = EXCLUDED.origin_city,
          origin_address = EXCLUDED.origin_address,
          emergency_contact_name = EXCLUDED.emergency_contact_name,
          emergency_contact_relation = EXCLUDED.emergency_contact_relation,
          emergency_contact_phone = EXCLUDED.emergency_contact_phone,
          room_id = EXCLUDED.room_id,
          room_number = EXCLUDED.room_number,
          floor = EXCLUDED.floor,
          property_name = EXCLUDED.property_name,
          room_type = EXCLUDED.room_type,
          check_in_date = EXCLUDED.check_in_date,
          rent_amount = EXCLUDED.rent_amount,
          deposit_amount = EXCLUDED.deposit_amount,
          status = EXCLUDED.status,
          bill_status = EXCLUDED.bill_status,
          bill_period = EXCLUDED.bill_period,
          bill_amount = EXCLUDED.bill_amount,
          overdue_days = EXCLUDED.overdue_days,
          fine_amount = EXCLUDED.fine_amount,
          invitation_code = EXCLUDED.invitation_code,
          updated_at = now();
      `, [
        t.tenant_code,
        t.full_name,
        t.email,
        t.phone,
        t.nik,
        t.occupation,
        t.institution,
        t.origin_city,
        t.origin_address,
        t.emergency_contact_name,
        t.emergency_contact_relation,
        t.emergency_contact_phone,
        roomId,
        t.room_number,
        t.floor,
        t.property_name,
        t.room_type,
        t.check_in_date,
        t.contract_type,
        t.due_date_day,
        t.rent_amount,
        t.deposit_amount,
        t.status,
        t.bill_status,
        t.bill_period,
        t.bill_amount,
        t.overdue_days,
        t.fine_amount,
        t.invitation_code,
      ]);
    }

    const countRes = await client.query('SELECT count(*) FROM public.tenants;');
    console.log(`Tenants seeded successfully! Total: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error('Migration tenants error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrateAndSeedTenants();
