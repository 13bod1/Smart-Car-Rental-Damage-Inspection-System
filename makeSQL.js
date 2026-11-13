const fs = require('fs');

const makes = ['Toyota', 'Hyundai', 'BMW', 'Mercedes', 'Kia', 'Volkswagen', 'Porsche', 'Tesla', 'Honda', 'Nissan', 'Skoda', 'Peugeot', 'MG', 'Chery', 'Chevrolet', 'Ford', 'Audi', 'Lexus', 'Volvo', 'Jeep'];
const models = {
  Toyota: ['Camry', 'Corolla', 'Yaris', 'Land Cruiser', 'RAV4', 'Hilux', 'Fortuner'],
  Hyundai: ['Elantra', 'Tucson', 'Accent', 'Sonata', 'Santa Fe', 'Creta'],
  BMW: ['X5', 'X3', '3 Series', '5 Series', '7 Series', 'M4'],
  Mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'G-Class', 'Vito'],
  Kia: ['Sportage', 'Cerato', 'Sorento', 'Rio', 'Optima', 'Telluride'],
  Volkswagen: ['Polo', 'Golf', 'Tiguan', 'Passat', 'Touareg'],
  Porsche: ['911', 'Cayenne', 'Panamera', 'Macan', 'Taycan'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  Honda: ['Civic', 'Accord', 'CR-V', 'HR-V'],
  Nissan: ['Sunny', 'Qashqai', 'X-Trail', 'Patrol', 'Altima'],
  Skoda: ['Octavia', 'Superb', 'Kodiaq', 'Karoq'],
  Peugeot: ['3008', '5008', '208', '508'],
  MG: ['ZS', 'HS', 'RX5', 'MG5', 'MG6'],
  Chery: ['Tiggo 8 Pro', 'Tiggo 7 Pro', 'Tiggo 3', 'Arrizo 5'],
  Chevrolet: ['Optra', 'Captiva', 'Malibu', 'Tahoe'],
  Ford: ['Focus', 'Mustang', 'Explorer', 'F-150', 'Escape'],
  Audi: ['A3', 'A4', 'A6', 'Q5', 'Q7', 'Q8'],
  Lexus: ['RX', 'ES', 'LX', 'NX', 'IS'],
  Volvo: ['XC90', 'XC60', 'XC40', 'S90'],
  Jeep: ['Wrangler', 'Grand Cherokee', 'Compass', 'Renegade']
};
const colors = ['Pearl White', 'Phantom Black', 'Midnight Blue', 'Guards Red', 'Graphite Grey', 'Silver Metallic', 'Emerald Green', 'Sunset Orange'];
const categories = ['economy', 'standard', 'luxury', 'suv', 'van'];
const images = [
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1503376760302-861c8c0e668c?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000'
];

let sql = `
# Database Setup: 300 Cars

Run this SQL script in your **Supabase Dashboard -> SQL Editor** to instantly add 300 beautiful cars to your database fleet.

\`\`\`sql
DO $$
DECLARE
  owner_uid UUID;
BEGIN
  SELECT id INTO owner_uid FROM public.profiles WHERE role = 'owner' LIMIT 1;
  IF owner_uid IS NULL THEN
    SELECT id INTO owner_uid FROM public.profiles LIMIT 1;
  END IF;

  INSERT INTO public.vehicles (
    owner_id, make, model, year, color, plate_number, vin,
    category, daily_rate, market_value, security_deposit,
    mileage, status, description, features, thumbnail_url
  )
  VALUES
`;

const values = [];

for (let i = 1; i <= 300; i++) {
  const make = makes[Math.floor(Math.random() * makes.length)];
  const model = models[make][Math.floor(Math.random() * models[make].length)];
  const year = Math.floor(Math.random() * (2025 - 2018 + 1)) + 2018;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const plate = `CAR-${String(i).padStart(4, '0')}`;
  const vin = `1V${Math.random().toString(36).substring(2, 12).toUpperCase()}X90`;
  
  let category = categories[Math.floor(Math.random() * categories.length)];
  if (['X5', 'Q8', 'Cayenne', 'Land Cruiser', 'Tahoe'].includes(model)) category = 'suv';
  if (['Vito', 'Hiace'].includes(model)) category = 'van';
  if (['911', 'S-Class', '7 Series', 'Taycan', 'Panamera'].includes(model)) category = 'luxury';

  const daily_rate = category === 'luxury' ? Math.floor(Math.random() * 2000) + 2000 : 
                     category === 'suv' ? Math.floor(Math.random() * 1000) + 1000 :
                     Math.floor(Math.random() * 500) + 300;
                     
  const market_value = daily_rate * 600;
  const security_deposit = daily_rate * 4;
  const mileage = Math.floor(Math.random() * 80000) + 1000;
  const img = images[Math.floor(Math.random() * images.length)];
  
  const valueStr = `    (owner_uid, '${make}', '${model}', ${year}, '${color}', '${plate}', '${vin}', '${category}', ${daily_rate}, ${market_value}, ${security_deposit}, ${mileage}, 'available', 'A beautiful ${year} ${make} ${model} in ${color}. Perfect for your next trip!', ARRAY['Bluetooth', 'Backup Camera', 'Air Conditioning'], '${img}')`;
  values.push(valueStr);
}

sql += values.join(',\n') + '\n  ON CONFLICT (plate_number) DO NOTHING;\nEND $$;\n```\n';

const outPath = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\ceda83e9-4dec-4d0c-a60a-d7607acebb4b\\Seed_300_Cars.md';
fs.writeFileSync(outPath, sql);
console.log('Saved 300 cars SQL to ' + outPath);
