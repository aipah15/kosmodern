-- Perbaikan hasil audit. Jalankan di Supabase Dashboard > SQL Editor.

-- 1. Kode undangan gagal dibuat: tabel invitations hanya punya policy SELECT dan UPDATE.
--    Beri izin INSERT khusus pemilik (profiles.role = 'owner').
drop policy if exists "Owner can create invitation codes" on public.invitations;
create policy "Owner can create invitation codes"
  on public.invitations for insert
  to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

-- 2. Bucket Storage untuk semua upload (bukti bayar, foto tiket/kulkas/barang, QRIS, lampiran).
insert into storage.buckets (id, name, public)
values ('payment_proofs', 'payment_proofs', true)
on conflict (id) do update set public = true;

drop policy if exists "payment_proofs_authenticated_upload" on storage.objects;
create policy "payment_proofs_authenticated_upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'payment_proofs');

drop policy if exists "payment_proofs_public_read" on storage.objects;
create policy "payment_proofs_public_read" on storage.objects
  for select to public using (bucket_id = 'payment_proofs');

-- 3. Kamar B-04 tercatat dua kali. Hapus baris yang tidak dirujuk penghuni, tagihan, atau undangan.
delete from public.rooms r
where r.room_number = 'B-04'
  and not exists (select 1 from public.tenants t where t.room_id = r.id)
  and not exists (select 1 from public.bills b where b.room_id = r.id)
  and not exists (select 1 from public.invitations i where i.room_id = r.id)
  and (select count(*) from public.rooms where room_number = 'B-04') > 1;

-- 4. Samakan nama penghuni di tabel rooms dengan tabel tenants (rooms.tenant_name hanya salinan teks).
update public.rooms r
set tenant_name = t.full_name
from public.tenants t
where t.room_id = r.id and t.status = 'active' and r.tenant_name is distinct from t.full_name;

-- 5. OPSIONAL: kamar yang berstatus terisi tetapi tidak punya data penghuni sama sekali
--    (hasil pendaftaran lama yang gagal menyimpan penghuni). Kembalikan menjadi kosong,
--    lalu daftarkan penghuninya lewat menu Penghuni. Periksa daftarnya dulu:
--      select room_number, tenant_name from public.rooms r
--      where status in ('occupied','terisi')
--        and not exists (select 1 from public.tenants t where t.room_id = r.id and t.status = 'active');
-- update public.rooms r
-- set status = 'available', tenant_name = null, tenant_id = null
-- where status in ('occupied','terisi')
--   and not exists (select 1 from public.tenants t where t.room_id = r.id and t.status = 'active');
