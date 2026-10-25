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

async function seedTenantUser() {
  await client.connect();

  const email = 'azkaandya@gmail.com';
  const password = 'user123456';
  const name = 'Azka Andya';
  const phone = '+6281288219920';
  const userId = 'a7a7a7a7-b040-4000-8000-000000000b04';
  const roomId = 'bafc5f32-054f-479e-8fdb-c3871f50b0b2'; // Kamar B-04

  console.log('1. Cleaning existing user with same email or phone...');
  await client.query(`DELETE FROM public.profiles WHERE id = $1`, [userId]);
  await client.query(`DELETE FROM auth.identities WHERE user_id = $1`, [userId]);
  await client.query(`DELETE FROM auth.users WHERE id = $1 OR email = $2 OR phone = $3`, [userId, email, phone]);

  console.log('2. Inserting auth.users for tenant Azka Andya...');
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
      '{"provider":"email","providers":["email","phone"]}'::jsonb,
      jsonb_build_object(
        'sub', $1::text,
        'email', $2::text,
        'email_verified', true,
        'phone_verified', true,
        'role', 'tenant',
        'full_name', $4::text,
        'phone', $5::text,
        'room_number', 'B-04'
      ),
      null,
      now(),
      now(),
      $5::text,
      now(),
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

  console.log('3. Inserting auth.identities (email & phone)...');
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
      jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true, 'phone', $3::text, 'phone_verified', true),
      'email',
      now(),
      now(),
      now()
    )
  `, [userId, email, phone]);

  console.log('4. Inserting or updating public.profiles...');
  await client.query(`
    INSERT INTO public.profiles (id, full_name, phone, role, room_id)
    VALUES ($1::uuid, $2::text, $3::text, 'tenant', $4::uuid)
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, role = 'tenant', room_id = EXCLUDED.room_id
  `, [userId, name, phone, roomId]);

  console.log('5. Updating public.tenants with user_id...');
  await client.query(`
    UPDATE public.tenants
    SET user_id = $1::uuid, email = $2::text
    WHERE room_number = 'B-04' OR full_name ILIKE '%Azka%'
  `, [userId, email]);

  console.log('Tenant records created! Testing sign in with email via Supabase client...');
  const { data: emailLogin, error: emailErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (emailErr) {
    console.error('❌ Email sign-in error:', emailErr.message);
  } else {
    console.log('✅ SUCCESS! Email login works for:', emailLogin.user.email);
  }

  console.log('Testing sign in with phone via Supabase client...');
  const { data: phoneLogin, error: phoneErr } = await supabase.auth.signInWithPassword({
    phone,
    password,
  });

  if (phoneErr) {
    console.log('ℹ️ Phone sign-in note:', phoneErr.message);
  } else {
    console.log('✅ SUCCESS! Phone login works for:', phoneLogin.user.phone);
  }

  await client.end();
}

seedTenantUser().catch(console.error);
