-- 001_create_profiles.sql
-- Profiles table linked to Supabase auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Orang Tua',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to auto-create profile on user sign up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'Orang Tua',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCYdEa71V6z5oW_P9U4L03y16dJ3-y0U5N3fK9A9g1m=s96-c'
  );
  
  -- Create initial default pricing rule for this new user
  INSERT INTO public.pricing_rules (user_id, name, base_round_trip, different_pickup_fee, effective_from, is_active, description)
  VALUES (
    new.id,
    'Tarif Standar',
    50000,
    15000,
    CURRENT_DATE,
    true,
    'Tarif dasar PP Rp50.000 + Tambahan beda jam jemput Rp15.000'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
