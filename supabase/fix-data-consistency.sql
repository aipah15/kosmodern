-- Rapikan data tidak konsisten hasil audit. Jalankan di Supabase SQL Editor setelah dibaca.

-- 1. Label lantai kamar: "Lantai 3 • Sudut Tenang" menjadi "Lantai 3"
update public.rooms set floor = split_part(floor, ' • ', 1) where floor like '% • %';

-- 2. Tagihan yatim (tidak tertaut ke penghuni mana pun): "Fitriah Ramadhani" dan "Sarah S".
--    Periksa dulu, lalu hapus jika memang data contoh:
--    select invoice_number, tenant_name, status from public.bills where tenant_id is null;
-- delete from public.bills where tenant_id is null;

-- 3. Segarkan salinan data penghuni di tagihan agar sama dengan tabel tenants
update public.bills b
set tenant_name = t.full_name, tenant_code = t.tenant_code, tenant_phone = t.phone,
    room_number = t.room_number, floor = t.floor
from public.tenants t
where b.tenant_id = t.id;
