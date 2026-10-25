import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const url = 'https://cppvsvyenlutkyinawmg.supabase.co';
const key = 'sb_publishable_wn370pXZoeqk3K9uW8h7bw_j3JchjL1';
const supabase = createClient(url, key);

async function recreate() {
  await client.connect();

  console.log('1. Cleaning up manual owner records...');
  const user = await client.query(`SELECT id FROM auth.users WHERE email = $1`, ['owner@kostyusi.com']);
  if (user.rows.length) {
    const uid = user.rows[0].id;
    await client.query(`DELETE FROM public.profiles WHERE id = $1`, [uid]);
    await client.query(`DELETE FROM auth.identities WHERE user_id = $1`, [uid]);
    await client.query(`DELETE FROM auth.users WHERE id = $1`, [uid]);
  }

  console.log('2. Signing up via official Supabase Auth GoTrue API...');
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: 'owner@kostyusi.com',
    password: 'admin123456',
    options: {
      data: {
        full_name: 'Arifa Andya Nafiisa',
        phone: '+6281299887766',
        role: 'owner',
      },
    },
  });

  if (signUpErr) {
    console.error('SignUp Error:', signUpErr);
    await client.end();
    return;
  }

  const newId = signUpData.user.id;
  console.log('Signed up user id:', newId);

  console.log('3. Confirming email and setting owner profile in database...');
  await client.query(`
    UPDATE auth.users
    SET 
      email_confirmed_at = now(),
      confirmed_at = now(),
      raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', array['email'], 'role', 'owner'),
      raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'owner', 'email_verified', true)
    WHERE id = $1;

    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES ($1, 'Arifa Andya Nafiisa', '+6281299887766', 'owner')
    ON CONFLICT (id) DO UPDATE
    SET role = 'owner', full_name = 'Arifa Andya Nafiisa', phone = '+6281299887766';
  `, [newId]);

  console.log('4. Testing signInWithPassword as owner@kostyusi.com...');
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'owner@kostyusi.com',
    password: 'admin123456',
  });

  if (signInErr) {
    console.error('SignIn Error:', signInErr);
  } else {
    console.log('🎉 SIGN IN SUCCEEDED! User:', signInData.user.email, 'Role:', signInData.user.user_metadata?.role);
  }

  await client.end();
}

recreate().catch(console.error);
