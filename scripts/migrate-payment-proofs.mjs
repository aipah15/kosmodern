import pg from 'pg';

const { Client } = pg;

async function migrateAndSeedPaymentProofs() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Updating payment_proofs table & schema...');

    // 1. Create table with all required columns if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.payment_proofs (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        invoice_number text,
        tenant_id uuid,
        resident_name text NOT NULL,
        tenant_name text,
        room_number text NOT NULL,
        floor text DEFAULT 'Lt. 1',
        property_name text DEFAULT 'Kost Yusi',
        amount numeric(12,2) NOT NULL DEFAULT 0,
        bank_name text NOT NULL,
        bank_sender text,
        account_sender text,
        sender_name text,
        bank_receiver text DEFAULT 'Bank Mandiri',
        account_receiver text DEFAULT '137-001928374-1',
        receiver_name text DEFAULT 'Arifa Andya Nafiisa (Kost Yusi)',
        time_transfer text,
        transfer_date_time text,
        period text DEFAULT 'November 2026',
        note text,
        tenant_message text,
        proof_image_url text,
        reference_number text,
        status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        rejection_reason text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    // 2. Add columns if not already present
    await client.query(`
      ALTER TABLE public.payment_proofs
        ADD COLUMN IF NOT EXISTS invoice_number text,
        ADD COLUMN IF NOT EXISTS tenant_id uuid,
        ADD COLUMN IF NOT EXISTS tenant_name text,
        ADD COLUMN IF NOT EXISTS floor text DEFAULT 'Lt. 1',
        ADD COLUMN IF NOT EXISTS property_name text DEFAULT 'Kost Yusi',
        ADD COLUMN IF NOT EXISTS bank_sender text,
        ADD COLUMN IF NOT EXISTS account_sender text,
        ADD COLUMN IF NOT EXISTS sender_name text,
        ADD COLUMN IF NOT EXISTS bank_receiver text DEFAULT 'Bank Mandiri',
        ADD COLUMN IF NOT EXISTS account_receiver text DEFAULT '137-001928374-1',
        ADD COLUMN IF NOT EXISTS receiver_name text DEFAULT 'Arifa Andya Nafiisa (Kost Yusi)',
        ADD COLUMN IF NOT EXISTS transfer_date_time text,
        ADD COLUMN IF NOT EXISTS period text DEFAULT 'November 2026',
        ADD COLUMN IF NOT EXISTS tenant_message text,
        ADD COLUMN IF NOT EXISTS proof_image_url text,
        ADD COLUMN IF NOT EXISTS reference_number text,
        ADD COLUMN IF NOT EXISTS rejection_reason text,
        ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
    `);

    // 3. Enable RLS and setup policies
    await client.query(`
      ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Public full access to payment_proofs" ON public.payment_proofs;
      CREATE POLICY "Public full access to payment_proofs"
        ON public.payment_proofs
        FOR ALL
        TO anon, authenticated
        USING (true)
        WITH CHECK (true);
    `);

    // 4. Seed data matching the screenshot exactly
    console.log('Clearing existing sample payment proofs and inserting exact screenshot items...');
    await client.query(`DELETE FROM public.payment_proofs;`);

    const proofs = [
      {
        invoice_number: 'INV-2026-06-B04',
        tenant_name: 'Azka Andya Safira',
        resident_name: 'Azka Andya Safira',
        room_number: 'B-04',
        floor: 'Lantai 1',
        property_name: 'Kost Yusi',
        amount: 1575000,
        bank_name: 'BCA',
        bank_sender: 'Bank BCA',
        account_sender: '630 - 01*-**26',
        sender_name: 'ERICK G P',
        bank_receiver: 'Bank Mandiri',
        account_receiver: '137-001928374-1',
        receiver_name: 'Arifa Andya Nafiisa (Kost Yusi)',
        time_transfer: 'Hari ini, 14:15 (25m lalu)',
        transfer_date_time: '02 Mei 2026 09:56:27',
        period: 'November 2026',
        note: 'Transfer via BCA Mobile a.n Azka Andya / ERICK G P',
        tenant_message: 'Sudah ditransfer dari BCA ya ibu, terima kasih banyak 🙏',
        reference_number: 'B09D0932-2521-4ASE-A74E-EB081D18B667',
        status: 'pending',
        rejection_reason: null,
      },
      {
        invoice_number: 'INV-2026-06-B01',
        tenant_name: 'Sarah Nabila',
        resident_name: 'Sarah Nabila',
        room_number: 'B-01',
        floor: 'Lantai 1',
        property_name: 'Kost Yusi',
        amount: 1500000,
        bank_name: 'BCA',
        bank_sender: 'Transfer BCA • KlikBCA',
        account_sender: '522 - 09*-**11',
        sender_name: 'SARAH NABILA',
        bank_receiver: 'Bank Mandiri',
        account_receiver: '137-001928374-1',
        receiver_name: 'Arifa Andya Nafiisa (Kost Yusi)',
        time_transfer: 'Hari ini, 11:30 (3 jam lalu)',
        transfer_date_time: '02 Mei 2026 11:30:15',
        period: 'November 2026',
        note: 'Transfer via KlikBCA sewa bulan November',
        tenant_message: 'Uang sewa bulan November sudah ditransfer ya bu, trims!',
        reference_number: 'BCA7721-9921-2311-A891-FF0923881023',
        status: 'pending',
        rejection_reason: null,
      },
      {
        invoice_number: 'INV-2026-06-A01',
        tenant_name: 'Riana',
        resident_name: 'Riana',
        room_number: 'A-01',
        floor: 'Lantai 2',
        property_name: 'Kost Yusi',
        amount: 1350000,
        bank_name: 'Mandiri',
        bank_sender: 'Transfer Mandiri',
        account_sender: '142 - 00*-**99',
        sender_name: 'RIANA',
        bank_receiver: 'Bank Mandiri',
        account_receiver: '137-001928374-1',
        receiver_name: 'Arifa Andya Nafiisa (Kost Yusi)',
        time_transfer: 'Kemarin, 21:05',
        transfer_date_time: '01 Mei 2026 21:05:40',
        period: 'November 2026',
        note: 'Transfer via Livin Mandiri',
        tenant_message: 'Pembayaran sewa kamar A-01 via Livin Mandiri bu.',
        reference_number: 'MDR9901-2026-0501-A12B-008819283744',
        status: 'pending',
        rejection_reason: null,
      },
      {
        invoice_number: 'INV-2026-06-B05',
        tenant_name: 'Salma Ramadhani',
        resident_name: 'Salma Ramadhani',
        room_number: 'B-05',
        floor: 'Lantai 1',
        property_name: 'Kost Yusi',
        amount: 1500000,
        bank_name: 'BRI',
        bank_sender: 'Transfer BRI',
        account_sender: '001 - 22*-**88',
        sender_name: 'SALMA RAMADHANI',
        bank_receiver: 'Bank Mandiri',
        account_receiver: '137-001928374-1',
        receiver_name: 'Arifa Andya Nafiisa (Kost Yusi)',
        time_transfer: 'Kemarin, 21:05',
        transfer_date_time: '01 Mei 2026 21:05:12',
        period: 'November 2026',
        note: 'Transfer langsung via BRIMO a.n Salma.R',
        tenant_message: 'Sudah ditransfer via BRIMO bu, mohon diverifikasi yaa.',
        reference_number: 'BRI-20260501-88192300-TRX',
        status: 'pending',
        rejection_reason: null,
      },
      // 1 Rejected proof (matches "1 transaksi Rp 1.995.000 (Struk tidak terlihat jelas)")
      {
        invoice_number: 'INV-2026-06-A03',
        tenant_name: 'Dinda Kirana',
        resident_name: 'Dinda Kirana',
        room_number: 'A-03',
        floor: 'Lantai 2',
        property_name: 'Kost Yusi',
        amount: 1995000,
        bank_name: 'BCA',
        bank_sender: 'Transfer BCA Mobile',
        account_sender: '711 - 29*-**14',
        sender_name: 'DINDA KIRANA',
        bank_receiver: 'Bank Mandiri',
        account_receiver: '137-001928374-1',
        receiver_name: 'Arifa Andya Nafiisa (Kost Yusi)',
        time_transfer: '3 hari lalu',
        transfer_date_time: '29 Apr 2026 15:40:00',
        period: 'November 2026',
        note: 'Struk buram & potongan terpotong',
        tenant_message: 'Ini bu bukti transfernya',
        reference_number: 'BCA-REJECT-9921',
        status: 'rejected',
        rejection_reason: 'Struk tidak terlihat jelas',
      },
      // 3 Approved proofs (to make total 8)
      {
        invoice_number: 'INV-2026-06-B02',
        tenant_name: 'Ayu Lestari',
        resident_name: 'Ayu Lestari',
        room_number: 'B-02',
        floor: 'Lantai 1',
        property_name: 'Kost Yusi',
        amount: 1500000,
        bank_name: 'BCA',
        bank_sender: 'Transfer BCA',
        account_sender: '122 - 34*-**56',
        sender_name: 'AYU LESTARI',
        bank_receiver: 'Bank Mandiri',
        account_receiver: '137-001928374-1',
        receiver_name: 'Arifa Andya Nafiisa (Kost Yusi)',
        time_transfer: '4 hari lalu',
        transfer_date_time: '28 Apr 2026 10:15:00',
        period: 'November 2026',
        note: 'Transfer lunas',
        tenant_message: 'Sudah ditransfer ya bu Arifa.',
        reference_number: 'BCA-APPR-0102',
        status: 'approved',
        rejection_reason: null,
      },
      {
        invoice_number: 'INV-2026-06-A02',
        tenant_name: 'Nadia Salsabila',
        resident_name: 'Nadia Salsabila',
        room_number: 'A-02',
        floor: 'Lantai 2',
        property_name: 'Kost Yusi',
        amount: 1450000,
        bank_name: 'Mandiri',
        bank_sender: 'Transfer Mandiri',
        account_sender: '130 - 45*-**67',
        sender_name: 'NADIA SALSABILA',
        bank_receiver: 'Bank Mandiri',
        account_receiver: '137-001928374-1',
        receiver_name: 'Arifa Andya Nafiisa (Kost Yusi)',
        time_transfer: '5 hari lalu',
        transfer_date_time: '27 Apr 2026 14:20:00',
        period: 'November 2026',
        note: 'Transfer via Livin Mandiri',
        tenant_message: 'Lunas sewa Mei bu.',
        reference_number: 'MDR-APPR-0103',
        status: 'approved',
        rejection_reason: null,
      },
      {
        invoice_number: 'INV-2026-06-B03',
        tenant_name: 'Tasya Aurelia',
        resident_name: 'Tasya Aurelia',
        room_number: 'B-03',
        floor: 'Lantai 1',
        property_name: 'Kost Yusi',
        amount: 1550000,
        bank_name: 'BNI',
        bank_sender: 'Transfer BNI Mobile',
        account_sender: '038 - 11*-**45',
        sender_name: 'TASYA AURELIA',
        bank_receiver: 'Bank Mandiri',
        account_receiver: '137-001928374-1',
        receiver_name: 'Arifa Andya Nafiisa (Kost Yusi)',
        time_transfer: '6 hari lalu',
        transfer_date_time: '26 Apr 2026 08:45:00',
        period: 'November 2026',
        note: 'Transfer BNI Mobile',
        tenant_message: 'Sewa B-03 lunas bu.',
        reference_number: 'BNI-APPR-0104',
        status: 'approved',
        rejection_reason: null,
      },
    ];

    for (const p of proofs) {
      await client.query(
        `INSERT INTO public.payment_proofs (
          invoice_number, tenant_name, resident_name, room_number, floor, property_name,
          amount, bank_name, bank_sender, account_sender, sender_name, bank_receiver,
          account_receiver, receiver_name, time_transfer, transfer_date_time, period,
          note, tenant_message, reference_number, status, rejection_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          p.invoice_number,
          p.tenant_name,
          p.resident_name,
          p.room_number,
          p.floor,
          p.property_name,
          p.amount,
          p.bank_name,
          p.bank_sender,
          p.account_sender,
          p.sender_name,
          p.bank_receiver,
          p.account_receiver,
          p.receiver_name,
          p.time_transfer,
          p.transfer_date_time,
          p.period,
          p.note,
          p.tenant_message,
          p.reference_number,
          p.status,
          p.rejection_reason,
        ]
      );
    }

    console.log(`Successfully migrated and seeded ${proofs.length} payment proofs!`);
    await client.end();
  } catch (error) {
    console.error('Error migrating payment proofs:', error);
    process.exit(1);
  }
}

migrateAndSeedPaymentProofs();
