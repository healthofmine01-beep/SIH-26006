# CargoPredict — Deployment & Operations Guide

## Production Architecture
CargoPredict is designed for unified deployment where FastAPI serves both the authenticated REST API and the optimized React SPA bundle.

```
Incoming Request -> Uvicorn ASGI Server (Port 8000)
                     ├── /api/*          -> FastAPI API Routers -> Supabase PostgreSQL
                     ├── /assets/*       -> Static frontend assets (JS/CSS/SVG)
                     └── /{path:path}    -> frontend/dist/index.html (SPA Fallback)
```

---

## 1. Prerequisites
- Python 3.10+ (Recommended: Python 3.12)
- Node.js 18+ or Bun
- Access to Supabase PostgreSQL instance

---

## 2. Environment Configuration
Create `backend/.env` with the following:
```env
SUPABASE_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require
CARGOPREDICT_SECRET_KEY=cargopredict-production-secret-key-2026-secure-sih
TOKEN_EXPIRY_HOURS=24
APP_HOST=127.0.0.1
APP_PORT=8000
```

---

## 3. Building Frontend
```bash
cd frontend
bun run build
# Or: npm run build
```
This writes the production bundle to `frontend/dist`.

---

## 4. Starting Production Server
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Open `http://127.0.0.1:8000` in your web browser.

---

## 5. Pre-Seeded Accounts
| Username | Password | Role | Description |
|---|---|---|---|
| `dhruvil` | `dhruvil123` | `customer` | Procurement Officer |
| `dwip` | `dwip123` | `customer` | Chartering Manager |
| `admin` | `admin123` | `admin` | System Administrator (Full Admin Console access) |
