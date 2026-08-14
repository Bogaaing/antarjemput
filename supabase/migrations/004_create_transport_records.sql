-- 004_create_transport_records.sql
-- Table transport_records (daily transport transaction headers)

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

  -- Unique constraint: 1 user + 1 date = 1 transport record
  CONSTRAINT uq_transport_user_service_date UNIQUE (user_id, service_date)
);

CREATE INDEX IF NOT EXISTS idx_transport_records_user_id ON public.transport_records(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_records_service_date ON public.transport_records(service_date);
CREATE INDEX IF NOT EXISTS idx_transport_records_payment_status ON public.transport_records(payment_status);
