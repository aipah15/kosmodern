import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function addIdentity() {
  await client.connect();

  const user = await client.query(`SELECT id, email FROM auth.users WHERE email = $1`, ['owner@kostyusi.com']);
  if (!user.rows.length) {
    console.log('User not found');
    return;
  }

  const userId = user.rows[0].id;
  const email = user.rows[0].email;

  // Insert into auth.identities
  await client.query(`
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      $1::uuid,
      $1::uuid,
      jsonb_build_object('sub', $1::text, 'email', $2::text),
      'email',
      $1::text,
      now(),
      now(),
      now()
    )
    ON CONFLICT (provider_id, provider) DO UPDATE
    SET identity_data = EXCLUDED.identity_data,
        updated_at = now();
  `, [userId, email]);

  console.log('Identity added to auth.identities for', email);
  await client.end();
}

addIdentity().catch(console.error);
