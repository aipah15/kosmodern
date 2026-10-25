import pg from 'pg';
const { Client } = pg;

async function checkDb() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const columns = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'rooms'
    ORDER BY ordinal_position;
  `);
  console.log('ROOMS COLUMNS:', columns.rows);

  const rooms = await client.query('SELECT * FROM public.rooms;');
  console.log('ROOMS COUNT:', rooms.rows.length);
  console.log('ROOMS:', rooms.rows);

  const profiles = await client.query('SELECT id, full_name, role, room_id FROM public.profiles;');
  console.log('PROFILES COUNT:', profiles.rows.length);
  console.log('PROFILES:', profiles.rows);

  await client.end();
}

checkDb().catch(console.error);
