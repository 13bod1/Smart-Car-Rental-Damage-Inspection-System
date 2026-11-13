-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valuations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE POLICY "Anyone can view available vehicles"
  ON public.vehicles FOR SELECT USING (status = 'available');

CREATE POLICY "Owners can view own fleet"
  ON public.vehicles FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own vehicles"
  ON public.vehicles FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete own vehicles"
  ON public.vehicles FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- VEHICLE PHOTOS
-- ============================================================
CREATE POLICY "Involved parties can view photos"
  ON public.vehicle_photos FOR SELECT
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.rentals r
      WHERE r.id = vehicle_photos.rental_id
        AND (r.renter_id = auth.uid() OR r.owner_id = auth.uid())
    )
  );

CREATE POLICY "Involved parties can upload photos"
  ON public.vehicle_photos FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- ============================================================
-- RENTALS
-- ============================================================
CREATE POLICY "Renters can view own rentals"
  ON public.rentals FOR SELECT USING (renter_id = auth.uid());

CREATE POLICY "Owners can view their vehicle rentals"
  ON public.rentals FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Renters can create rentals"
  ON public.rentals FOR INSERT
  WITH CHECK (renter_id = auth.uid());

CREATE POLICY "Involved parties can update rentals"
  ON public.rentals FOR UPDATE
  USING (renter_id = auth.uid() OR owner_id = auth.uid());

-- ============================================================
-- AI DAMAGE REPORTS
-- ============================================================
CREATE POLICY "Involved parties can view damage reports"
  ON public.ai_damage_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rentals r
      WHERE r.id = ai_damage_reports.rental_id
        AND (r.renter_id = auth.uid() OR r.owner_id = auth.uid())
    )
  );

-- ============================================================
-- VALUATIONS
-- ============================================================
CREATE POLICY "Users can view own valuations"
  ON public.valuations FOR SELECT USING (requested_by = auth.uid());

CREATE POLICY "Users can insert valuations"
  ON public.valuations FOR INSERT WITH CHECK (requested_by = auth.uid() OR requested_by IS NULL);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET POLICIES (run after creating buckets)
-- ============================================================
-- Create buckets via Supabase dashboard or CLI:
--   supabase storage create vehicle-photos --public=false
--   supabase storage create temp-valuation  --public=false
--   supabase storage create avatars         --public=true

-- Bucket policy: only authenticated users upload to vehicle-photos
-- (Set in Supabase dashboard under Storage > Policies)
