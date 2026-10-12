import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const CARS = [
  {
    make: 'Toyota', model: 'Camry', year: 2023, color: 'Pearl White', plate_number: 'ABC-1234', vin: '1HGBH41JXMN109186',
    category: 'standard', daily_rate: 650, market_value: 420000, security_deposit: 3000, mileage: 12000, status: 'available',
    description: 'Well-maintained 2023 Camry, perfect for city and highway.', features: ['Bluetooth','Backup Camera','Cruise Control','Lane Assist'],
    thumbnail_url: 'https://images.unsplash.com/photo-1621007947382-bb3c399b52c5?auto=format&fit=crop&q=80&w=1000'
  },
  {
    make: 'Hyundai', model: 'Elantra', year: 2022, color: 'Phantom Black', plate_number: 'XYZ-5678', vin: '5NPD84LF4NH123456',
    category: 'economy', daily_rate: 450, market_value: 320000, security_deposit: 2000, mileage: 25000, status: 'available',
    description: 'Fuel-efficient and reliable, great for daily commutes.', features: ['Bluetooth','USB-C','Heated Seats'],
    thumbnail_url: 'https://images.unsplash.com/photo-1647429188052-a169b15b3644?auto=format&fit=crop&q=80&w=1000'
  },
  {
    make: 'BMW', model: 'X5', year: 2024, color: 'Alpine White', plate_number: 'LMN-9012', vin: '5UXCR6C0XN9M12345',
    category: 'luxury', daily_rate: 2200, market_value: 1800000, security_deposit: 10000, mileage: 5000, status: 'available',
    description: 'Premium SUV with full panoramic roof and M Sport package.', features: ['Heads-Up Display','Panoramic Roof','Harman Kardon','360 Camera','Wireless Charging'],
    thumbnail_url: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&q=80&w=1000'
  },
  {
    make: 'Kia', model: 'Sportage', year: 2023, color: 'Gravity Grey', plate_number: 'PQR-3456', vin: 'KNDP63A2XP7123456',
    category: 'suv', daily_rate: 850, market_value: 620000, security_deposit: 4000, mileage: 18000, status: 'available',
    description: 'Sporty SUV with great ground clearance and modern interior.', features: ['Apple CarPlay','Android Auto','Blind Spot Monitor','Smart Cruise'],
    thumbnail_url: 'https://images.unsplash.com/photo-1669023030485-573b6ac99761?auto=format&fit=crop&q=80&w=1000'
  },
  {
    make: 'Mercedes', model: 'Vito', year: 2022, color: 'Obsidian Black', plate_number: 'STU-7890', vin: 'WDF44770315123456',
    category: 'van', daily_rate: 1800, market_value: 1200000, security_deposit: 8000, mileage: 35000, status: 'available',
    description: 'Executive 8-seater van, ideal for group travel and corporate hire.', features: ['Leather Seats','Climate Control','Privacy Glass','USB Ports x6'],
    thumbnail_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000'
  },
  {
    make: 'Volkswagen', model: 'Polo', year: 2023, color: 'Reflex Silver', plate_number: 'VWX-1122', vin: 'WVWZZZ6RZPY123456',
    category: 'economy', daily_rate: 380, market_value: 280000, security_deposit: 1500, mileage: 9000, status: 'available',
    description: 'Compact and nimble, perfect for urban driving.', features: ['Bluetooth','Rear Sensors','Digital Cockpit'],
    thumbnail_url: 'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?auto=format&fit=crop&q=80&w=1000'
  },
  {
    make: 'Toyota', model: 'Land Cruiser', year: 2024, color: 'Midnight Black', plate_number: 'YZA-3344', vin: 'JTMCY7AJ5P4123456',
    category: 'suv', daily_rate: 3500, market_value: 3200000, security_deposit: 15000, mileage: 2000, status: 'available',
    description: 'Legendary off-road capability with ultra-premium interior.', features: ['4WD Lock','Air Suspension','JBL Sound','HUD','Night Vision'],
    thumbnail_url: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=1000'
  },
  {
    make: 'Porsche', model: '911', year: 2024, color: 'Guards Red', plate_number: 'PRC-9999', vin: 'WP0AB2A92PS223456',
    category: 'luxury', daily_rate: 4500, market_value: 4500000, security_deposit: 25000, mileage: 1500, status: 'available',
    description: 'Iconic sports car. The ultimate driving experience for your weekend getaway.', features: ['Sport Chrono','PDK','Bose Surround','Carbon Fiber Interior'],
    thumbnail_url: 'https://images.unsplash.com/photo-1503376760302-861c8c0e668c?auto=format&fit=crop&q=80&w=1000'
  },
  {
    make: 'Tesla', model: 'Model 3', year: 2023, color: 'Deep Blue Metallic', plate_number: 'TSL-3333', vin: '5YJ3E1EA5NF223456',
    category: 'standard', daily_rate: 1200, market_value: 900000, security_deposit: 5000, mileage: 8000, status: 'available',
    description: 'Fully electric sedan with Autopilot. Fast, silent, and zero emissions.', features: ['Autopilot','Premium Connectivity','Glass Roof','Heated Steering Wheel'],
    thumbnail_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000'
  }
];

async function seed() {
  console.log('Fetching an owner ID...');
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id').eq('role', 'owner').limit(1);
  
  if (pErr) {
    console.error('Error fetching profile:', pErr);
    return;
  }
  
  let ownerId = profiles?.[0]?.id;
  
  if (!ownerId) {
    console.log('No owner found! Fetching ANY profile ID...');
    const { data: anyProfile } = await supabase.from('profiles').select('id').limit(1);
    ownerId = anyProfile?.[0]?.id;
    if (!ownerId) {
       console.error('Database has zero profiles! Please create an account first.');
       return;
    }
  }
  
  console.log(`Using owner_id: ${ownerId}`);
  
  for (const car of CARS) {
    console.log(`Inserting ${car.make} ${car.model}...`);
    const { error } = await supabase.from('vehicles').insert({
      ...car,
      owner_id: ownerId
    });
    
    if (error) {
       if (error.code === '23505') {
         console.log(`  -> Already exists (skipping plate ${car.plate_number})`);
       } else {
         console.error(`  -> Failed:`, error);
       }
    } else {
       console.log(`  -> Inserted!`);
    }
  }
  
  console.log('Done seeding cars!');
}

seed();
