require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const http = require('http');
const { S3Client, PutObjectCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 80;

// Configuration from Environment Variables
const DB_DIALECT = (process.env.DB_DIALECT || 'mysql').toLowerCase();
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || (DB_DIALECT === 'postgres' ? '5432' : '3306'));
const DB_USER = process.env.DB_USER || 'admin';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Password123!';
const DB_NAME = process.env.DB_NAME || 'car_rental_db';

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET || 'smart-car-rental-assets';

// Setup View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// S3 Client (IAM Role on EC2 handles auth automatically)
const s3Config = { region: AWS_REGION };
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN || undefined
  };
}
const s3Client = new S3Client(s3Config);

// Multer memory storage for direct S3 upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Database Abstraction (Supports both RDS MySQL and RDS PostgreSQL)
let dbPool = null;
let dbStatus = { connected: false, message: 'Initializing...', engine: DB_DIALECT };

async function initDatabase() {
  try {
    if (DB_DIALECT === 'postgres') {
      dbPool = new Pool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000
      });

      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS cars (
          id SERIAL PRIMARY KEY,
          make VARCHAR(100) NOT NULL,
          model VARCHAR(100) NOT NULL,
          year INT NOT NULL,
          category VARCHAR(50) NOT NULL,
          daily_rate NUMERIC(10, 2) NOT NULL,
          description TEXT,
          image_url VARCHAR(1000),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const res = await dbPool.query('SELECT COUNT(*) FROM cars');
      if (parseInt(res.rows[0].count) === 0) {
        await seedDatabase();
      }
    } else {
      // Default to MySQL
      dbPool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        connectTimeout: 5000
      });

      await dbPool.query(`
        CREATE TABLE IF NOT EXISTS cars (
          id INT AUTO_INCREMENT PRIMARY KEY,
          make VARCHAR(100) NOT NULL,
          model VARCHAR(100) NOT NULL,
          year INT NOT NULL,
          category VARCHAR(50) NOT NULL,
          daily_rate DECIMAL(10, 2) NOT NULL,
          description TEXT,
          image_url VARCHAR(1000),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const [rows] = await dbPool.query('SELECT COUNT(*) as count FROM cars');
      if (rows[0].count === 0) {
        await seedDatabase();
      }
    }

    dbStatus = { connected: true, message: `Connected to Amazon RDS (${DB_DIALECT.toUpperCase()})`, engine: DB_DIALECT };
    console.log(`[RDS] Successfully connected to database at ${DB_HOST}`);
  } catch (err) {
    dbStatus = { connected: false, message: err.message, engine: DB_DIALECT };
    console.warn(`[RDS] Database connection notice: ${err.message}`);
  }
}

async function seedDatabase() {
  const initialCars = [
    {
      make: 'Tesla',
      model: 'Model 3 Performance',
      year: 2024,
      category: 'Electric',
      daily_rate: 95.00,
      description: 'Zero emissions, rapid acceleration, cutting-edge autopilot features.',
      image_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80'
    },
    {
      make: 'BMW',
      model: 'M4 Competition',
      year: 2023,
      category: 'Sports',
      daily_rate: 150.00,
      description: 'Twin-turbo inline-six producing 503 horsepower with M xDrive precision.',
      image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop&q=80'
    },
    {
      make: 'Mercedes-Benz',
      model: 'G-Class G63 AMG',
      year: 2024,
      category: 'SUV',
      daily_rate: 220.00,
      description: 'Iconic luxury off-roader with handcrafted AMG 4.0L V8 biturbo engine.',
      image_url: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?w=800&auto=format&fit=crop&q=80'
    },
    {
      make: 'Porsche',
      model: 'Taycan 4S',
      year: 2024,
      category: 'Electric',
      daily_rate: 180.00,
      description: 'Futuristic electric sports sedan combining high performance with unmatched elegance.',
      image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80'
    }
  ];

  for (const car of initialCars) {
    if (DB_DIALECT === 'postgres') {
      await dbPool.query(
        'INSERT INTO cars (make, model, year, category, daily_rate, description, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [car.make, car.model, car.year, car.category, car.daily_rate, car.description, car.image_url]
      );
    } else {
      await dbPool.query(
        'INSERT INTO cars (make, model, year, category, daily_rate, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [car.make, car.model, car.year, car.category, car.daily_rate, car.description, car.image_url]
      );
    }
  }
  console.log('[RDS] Seed data inserted successfully');
}

// Helper to query cars
async function getAllCars(categoryFilter = null) {
  if (!dbPool || !dbStatus.connected) {
    // If DB is offline, return fallback list so website still renders
    return [
      {
        id: 1,
        make: 'Tesla',
        model: 'Model 3 (Sample)',
        year: 2024,
        category: 'Electric',
        daily_rate: 95.00,
        description: 'Displayed from local cache until Amazon RDS instance is connected.',
        image_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format&fit=crop&q=80'
      }
    ];
  }

  let query = 'SELECT * FROM cars';
  let params = [];

  if (categoryFilter && categoryFilter !== 'All') {
    if (DB_DIALECT === 'postgres') {
      query += ' WHERE category = $1 ORDER BY id DESC';
      params.push(categoryFilter);
    } else {
      query += ' WHERE category = ? ORDER BY id DESC';
      params.push(categoryFilter);
    }
  } else {
    query += ' ORDER BY id DESC';
  }

  if (DB_DIALECT === 'postgres') {
    const res = await dbPool.query(query, params);
    return res.rows;
  } else {
    const [rows] = await dbPool.query(query, params);
    return rows;
  }
}

// Fetch EC2 metadata when running in AWS
function getEC2Metadata() {
  return new Promise((resolve) => {
    const req = http.get(
      'http://169.254.169.254/latest/dynamic/instance-identity/document',
      { timeout: 1000 },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(null);
          }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

// Check S3 bucket connectivity
async function checkS3Status() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
    return { connected: true, bucket: S3_BUCKET, region: AWS_REGION };
  } catch (err) {
    return { connected: false, bucket: S3_BUCKET, region: AWS_REGION, error: err.message };
  }
}

// ROUTES

// 1. Home Page (Overview & Live AWS Health Check)
app.get('/', async (req, res) => {
  const ec2Info = await getEC2Metadata();
  const s3Info = await checkS3Status();
  const cars = await getAllCars();

  res.render('index', {
    title: 'Smart Car Rental - AWS Cloud Platform',
    ec2Info,
    s3Info,
    dbStatus,
    carCount: cars.length,
    awsRegion: AWS_REGION
  });
});

// 2. Data / Listing Page (Queries Amazon RDS)
app.get('/cars', async (req, res) => {
  const category = req.query.category || 'All';
  const cars = await getAllCars(category);

  res.render('cars', {
    title: 'Fleet Catalog - Amazon RDS Database',
    cars,
    selectedCategory: category,
    dbStatus
  });
});

// 3. Form / Upload Page (Uploads to S3 + Inserts to RDS)
app.get('/cars/new', (req, res) => {
  res.render('upload', {
    title: 'Add Vehicle - Amazon S3 & RDS Upload',
    dbStatus,
    s3Bucket: S3_BUCKET,
    error: null,
    success: null
  });
});

app.post('/cars', upload.single('image'), async (req, res) => {
  try {
    const { make, model, year, category, daily_rate, description } = req.body;
    let imageUrl = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80';

    // 1. Upload to Amazon S3 if file provided
    if (req.file) {
      const fileKey = `vehicles/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
      
      const uploadParams = {
        Bucket: S3_BUCKET,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };

      try {
        await s3Client.send(new PutObjectCommand(uploadParams));
        imageUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;
        console.log(`[S3] Uploaded image to ${imageUrl}`);
      } catch (s3Err) {
        console.warn(`[S3] Upload failed, falling back to default image: ${s3Err.message}`);
      }
    }

    // 2. Insert into Amazon RDS Database
    if (dbPool && dbStatus.connected) {
      if (DB_DIALECT === 'postgres') {
        await dbPool.query(
          'INSERT INTO cars (make, model, year, category, daily_rate, description, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [make, model, parseInt(year), category, parseFloat(daily_rate), description, imageUrl]
        );
      } else {
        await dbPool.query(
          'INSERT INTO cars (make, model, year, category, daily_rate, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [make, model, parseInt(year), category, parseFloat(daily_rate), description, imageUrl]
        );
      }
    }

    res.redirect('/cars?added=true');
  } catch (err) {
    res.render('upload', {
      title: 'Add Vehicle - Amazon S3 & RDS Upload',
      dbStatus,
      s3Bucket: S3_BUCKET,
      error: `Failed to save vehicle: ${err.message}`,
      success: null
    });
  }
});

// 4. AWS Architecture Diagram & Specifications Page
app.get('/architecture', async (req, res) => {
  const ec2Info = await getEC2Metadata();
  const s3Info = await checkS3Status();

  res.render('architecture', {
    title: 'AWS Cloud Architecture & Defense Notes',
    ec2Info,
    s3Info,
    dbStatus,
    awsRegion: AWS_REGION
  });
});

// 5. Health API (for AWS Target Group / ALB / Monitoring)
app.get('/api/health', async (req, res) => {
  const ec2Info = await getEC2Metadata();
  const s3Info = await checkS3Status();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    compute: {
      platform: 'Amazon EC2',
      instanceId: ec2Info?.instanceId || 'Local / Development',
      availabilityZone: ec2Info?.availabilityZone || 'Local',
      instanceType: ec2Info?.instanceType || 'Local'
    },
    database: dbStatus,
    storage: s3Info
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`Smart Car Rental (AWS Cloud Applications) running!`);
  console.log(`Port: ${PORT}`);
  console.log(`VPC Target Region: ${AWS_REGION}`);
  console.log(`S3 Bucket: ${S3_BUCKET}`);
  console.log(`RDS Host: ${DB_HOST}:${DB_PORT} (${DB_DIALECT})`);
  console.log(`===================================================`);
  await initDatabase();
});

