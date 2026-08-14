-- 005_create_transport_items.sql
-- Table transport_items (daily transport line items per child)

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
