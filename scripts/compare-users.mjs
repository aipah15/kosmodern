import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function compare() {
  await client.connect();

  const good = await client.query('SELECT * FROM auth.users WHERE id = $1', ['5f753656-0dc7-4efc-871f-008b8fa1ac93']);
  const bad = await client.query('SELECT * FROM auth.users WHERE email = $1', ['owner@kostyusi.com']);

  console.log('--- GOOD USER vs BAD USER DIFFS ---');
  for (const [k, v] of Object.entries(good.rows[0])) {
    const badVal = bad.rows[0]?.[k];
    if (JSON.stringify(v) !== JSON.stringify(badVal)) {
      console.log(`Diff on "${k}":`);
      console.log('  good:', v);
      console.log('  bad: ', badVal);
    }
  }

  const goodIdent = await client.query('SELECT * FROM auth.identities WHERE user_id = $1', ['5f753656-0dc7-4efc-871f-008b8fa1ac93']);
  const badIdent = await client.query('SELECT * FROM auth.identities WHERE user_id = $1', [bad.rows[0]?.id]);

  console.log('--- GOOD IDENTITY ---', goodIdent.rows[0]);
  console.log('--- BAD IDENTITY ---', badIdent.rows[0]);

  await client.end();
}

compare().catch(console.error);
