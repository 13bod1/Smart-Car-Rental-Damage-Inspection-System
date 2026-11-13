-- ============================================================
-- Seed Data — Vehicle Catalog
-- ============================================================
-- FIX: The vehicles table has a FK: owner_id → profiles.id → auth.users.id
-- So we must insert in order: auth.users → profiles → vehicles
-- We use a DO block so the UUID is consistent throughout.
-- ============================================================

DO $$
DECLARE
  demo_owner_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

  -- 1. Insert demo owner into auth.users (only if not already present)
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  VALUES (
    demo_owner_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo-owner@autorent.ai',
    -- bcrypt hash of 'DemoPassword123!' — NOT a real user, seed-only
    '$2a$10$PgfEPMjZfVBQGPGJiV0P8.5Tx6KtBcqE2JO0/6s6T2JHO1NTuOd7a',
    NOW(),
    '{"full_name": "Demo Fleet Owner", "role": "owner"}'::jsonb,
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Insert demo profile (the handle_new_user trigger may not fire for manual inserts)
  INSERT INTO public.profiles (id, role, full_name, kyc_verified)
  VALUES (demo_owner_id, 'owner', 'Demo Fleet Owner', TRUE)
  ON CONFLICT (id) DO NOTHING;

END $$;

-- ============================================================
-- 3. Seed Vehicles (now safe — owner profile exists)
-- ============================================================
INSERT INTO public.vehicles (
  owner_id, make, model, year, color, plate_number, vin,
  category, daily_rate, market_value, security_deposit,
  mileage, status, description, features, thumbnail_url
)
VALUES
  ('00000000-0000-0000-0000-000000000001','Toyota','Camry',2023,'Pearl White','ABC-1234','1HGBH41JXMN109186',
   'standard',650,420000,3000,12000,'available',
   'Well-maintained 2023 Camry, perfect for city and highway.',
   ARRAY['Bluetooth','Backup Camera','Cruise Control','Lane Assist'],
   'https://images.unsplash.com/photo-1621007947382-bb3c399b52c5?auto=format&fit=crop&q=80&w=1000'),

  ('00000000-0000-0000-0000-000000000001','Hyundai','Elantra',2022,'Phantom Black','XYZ-5678','5NPD84LF4NH123456',
   'economy',450,320000,2000,25000,'available',
   'Fuel-efficient and reliable, great for daily commutes.',
   ARRAY['Bluetooth','USB-C','Heated Seats'],
   'https://images.unsplash.com/photo-1647429188052-a169b15b3644?auto=format&fit=crop&q=80&w=1000'),

  ('00000000-0000-0000-0000-000000000001','BMW','X5',2024,'Alpine White','LMN-9012','5UXCR6C0XN9M12345',
   'luxury',2200,1800000,10000,5000,'available',
   'Premium SUV with full panoramic roof and M Sport package.',
   ARRAY['Heads-Up Display','Panoramic Roof','Harman Kardon','360 Camera','Wireless Charging'],
   'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&q=80&w=1000'),

  ('00000000-0000-0000-0000-000000000001','Kia','Sportage',2023,'Gravity Grey','PQR-3456','KNDP63A2XP7123456',
   'suv',850,620000,4000,18000,'available',
   'Sporty SUV with great ground clearance and modern interior.',
   ARRAY['Apple CarPlay','Android Auto','Blind Spot Monitor','Smart Cruise'],
   'https://images.unsplash.com/photo-1669023030485-573b6ac99761?auto=format&fit=crop&q=80&w=1000'),

  ('00000000-0000-0000-0000-000000000001','Mercedes','Vito',2022,'Obsidian Black','STU-7890','WDF44770315123456',
   'van',1800,1200000,8000,35000,'available',
   'Executive 8-seater van, ideal for group travel and corporate hire.',
   ARRAY['Leather Seats','Climate Control','Privacy Glass','USB Ports x6'],
   'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000'),

  ('00000000-0000-0000-0000-000000000001','Volkswagen','Polo',2023,'Reflex Silver','VWX-1122','WVWZZZ6RZPY123456',
   'economy',380,280000,1500,9000,'available',
   'Compact and nimble, perfect for urban driving.',
   ARRAY['Bluetooth','Rear Sensors','Digital Cockpit'],
   'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?auto=format&fit=crop&q=80&w=1000'),

  ('00000000-0000-0000-0000-000000000001','Toyota','Land Cruiser',2024,'Midnight Black','YZA-3344','JTMCY7AJ5P4123456',
   'suv',3500,3200000,15000,2000,'available',
   'Legendary off-road capability with ultra-premium interior.',
   ARRAY['4WD Lock','Air Suspension','JBL Sound','HUD','Night Vision'],
   'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=1000'),

  ('00000000-0000-0000-0000-000000000001','Porsche','911',2024,'Guards Red','PRC-9999','WP0AB2A92PS223456',
   'luxury',4500,4500000,25000,1500,'available',
   'Iconic sports car. The ultimate driving experience for your weekend getaway.',
   ARRAY['Sport Chrono','PDK','Bose Surround','Carbon Fiber Interior'],
   'https://images.unsplash.com/photo-1503376760302-861c8c0e668c?auto=format&fit=crop&q=80&w=1000'),

  ('00000000-0000-0000-0000-000000000001','Tesla','Model 3',2023,'Deep Blue Metallic','TSL-3333','5YJ3E1EA5NF223456',
   'standard',1200,900000,5000,8000,'available',
   'Fully electric sedan with Autopilot. Fast, silent, and zero emissions.',
   ARRAY['Autopilot','Premium Connectivity','Glass Roof','Heated Steering Wheel'],
   'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000')

ON CONFLICT (plate_number) DO NOTHING;

-- ============================================================
-- 4. Market Valuation Reference Table + Seed
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vehicle_market_values (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make          TEXT NOT NULL,
  model         TEXT NOT NULL,
  year          INTEGER NOT NULL,
  market_value  NUMERIC(12,2),
  daily_rate    NUMERIC(10,2),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(make, model, year)
);

INSERT INTO public.vehicle_market_values (make, model, year, market_value, daily_rate)
VALUES
  ('Toyota','Camry',2023,420000,650),
  ('Toyota','Camry',2022,380000,600),
  ('Toyota','Land Cruiser',2024,3200000,3500),
  ('Toyota','Land Cruiser',2023,2900000,3200),
  ('Hyundai','Elantra',2022,320000,450),
  ('Hyundai','Elantra',2023,360000,490),
  ('Hyundai','Tucson',2023,580000,800),
  ('BMW','X5',2024,1800000,2200),
  ('BMW','3 Series',2023,1200000,1500),
  ('Mercedes','C Class',2023,1400000,1800),
  ('Mercedes','Vito',2022,1200000,1800),
  ('Kia','Sportage',2023,620000,850),
  ('Kia','Cerato',2023,390000,520),
  ('Volkswagen','Polo',2023,280000,380),
  ('Volkswagen','Tiguan',2023,750000,950),
  ('Honda','Civic',2023,430000,600),
  ('Honda','HR-V',2023,520000,720)
ON CONFLICT (make, model, year) DO NOTHING;
