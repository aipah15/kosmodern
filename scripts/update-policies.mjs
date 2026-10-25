import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mpaandya15.@db.cppvsvyenlutkyinawmg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function updatePolicies() {
  await client.connect();
  console.log('Connected to Supabase. Updating policies and triggers...');

  await client.query(`
    -- 1. Policy for inserting profile by authenticated user
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      TO authenticated
      WITH CHECK ((select auth.uid()) = id);

    -- 2. Policy for updating invitation code when claimed
    DROP POLICY IF EXISTS "Allow claiming invitation code" ON public.invitations;
    CREATE POLICY "Allow claiming invitation code"
      ON public.invitations FOR UPDATE
      TO anon, authenticated
      USING (is_used = false)
      WITH CHECK (is_used = true);

    -- 3. Policy for reading rooms by anon (calon penghuni yang belum login)
    DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
    DROP POLICY IF EXISTS "Anyone authenticated can view rooms" ON public.rooms;
    CREATE POLICY "Anyone can view rooms"
      ON public.rooms FOR SELECT
      TO anon, authenticated
      USING (true);

    -- 4. Enable automatic profile creation on user sign up via Postgres Trigger
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.profiles (id, full_name, phone, role)
      VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'phone', new.phone),
        coalesce(new.raw_user_meta_data->>'role', 'tenant')
      )
      ON CONFLICT (id) DO UPDATE
      SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone;
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `);

  console.log('Database policies and trigger for new users updated successfully!');
  await client.end();
}

updatePolicies().catch(err => {
  console.error('Update policies error:', err);
  process.exit(1);
});
