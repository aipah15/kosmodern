import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(process.cwd(), 'supabase', 'schema.sql'), 'utf-8');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to database. Applying schema...');
    await client.query(sql);
    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
