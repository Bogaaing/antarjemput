-- ==============================================================================
-- ANTARJEMPUTKU - SUPABASE POSTGRESQL COMPLETE DATABASE SCHEMA
-- Compatible with Supabase PostgreSQL, DBeaver, and Supabase Auth
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Orang Tua',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Children Table
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  birth_order TEXT DEFAULT 'Kakak',
  default_pickup TEXT NOT NULL DEFAULT '07:00',
  default_dropoff TEXT NOT NULL DEFAULT '12:00',
  school TEXT DEFAULT 'SD Al-fath Bsd',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_children_user_id ON public.children(user_id);
CREATE INDEX IF NOT EXISTS idx_children_is_active ON public.children(is_active);

-- 3. Pricing Rules Table
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Tarif Standar' NOT NULL,
  base_round_trip NUMERIC(12, 2) NOT NULL DEFAULT 50000,
  different_pickup_fee NUMERIC(12, 2) NOT NULL DEFAULT 15000,
  effective_from DATE DEFAULT CURRENT_DATE NOT NULL,
  effective_until DATE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_user_id ON public.pricing_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_is_active ON public.pricing_rules(is_active);

-- 4. Transport Records Table
CREATE TABLE IF NOT EXISTS public.transport_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  shared_pickup_time TEXT DEFAULT '07:00' NOT NULL,
  base_fee NUMERIC(12, 2) NOT NULL DEFAULT 50000,
  additional_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_fee NUMERIC(12, 2) NOT NULL DEFAULT 50000,
  pricing_rule_id UUID REFERENCES public.pricing_rules(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'scheduled', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  has_different_dropoff BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT uq_transport_user_service_date UNIQUE (user_id, service_date)
);

CREATE INDEX IF NOT EXISTS idx_transport_records_user_id ON public.transport_records(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_records_service_date ON public.transport_records(service_date);
CREATE INDEX IF NOT EXISTS idx_transport_records_payment_status ON public.transport_records(payment_status);

-- 5. Transport Items Table
CREATE TABLE IF NOT EXISTS public.transport_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transport_record_id UUID NOT NULL REFERENCES public.transport_records(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  pickup_time TEXT NOT NULL,
  dropoff_time TEXT NOT NULL,
  is_attending BOOLEAN NOT NULL DEFAULT true,
  item_fee NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transport_items_record_id ON public.transport_items(transport_record_id);
CREATE INDEX IF NOT EXISTS idx_transport_items_child_id ON public.transport_items(child_id);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transport_record_id UUID REFERENCES public.transport_records(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'unpaid', 'pending')),
  paid_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  payment_method TEXT DEFAULT 'Transfer BCA / Tunai',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_record_id ON public.payments(transport_record_id);

-- ==============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Children Policies
DROP POLICY IF EXISTS "Users can select own children" ON public.children;
CREATE POLICY "Users can select own children" ON public.children FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own children" ON public.children;
CREATE POLICY "Users can insert own children" ON public.children FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own children" ON public.children;
CREATE POLICY "Users can update own children" ON public.children FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own children" ON public.children;
CREATE POLICY "Users can delete own children" ON public.children FOR DELETE USING (auth.uid() = user_id);

-- Pricing Rules Policies
DROP POLICY IF EXISTS "Users can select own pricing rules" ON public.pricing_rules;
CREATE POLICY "Users can select own pricing rules" ON public.pricing_rules FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own pricing rules" ON public.pricing_rules;
CREATE POLICY "Users can insert own pricing rules" ON public.pricing_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own pricing rules" ON public.pricing_rules;
CREATE POLICY "Users can update own pricing rules" ON public.pricing_rules FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own pricing rules" ON public.pricing_rules;
CREATE POLICY "Users can delete own pricing rules" ON public.pricing_rules FOR DELETE USING (auth.uid() = user_id);

-- Transport Records Policies
DROP POLICY IF EXISTS "Users can select own transport records" ON public.transport_records;
CREATE POLICY "Users can select own transport records" ON public.transport_records FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own transport records" ON public.transport_records;
CREATE POLICY "Users can insert own transport records" ON public.transport_records FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own transport records" ON public.transport_records;
CREATE POLICY "Users can update own transport records" ON public.transport_records FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own transport records" ON public.transport_records;
CREATE POLICY "Users can delete own transport records" ON public.transport_records FOR DELETE USING (auth.uid() = user_id);

-- Transport Items Policies
DROP POLICY IF EXISTS "Users can select own transport items" ON public.transport_items;
CREATE POLICY "Users can select own transport items" ON public.transport_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.transport_records
    WHERE public.transport_records.id = public.transport_items.transport_record_id
    AND public.transport_records.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Users can insert own transport items" ON public.transport_items;
CREATE POLICY "Users can insert own transport items" ON public.transport_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.transport_records
    WHERE public.transport_records.id = public.transport_items.transport_record_id
    AND public.transport_records.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Users can update own transport items" ON public.transport_items;
CREATE POLICY "Users can update own transport items" ON public.transport_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.transport_records
    WHERE public.transport_records.id = public.transport_items.transport_record_id
    AND public.transport_records.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS "Users can delete own transport items" ON public.transport_items;
CREATE POLICY "Users can delete own transport items" ON public.transport_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.transport_records
    WHERE public.transport_records.id = public.transport_items.transport_record_id
    AND public.transport_records.user_id = auth.uid()
  )
);

-- Payments Policies
DROP POLICY IF EXISTS "Users can select own payments" ON public.payments;
CREATE POLICY "Users can select own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
CREATE POLICY "Users can update own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;
CREATE POLICY "Users can delete own payments" ON public.payments FOR DELETE USING (auth.uid() = user_id);

-- Auto User Initialization Trigger
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
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.pricing_rules (user_id, name, base_round_trip, different_pickup_fee, effective_from, is_active, description)
  VALUES (
    new.id,
    'Tarif Standar',
    50000,
    15000,
    CURRENT_DATE,
    true,
    'Tarif dasar PP Rp50.000 + Tambahan beda jam jemput Rp15.000'
  )
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
