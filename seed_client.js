const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sjuwebmlknlcyontkdig.supabase.co';
const supabaseKey = 'sb_publishable_YHrvD_0H907jiKJ-lxBprg_LblUp-W9';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Signing up dummy owner...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: 'dummy_owner_' + Date.now() + '@autorent.ai',
    password: 'DemoPassword123!',
  });

  if (authError) {
    console.error("Auth Error:", authError.message);
    return;
  }

  const user = authData.user;
  if (!user) {
    console.error("No user returned. Email confirmation might be required.");
    return;
  }

  console.log("Logged in as:", user.id);

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'owner', full_name: 'Dummy Owner' })
    .eq('id', user.id);
  
  if (profileError) {
    console.error("Profile Error:", profileError.message);
  }

  const vehicles = [
    {
      owner_id: user.id, make: 'Toyota', model: 'Camry', year: 2023, color: 'Pearl White', plate_number: 'ABC-' + Date.now(), vin: '1HGBH41JXMN' + Date.now(),
      category: 'standard', daily_rate: 650, market_value: 420000, security_deposit: 3000, mileage: 12000, status: 'available',
      description: 'Well-maintained 2023 Camry, perfect for city and highway.', features: ['Bluetooth','Backup Camera','Cruise Control','Lane Assist'],
      thumbnail_url: 'https://images.unsplash.com/photo-1621007947382-bb3c399b52c5?auto=format&fit=crop&q=80&w=1000'
    },
    {
      owner_id: user.id, make: 'Hyundai', model: 'Elantra', year: 2022, color: 'Phantom Black', plate_number: 'XYZ-' + Date.now(), vin: '5NPD84LF4NH' + Date.now(),
      category: 'economy', daily_rate: 450, market_value: 320000, security_deposit: 2000, mileage: 25000, status: 'available',
      description: 'Fuel-efficient and reliable, great for daily commutes.', features: ['Bluetooth','USB-C','Heated Seats'],
      thumbnail_url: 'https://images.unsplash.com/photo-1647429188052-a169b15b3644?auto=format&fit=crop&q=80&w=1000'
    },
    {
      owner_id: user.id, make: 'BMW', model: 'X5', year: 2024, color: 'Alpine White', plate_number: 'LMN-' + Date.now(), vin: '5UXCR6C0XN9' + Date.now(),
      category: 'luxury', daily_rate: 2200, market_value: 1800000, security_deposit: 10000, mileage: 5000, status: 'available',
      description: 'Premium SUV with full panoramic roof and M Sport package.', features: ['Heads-Up Display','Panoramic Roof','Harman Kardon','360 Camera','Wireless Charging'],
      thumbnail_url: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&q=80&w=1000'
    },
    {
      owner_id: user.id, make: 'Kia', model: 'Sportage', year: 2023, color: 'Gravity Grey', plate_number: 'PQR-' + Date.now(), vin: 'KNDP63A2XP7' + Date.now(),
      category: 'suv', daily_rate: 850, market_value: 620000, security_deposit: 4000, mileage: 18000, status: 'available',
      description: 'Sporty SUV with great ground clearance and modern interior.', features: ['Apple CarPlay','Android Auto','Blind Spot Monitor','Smart Cruise'],
      thumbnail_url: 'https://images.unsplash.com/photo-1669023030485-573b6ac99761?auto=format&fit=crop&q=80&w=1000'
    },
    {
      owner_id: user.id, make: 'Mercedes', model: 'Vito', year: 2022, color: 'Obsidian Black', plate_number: 'STU-' + Date.now(), vin: 'WDF44770315' + Date.now(),
      category: 'van', daily_rate: 1800, market_value: 1200000, security_deposit: 8000, mileage: 35000, status: 'available',
      description: 'Executive 8-seater van, ideal for group travel and corporate hire.', features: ['Leather Seats','Climate Control','Privacy Glass','USB Ports x6'],
      thumbnail_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000'
    },
    {
      owner_id: user.id, make: 'Porsche', model: '911', year: 2024, color: 'Guards Red', plate_number: 'PRC-' + Date.now(), vin: 'WP0AB2A92PS' + Date.now(),
      category: 'luxury', daily_rate: 4500, market_value: 4500000, security_deposit: 25000, mileage: 1500, status: 'available',
      description: 'Iconic sports car. The ultimate driving experience for your weekend getaway.', features: ['Sport Chrono','PDK','Bose Surround','Carbon Fiber Interior'],
      thumbnail_url: 'https://images.unsplash.com/photo-1503376760302-861c8c0e668c?auto=format&fit=crop&q=80&w=1000'
    },
    {
      owner_id: user.id, make: 'Tesla', model: 'Model 3', year: 2023, color: 'Deep Blue Metallic', plate_number: 'TSL-' + Date.now(), vin: '5YJ3E1EA5NF' + Date.now(),
      category: 'standard', daily_rate: 1200, market_value: 900000, security_deposit: 5000, mileage: 8000, status: 'available',
      description: 'Fully electric sedan with Autopilot. Fast, silent, and zero emissions.', features: ['Autopilot','Premium Connectivity','Glass Roof','Heated Steering Wheel'],
      thumbnail_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000'
    }
  ];

  console.log("Inserting vehicles...");
  const { data, error } = await supabase.from('vehicles').insert(vehicles);
  
  if (error) {
    console.error("Insert Error:", error.message);
  } else {
    console.log("Successfully inserted cars!");
  }
}

seed();
