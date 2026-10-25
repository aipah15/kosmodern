-- Schema SQL untuk KostYusi (Supabase Postgres)
-- Jalankan skrip ini di Supabase SQL Editor: Dashboard > SQL Editor > New query

-- 1. Tabel Profil Pengguna (Pemilik & Penghuni Kos)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text unique,
  role text check (role in ('owner', 'tenant')) default 'tenant',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Tabel Kamar Kos
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  room_number text not null,
  floor text default 'Lantai 1',
  room_type text default 'Deluxe AC',
  price numeric(12,2) not null default 0,
  status text check (status in ('available', 'occupied', 'maintenance', 'kosong', 'terisi', 'perbaikan')) default 'available',
  image_url text default '',
  facilities text[] default array['AC', 'KM Dalam', 'Springbed', 'Smart Lock'],
  tenant_name text,
  tenant_avatar text,
  tenant_id uuid references auth.users(id) on delete set null,
  maintenance_title text,
  maintenance_note text,
  property_name text default 'Wisma Melati',
  property_address text default 'Jl. Sigura - Gura IV No.6',
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Tabel Kode Undangan Penghuni Baru
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  room_id uuid references public.rooms(id) on delete set null,
  is_used boolean default false,
  used_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 4. Tabel Tagihan & Pembayaran
create table if not exists public.bills (
  id uuid default gen_random_uuid() primary key,
  invoice_number text unique not null,
  tenant_id uuid references public.tenants(id) on delete set null,
  tenant_name text not null,
  tenant_code text,
  tenant_phone text,
  room_id uuid references public.rooms(id) on delete set null,
  room_number text not null,
  floor text default 'Lt. 1',
  room_type text default 'Deluxe AC',
  property_name text default 'Kost Yusi',
  bill_category text check (bill_category in ('sewa', 'listrik', 'air', 'denda', 'deposit', 'lainnya')) default 'sewa',
  title text not null,
  period text not null,
  amount numeric(12,2) not null default 0,
  fine_amount numeric(12,2) default 0,
  status text check (status in ('paid', 'pending', 'unpaid', 'overdue', 'draft', 'lunas', 'menunggu_verifikasi', 'belum_bayar', 'terlambat')) default 'unpaid',
  due_date date not null,
  paid_at timestamptz,
  payment_method text,
  proof_url text,
  notes text,
  send_whatsapp boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Tabel Verifikasi Bukti Pembayaran (Payment Proofs)
create table if not exists public.payment_proofs (
  id uuid default gen_random_uuid() primary key,
  invoice_number text,
  tenant_id uuid references public.tenants(id) on delete set null,
  resident_name text not null,
  tenant_name text,
  room_number text not null,
  floor text default 'Lt. 1',
  property_name text default 'Kost Yusi',
  amount numeric(12,2) not null default 0,
  bank_name text not null,
  bank_sender text,
  account_sender text,
  sender_name text,
  bank_receiver text default 'Bank Mandiri',
  account_receiver text default '137-001928374-1',
  receiver_name text default 'Arifa Andya Nafiisa (Kost Yusi)',
  time_transfer text,
  transfer_date_time text,
  period text default 'November 2026',
  note text,
  tenant_message text,
  proof_image_url text,
  reference_number text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  rejection_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Tabel Rekening Bank Resmi
create table if not exists public.bank_accounts (
  id uuid default gen_random_uuid() primary key,
  bank_name text not null,
  bank_code text not null,
  account_number text not null,
  account_holder text not null,
  branch text,
  is_primary boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Tabel Pengaturan Pembayaran & QRIS
create table if not exists public.payment_settings (
  id uuid default gen_random_uuid() primary key,
  qris_merchant_name text default 'KOST YUSI - ARIFA ANDYA NAFIISA',
  qris_nmid text default 'ID1020039201928',
  qris_city text default 'JAKARTA SELATAN',
  qris_postal_code text default '12430',
  qris_image_url text default '',
  qris_is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Tabel Laporan Kerusakan & Fasilitas
create table if not exists public.maintenance_tickets (
  id uuid default gen_random_uuid() primary key,
  ticket_code text not null,
  title text not null,
  description text not null,
  urgency text check (urgency in ('urgent', 'medium', 'low')) default 'urgent',
  urgency_label text,
  status text check (status in ('baru', 'diproses', 'selesai', 'ditolak')) default 'diproses',
  status_label text,
  tenant_name text not null,
  tenant_avatar text,
  room_number text not null,
  floor text default 'Lantai 2',
  lease_type text default 'Sewa Tahunan',
  access_permission text default 'Diizinkan (Kunci di Pos Keamanan)',
  tenant_phone text default '081298765432',
  area_location text,
  created_time text,
  created_date_str text,
  photo_url text,
  photo_name text default 'ac_bocor_kamar_B04.jpg',
  assigned_technician text default 'Pak Joko',
  estimated_arrival text default 'Hari Ini, 15:30 WIB',
  repair_cost numeric(12,2) default 120000,
  rating numeric(2,1),
  feedback_note text,
  completion_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. Tabel Pengaturan Pengingat Tagihan Otomatis
create table if not exists public.auto_reminder_settings (
  id uuid default gen_random_uuid() primary key,
  engine_active boolean default true,
  next_schedule text default 'besok pukul 09:00 WIB untuk 4 penerima',
  quiet_hours_enabled boolean default true,
  quiet_hours_start text default '21:00',
  quiet_hours_end text default '08:00',
  stop_on_payment boolean default true,
  denda_repeat_days integer default 2,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. Tabel Cadence Pengingat Tagihan
create table if not exists public.reminder_cadence_steps (
  id uuid default gen_random_uuid() primary key,
  step_code text not null,
  title text not null,
  badge_text text,
  description text not null,
  scheduled_time text not null,
  is_active boolean default true,
  template_message text not null,
  sort_order integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 11. Tabel Kulkas Bersama (Communal Fridge Inventory)
create table if not exists public.communal_fridge_items (
  id uuid default gen_random_uuid() primary key,
  tenant_name text not null,
  room_number text not null,
  floor text default 'Lantai 1',
  item_name text not null,
  storage_location text not null,
  entry_date text not null,
  status text check (status in ('expired', 'warning', 'safe')) default 'safe',
  status_label text not null,
  category text default 'makanan',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 12. Tabel Pemantauan Barang Luar Kamar (Communal Area Items)
create table if not exists public.communal_area_items (
  id uuid default gen_random_uuid() primary key,
  zone_id text not null,
  zone_name text not null,
  zone_subtitle text,
  item_name text not null,
  tenant_name text not null,
  room_number text not null,
  time_ago text not null,
  status text check (status in ('safe', 'normal', 'warning', 'overdue', 'transit')) default 'normal',
  status_label text not null,
  note text,
  is_seized boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 13. Tabel Pengumuman Penghuni (Announcements)
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text check (category in ('umum', 'tagihan', 'perawatan', 'ketertiban', 'darurat')) default 'perawatan',
  category_label text default 'Perawatan & Perbaikan',
  content text not null,
  target_audience text check (target_audience in ('all', 'floor', 'specific')) default 'all',
  target_label text default 'Semua Penghuni Wisma Melati',
  target_floors text[],
  target_tenant_ids text[],
  is_pinned boolean default true,
  is_important boolean default true,
  attachments jsonb default '[]'::jsonb,
  created_by text default 'Ibu Arifa Andya Nafiisa',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AKTIFKAN ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.invitations enable row level security;
alter table public.bills enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.payment_settings enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.auto_reminder_settings enable row level security;
alter table public.reminder_cadence_steps enable row level security;
alter table public.communal_fridge_items enable row level security;
alter table public.communal_area_items enable row level security;
alter table public.announcements enable row level security;

-- POLICIES: ANNOUNCEMENTS
create policy "Allow all announcements"
  on public.announcements for all
  to anon, authenticated
  using (true)
  with check (true);

-- POLICIES: BANK ACCOUNTS
create policy "Allow all bank_accounts"
  on public.bank_accounts for all
  to anon, authenticated
  using (true)
  with check (true);

-- POLICIES: PAYMENT SETTINGS
create policy "Allow all payment_settings"
  on public.payment_settings for all
  to anon, authenticated
  using (true)
  with check (true);
alter table public.invitations enable row level security;
alter table public.bills enable row level security;
alter table public.payment_proofs enable row level security;

-- POLICIES: PAYMENT PROOFS
create policy "Allow select payment_proofs"
  on public.payment_proofs for select
  to anon, authenticated
  using (true);

create policy "Allow update payment_proofs"
  on public.payment_proofs for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow insert payment_proofs"
  on public.payment_proofs for insert
  to anon, authenticated
  with check (true);

create policy "Allow delete payment_proofs"
  on public.payment_proofs for delete
  to anon, authenticated
  using (true);

-- POLICIES: PROFILES
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- POLICIES: ROOMS
create policy "Anyone can view rooms"
  on public.rooms for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can update rooms"
  on public.rooms for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can insert rooms"
  on public.rooms for insert
  to authenticated
  with check (true);

create policy "Authenticated users can delete rooms"
  on public.rooms for delete
  to authenticated
  using (true);

-- POLICIES: INVITATIONS (Untuk pendaftaran dengan undangan)
create policy "Allow reading invitation codes"
  on public.invitations for select
  to anon, authenticated
  using (is_used = false);

-- POLICIES: BILLS
create policy "Allow select bills"
  on public.bills for select
  to anon, authenticated
  using (true);

create policy "Allow update bills"
  on public.bills for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow insert bills"
  on public.bills for insert
  to anon, authenticated
  with check (true);

create policy "Allow delete bills"
  on public.bills for delete
  to anon, authenticated
  using (true);

-- 5. Tabel Penghuni (Tenants)
create table if not exists public.tenants (
  id uuid default gen_random_uuid() primary key,
  tenant_code text not null unique,
  full_name text not null,
  email text,
  phone text not null,
  nik text,
  occupation text,
  institution text,
  origin_city text,
  origin_address text,
  emergency_contact_name text,
  emergency_contact_relation text,
  emergency_contact_phone text,
  room_id uuid references public.rooms(id) on delete set null,
  room_number text,
  floor text,
  property_name text default 'Kost Yusi',
  room_type text default 'Deluxe',
  check_in_date date not null default current_date,
  contract_type text default 'Bulanan',
  due_date_day integer default 1,
  rent_amount numeric(12,2) default 1500000,
  deposit_amount numeric(12,2) default 500000,
  status text check (status in ('active', 'inactive', 'pending')) default 'active',
  bill_status text check (bill_status in ('waiting_verification', 'paid', 'unpaid', 'overdue')) default 'waiting_verification',
  bill_period text default 'Okt–Nov 2026',
  bill_amount numeric(12,2) default 1575000,
  overdue_days integer default 0,
  fine_amount numeric(12,2) default 0,
  invitation_code text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tenants enable row level security;

create policy "Allow select tenants"
  on public.tenants for select
  to anon, authenticated
  using (true);

create policy "Allow update tenants"
  on public.tenants for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Allow insert tenants"
  on public.tenants for insert
  to anon, authenticated
  with check (true);

create policy "Allow delete tenants"
  on public.tenants for delete
  to anon, authenticated
  using (true);


-- 15. Profil properti & kebijakan sewa (Pengaturan admin)
create table if not exists public.property_settings (
  id uuid default gen_random_uuid() primary key,
  profile jsonb not null default '{}'::jsonb,
  policies jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.property_settings enable row level security;

create policy "Authenticated manage property_settings"
  on public.property_settings for all
  to authenticated
  using (true)
  with check (true);


-- 16. Kolom tambahan portal penghuni (lihat scripts/migrate-tenant-portal.mjs)
alter table public.maintenance_tickets
  add column if not exists tenant_id uuid references public.tenants(id) on delete set null,
  add column if not exists location_type text default 'pribadi';

alter table public.communal_fridge_items
  add column if not exists tenant_id uuid references public.tenants(id) on delete set null,
  add column if not exists tenant_phone text,
  add column if not exists expiry_date date,
  add column if not exists quantity_note text,
  add column if not exists shelf_type text,
  add column if not exists photo_url text,
  add column if not exists notes text;

alter table public.communal_area_items
  add column if not exists tenant_id uuid references public.tenants(id) on delete set null,
  add column if not exists tenant_phone text,
  add column if not exists photo_url text;

alter table public.payment_proofs
  add column if not exists invoice_numbers text[];
