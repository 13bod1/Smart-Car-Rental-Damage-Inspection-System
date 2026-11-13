# 🚗 Smart Car Rental — AI Damage Assessment & Vehicle Valuation Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-web--omega--weld--89.vercel.app-00DC82?style=for-the-badge&logo=vercel)](https://web-omega-weld-89.vercel.app)

🔗 **Live Preview:** [https://web-omega-weld-89.vercel.app](https://web-omega-weld-89.vercel.app)

A full-stack monorepo implementing the SAD architecture.

## Structure

```
smart-car-rental/
├── apps/
│   └── web/               # Next.js 14 frontend
├── services/
│   ├── ai-engine/         # Python FastAPI — damage detection & valuation
│   └── financial-service/ # Python FastAPI — deposit strategy & payments
├── supabase/
│   └── migrations/        # SQL schema, RLS policies, seed data
└── docker-compose.yml     # Local dev orchestration
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Supabase project (URL + anon key)

### 1. Copy env files and fill in your credentials
```bash
cp apps/web/.env.example apps/web/.env.local
cp services/ai-engine/.env.example services/ai-engine/.env
cp services/financial-service/.env.example services/financial-service/.env
```

### 2. Run Supabase migrations
Apply the SQL files in `supabase/migrations/` via the Supabase dashboard SQL editor or Supabase CLI.

### 3. Start everything
```bash
docker-compose up --build
```

Or run individually:
```bash
# Frontend
cd apps/web && npm install && npm run dev

# AI Engine
cd services/ai-engine && pip install -r requirements.txt && uvicorn main:app --reload --port 8001

# Financial Service
cd services/financial-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8002
```
