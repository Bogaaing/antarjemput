-- 002_create_children.sql
-- Table children for family members

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
