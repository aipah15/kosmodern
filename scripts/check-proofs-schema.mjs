import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'payment_proofs'");
  console.log('payment_proofs columns:', res.rows);
  const rows = await client.query("SELECT * FROM public.payment_proofs LIMIT 5");
  console.log('Existing rows count:', rows.rows.length);
  await client.end();
}

check().catch(console.error);
