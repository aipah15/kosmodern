import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  const res = await client.query('SELECT * FROM auth.users WHERE email = $1', ['owner@kostyusi.com']);
  console.log('User row:', res.rows[0]);

  // Check auth identities
  const ident = await client.query('SELECT * FROM auth.identities WHERE user_id = $1', [res.rows[0]?.id]);
  console.log('User identities:', ident.rows);

  await client.end();
}

check().catch(console.error);
