import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function diagnose() {
  await client.connect();

  const triggers = await client.query(`
    SELECT tgname, proname 
    FROM pg_trigger t
    JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE tgrelid = 'auth.users'::regclass;
  `);
  console.log('Triggers on auth.users:', triggers.rows);

  const authRoles = await client.query(`
    SELECT rolname FROM pg_roles WHERE rolname LIKE '%auth%';
  `);
  console.log('Auth roles in Postgres:', authRoles.rows.map(r => r.rolname));

  await client.end();
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
