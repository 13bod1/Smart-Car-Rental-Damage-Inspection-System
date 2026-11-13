-- ============================================================
-- Smart Car Rental — Supabase PostgreSQL Schema
-- Run these in order via Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('renter', 'owner', 'admin')) DEFAULT 'renter',
  full_name     TEXT,
  phone         TEXT,
  national_id   TEXT,
  license_url   TEXT,        -- Supabase Storage URL
  avatar_url    TEXT,
  kyc_verified  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. VEHICLES
-- ============================================================
CREATE TABLE public.vehicles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  make            TEXT NOT NULL,
  model           TEXT NOT NULL,
  year            INTEGER NOT NULL,
  color           TEXT,
  plate_number    TEXT UNIQUE NOT NULL,
  vin             TEXT UNIQUE,
  category        TEXT CHECK (category IN ('economy','standard','luxury','suv','van')) DEFAULT 'standard',
  daily_rate      NUMERIC(10,2) NOT NULL,
  market_value    NUMERIC(12,2),
  security_deposit NUMERIC(10,2) NOT NULL DEFAULT 1000,
  mileage         INTEGER DEFAULT 0,
  status          TEXT CHECK (status IN ('available','rented','maintenance','inactive')) DEFAULT 'available',
  description     TEXT,
  features        TEXT[],
  thumbnail_url   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. VEHICLE PHOTOS (before/after rental)
-- ============================================================
CREATE TABLE public.vehicle_photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id  UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  rental_id   UUID,           -- NULL = baseline photo
  phase       TEXT NOT NULL CHECK (phase IN ('baseline','pre_rental','post_rental')),
  angle       TEXT CHECK (angle IN ('front','rear','left','right','interior','other')),
  storage_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. RENTALS / CONTRACTS
-- ============================================================
CREATE TABLE public.rentals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id        UUID NOT NULL REFERENCES public.vehicles(id),
  renter_id         UUID NOT NULL REFERENCES public.profiles(id),
  owner_id          UUID NOT NULL REFERENCES public.profiles(id),
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  actual_return_at  TIMESTAMPTZ,
  pickup_mileage    INTEGER,
  return_mileage    INTEGER,
  daily_rate        NUMERIC(10,2) NOT NULL,
  total_days        INTEGER GENERATED ALWAYS AS (end_date - start_date) STORED,
  subtotal          NUMERIC(10,2),
  security_deposit  NUMERIC(10,2) NOT NULL,
  deposit_status    TEXT CHECK (deposit_status IN ('held','partial_refund','full_refund','confiscated')) DEFAULT 'held',
  deposit_deduction NUMERIC(10,2) DEFAULT 0,
  status            TEXT CHECK (status IN ('pending','active','completed','cancelled','disputed')) DEFAULT 'pending',
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Back-ref: vehicle_photos → rentals
ALTER TABLE public.vehicle_photos
  ADD CONSTRAINT fk_rental FOREIGN KEY (rental_id) REFERENCES public.rentals(id) ON DELETE SET NULL;

-- ============================================================
-- 5. AI DAMAGE REPORTS
-- ============================================================
CREATE TABLE public.ai_damage_reports (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id           UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  vehicle_id          UUID NOT NULL REFERENCES public.vehicles(id),
  status              TEXT CHECK (status IN ('pending','processing','completed','failed')) DEFAULT 'pending',
  damage_detected     BOOLEAN,
  severity            TEXT CHECK (severity IN ('none','minor','moderate','severe')),
  damage_zones        JSONB,         -- e.g. {"rear_bumper": "scratch", "hood": "dent"}
  confidence_score    NUMERIC(5,4),  -- 0.0000 - 1.0000
  estimated_cost_egp  NUMERIC(10,2) DEFAULT 0,
  strategy_applied    TEXT CHECK (strategy_applied IN ('full_refund','partial_deduction','full_confiscation')),
  raw_model_output    JSONB,
  processed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. VALUATION CACHE (Snap & Identify)
-- ============================================================
CREATE TABLE public.valuations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requested_by    UUID REFERENCES public.profiles(id),
  image_url       TEXT NOT NULL,
  identified_make TEXT,
  identified_model TEXT,
  identified_year INTEGER,
  market_value_egp NUMERIC(12,2),
  daily_rate_egp   NUMERIC(10,2),
  confidence_score NUMERIC(5,4),
  raw_output      JSONB,
  session_id      TEXT,             -- anonymous sessions
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TRANSACTIONS
-- ============================================================
CREATE TABLE public.transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id       UUID REFERENCES public.rentals(id),
  payer_id        UUID REFERENCES public.profiles(id),
  payee_id        UUID REFERENCES public.profiles(id),
  type            TEXT CHECK (type IN ('rental_payment','deposit_hold','deposit_refund','deposit_deduction','platform_fee')) NOT NULL,
  amount_egp      NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'EGP',
  status          TEXT CHECK (status IN ('pending','success','failed','reversed')) DEFAULT 'pending',
  gateway_ref     TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_vehicles_owner     ON public.vehicles(owner_id);
CREATE INDEX idx_vehicles_status    ON public.vehicles(status);
CREATE INDEX idx_rentals_vehicle    ON public.rentals(vehicle_id);
CREATE INDEX idx_rentals_renter     ON public.rentals(renter_id);
CREATE INDEX idx_rentals_status     ON public.rentals(status);
CREATE INDEX idx_ai_reports_rental  ON public.ai_damage_reports(rental_id);
CREATE INDEX idx_photos_rental      ON public.vehicle_photos(rental_id);
CREATE INDEX idx_transactions_rental ON public.transactions(rental_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at   BEFORE UPDATE ON public.profiles   FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_vehicles_updated_at   BEFORE UPDATE ON public.vehicles   FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_rentals_updated_at    BEFORE UPDATE ON public.rentals    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
