# 🚗 AutoRent AI — Smart Car Rental Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-web--omega--weld--89.vercel.app-00DC82?style=for-the-badge&logo=vercel)](https://web-omega-weld-89.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Vision_AI-4285F4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini)

> **Rent Smarter. Return Safer.**  
> An AI-powered car rental platform tailored for Egyptian roads and drivers, featuring automated computer-vision damage detection, instant vehicle valuation, smart car comparisons, and frictionless booking.

🔗 **Live Preview:** [https://web-omega-weld-89.vercel.app](https://web-omega-weld-89.vercel.app)

---

## ✨ Key Features

- 📸 **AI Snap & Identify (`/snap`)**: Point your camera at any vehicle to instantly detect make, model, year, and estimated Egyptian rental/market value powered by Gemini Vision AI.
- 🛡️ **AI Damage Assessment (`/damage`)**: Upload photos to detect scratches, dents, and cracks. Estimates repair costs in EGP and recommends deposit adjustments with zero disputes.
- 🏁 **Smart Car Comparator (`/compare`)**: Side-by-side comparison of up to 3 cars from a database of hundreds of Egyptian and international models.
- 🗺️ **Roadtrip Planner (`/roadtrip`)**: Plan optimal travel routes across Egypt (Cairo, Giza, Aswan, Alexandria, Hurghada, Sharm El Sheikh) with fuel calculations and vehicle recommendations.
- 🚗 **Real Fleet & Direct Bookings (`/fleet`)**: Browse live available vehicles, check specs, calculate daily rates & refundable deposits, and book instantly.
- 📊 **Fleet Owner & Renter Dashboard (`/dashboard`)**: Track bookings, review AI inspections, and approve or reject rentals in real-time.
- 🔍 **SEO & Search Optimized**: Full XML Sitemap (`/sitemap.xml`), `robots.txt`, and bilingual metadata (English & Arabic) with Schema.org `AutoRental` structured data.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Modern Custom CSS Design System (Glassmorphism, Dark/Light modes, Micro-animations)
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL, Row-Level Security, Storage)
- **AI Models**: Google Gemini 2.0 Flash / Pro Vision API
- **Deployment**: [Vercel](https://vercel.com)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env.local` and add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to test locally.

---

## 🌐 Live Preview & Sitemap
- **Website**: [https://web-omega-weld-89.vercel.app](https://web-omega-weld-89.vercel.app)
- **Sitemap**: [https://web-omega-weld-89.vercel.app/sitemap.xml](https://web-omega-weld-89.vercel.app/sitemap.xml)
- **Robots.txt**: [https://web-omega-weld-89.vercel.app/robots.txt](https://web-omega-weld-89.vercel.app/robots.txt)

---

## 📄 License
This project is licensed under the MIT License.
