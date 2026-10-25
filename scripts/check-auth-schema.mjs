import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();

  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'auth';
  `);
  console.log('Tables in auth schema:', tables.rows.map(r => r.table_name));

  const grants = await client.query(`
    SELECT count(*) 
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'auth' AND grantee = 'supabase_auth_admin';
  `);
  console.log('Grants on auth for supabase_auth_admin count:', grants.rows[0].count);

  // Check if any trigger on auth.users is causing issues
  const triggerList = await client.query(`
    SELECT tgname, proname, prosrc 
    FROM pg_trigger t
    JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE tgname = 'on_auth_user_created';
  `);
  console.log('on_auth_user_created trigger:', triggerList.rows[0]);

  await client.end();
}

check().catch(console.error);
