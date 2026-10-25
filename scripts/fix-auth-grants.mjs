import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixGrants() {
  await client.connect();
  console.log('Granting all permissions on auth schema to supabase_auth_admin...');

  await client.query(`
    -- Grant auth schema permissions
    GRANT USAGE, CREATE ON SCHEMA auth TO supabase_auth_admin;
    GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;
    GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO supabase_auth_admin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO supabase_auth_admin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO supabase_auth_admin;
    ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON ROUTINES TO supabase_auth_admin;

    -- Also grant public schema so triggers work
    GRANT USAGE, CREATE ON SCHEMA public TO supabase_auth_admin;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin;

    -- Also ensure authenticator role has usage
    GRANT USAGE ON SCHEMA auth TO authenticator;
    GRANT SELECT ON auth.users TO authenticator;
  `);

  console.log('Permissions granted successfully!');
  await client.end();
}

fixGrants().catch(err => {
  console.error(err);
  process.exit(1);
});
