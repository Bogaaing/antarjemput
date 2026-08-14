-- 006_create_payments.sql
-- Table payments (payment receipts and audit)

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
