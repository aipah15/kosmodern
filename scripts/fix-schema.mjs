import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixSchema() {
  await client.connect();
  console.log('Connected to database. Fixing schema permissions & reloading cache...');

  await client.query(`
    -- 1. Grant usage on schema public
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

    -- 2. Grant all on existing tables, sequences, and routines
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

    -- 3. Set default privileges for any future tables
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

    -- 4. Reload PostgREST schema cache
    NOTIFY pgrst, 'reload schema';
    NOTIFY pgrst, 'reload config';
  `);

  console.log('Postgres schema permissions updated and PostgREST schema cache reloaded successfully!');
  await client.end();
}

fixSchema().catch(err => {
  console.error('Fix schema error:', err);
  process.exit(1);
});
