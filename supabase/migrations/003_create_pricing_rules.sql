-- 003_create_pricing_rules.sql
-- Table pricing_rules for configurable rates

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
