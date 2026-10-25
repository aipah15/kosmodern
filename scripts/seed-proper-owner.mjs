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

async function seedProperOwner() {
  await client.connect();

  const email = 'owner@kostyusi.com';
  const password = 'admin123456';
  const name = 'Ibu Hj. Ratna Juwita';
  const phone = '+6281299887766';
  const userId = '5d9cbc48-d94f-46dc-8448-958e1124e6c8';

  console.log('1. Cleaning existing owner...');
  await client.query(`DELETE FROM public.profiles WHERE id = $1`, [userId]);
  await client.query(`DELETE FROM auth.identities WHERE user_id = $1`, [userId]);
  await client.query(`DELETE FROM auth.users WHERE id = $1 OR email = $2`, [userId, email]);

  console.log('2. Inserting auth.users with 10-round bcrypt...');
  await client.query(`
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at,
      is_anonymous
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      $1::uuid,
      'authenticated',
      'authenticated',
      $2::text,
      crypt($3::text, gen_salt('bf', 10)),
      now(),
      null,
      '',
      null,
      '',
      null,
      '',
      '',
      null,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'sub', $1::text,
        'email', $2::text,
        'email_verified', true,
        'phone_verified', false,
        'role', 'owner',
        'full_name', $4::text,
        'phone', $5::text
      ),
      null,
      now(),
      now(),
      null,
      null,
      '',
      '',
      null,
      '',
      0,
      null,
      '',
      null,
      false,
      null,
      false
    )
  `, [userId, email, password, name, phone]);

  console.log('3. Inserting auth.identities...');
  await client.query(`
    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      $1::text,
      $1::uuid,
      jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    )
  `, [userId, email]);

  console.log('4. Inserting or updating public.profiles...');
  await client.query(`
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES ($1::uuid, $2::text, $3::text, 'owner')
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, role = 'owner'
  `, [userId, name, phone]);

  console.log('Owner records inserted! Testing sign in with Supabase client...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authErr) {
    console.error('Sign in error:', authErr.message);
  } else {
    console.log('🎉 SUCCESS! Logged in as:', authData.user.email);
  }

  await client.end();
}

seedProperOwner().catch(console.error);
