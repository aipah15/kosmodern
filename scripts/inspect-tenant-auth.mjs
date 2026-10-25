import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();

  const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants'");
  console.log('tenants cols:', cols.rows.map(r => r.column_name));

  const tenants = await client.query('SELECT * FROM public.tenants LIMIT 5');
  console.log('Tenants sample:', tenants.rows);

  const users = await client.query('SELECT id, email, phone FROM auth.users');
  console.log('Auth users:', users.rows);

  const profiles = await client.query('SELECT * FROM public.profiles');
  console.log('Profiles:', profiles.rows);

  await client.end();
}

main().catch(console.error);
