-- 007_enable_rls.sql
-- Enable Row Level Security (RLS) and define secure per-user policies

-- 1. Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- 2. Children
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own children" ON public.children;
CREATE POLICY "Users can select own children"
  ON public.children FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own children" ON public.children;
CREATE POLICY "Users can insert own children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own children" ON public.children;
CREATE POLICY "Users can update own children"
  ON public.children FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own children" ON public.children;
CREATE POLICY "Users can delete own children"
  ON public.children FOR DELETE
  USING (auth.uid() = user_id);


-- 3. Pricing Rules
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own pricing rules" ON public.pricing_rules;
CREATE POLICY "Users can select own pricing rules"
  ON public.pricing_rules FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own pricing rules" ON public.pricing_rules;
CREATE POLICY "Users can insert own pricing rules"
  ON public.pricing_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own pricing rules" ON public.pricing_rules;
CREATE POLICY "Users can update own pricing rules"
  ON public.pricing_rules FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own pricing rules" ON public.pricing_rules;
CREATE POLICY "Users can delete own pricing rules"
  ON public.pricing_rules FOR DELETE
  USING (auth.uid() = user_id);


-- 4. Transport Records
ALTER TABLE public.transport_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own transport records" ON public.transport_records;
CREATE POLICY "Users can select own transport records"
  ON public.transport_records FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transport records" ON public.transport_records;
CREATE POLICY "Users can insert own transport records"
  ON public.transport_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transport records" ON public.transport_records;
CREATE POLICY "Users can update own transport records"
  ON public.transport_records FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transport records" ON public.transport_records;
CREATE POLICY "Users can delete own transport records"
  ON public.transport_records FOR DELETE
  USING (auth.uid() = user_id);


-- 5. Transport Items (Secured via parent transport_records ownership)
ALTER TABLE public.transport_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own transport items" ON public.transport_items;
CREATE POLICY "Users can select own transport items"
  ON public.transport_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.transport_records
      WHERE public.transport_records.id = public.transport_items.transport_record_id
      AND public.transport_records.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own transport items" ON public.transport_items;
CREATE POLICY "Users can insert own transport items"
  ON public.transport_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transport_records
      WHERE public.transport_records.id = public.transport_items.transport_record_id
      AND public.transport_records.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own transport items" ON public.transport_items;
CREATE POLICY "Users can update own transport items"
  ON public.transport_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.transport_records
      WHERE public.transport_records.id = public.transport_items.transport_record_id
      AND public.transport_records.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own transport items" ON public.transport_items;
CREATE POLICY "Users can delete own transport items"
  ON public.transport_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.transport_records
      WHERE public.transport_records.id = public.transport_items.transport_record_id
      AND public.transport_records.user_id = auth.uid()
    )
  );


-- 6. Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can select own payments" ON public.payments;
CREATE POLICY "Users can select own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
CREATE POLICY "Users can update own payments"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;
CREATE POLICY "Users can delete own payments"
  ON public.payments FOR DELETE
  USING (auth.uid() = user_id);
