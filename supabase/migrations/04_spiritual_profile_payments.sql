-- Spiritual program: profile religion + booking payments

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS religion TEXT;

ALTER TABLE public.telehealth_bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS amount_etb INTEGER,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS amount_etb INTEGER,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
