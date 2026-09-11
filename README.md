# CargoPredict

> **Enterprise Maritime Freight Rate Forecasting & Intelligent Vessel Optimization System**

```
CargoPredict
    ↓
Frontend (React 19, TypeScript, TailwindCSS)
    ↓
Backend (FastAPI, Uvicorn, REST API)
    ↓
Supabase (PostgreSQL 25 Relational Tables, 19,240 Rows)
    ↓
ML Engine (XGBoost 14D, 30D, 90D Multi-Horizon Pipelines)
    ↓
Optimization (Port Draft, Vessel Matching, Fixture Recommendation)
```

---

## 1. Project Purpose
CargoPredict provides end-to-end intelligence for dry bulk charterers and commodity procurement teams. By unifying MetOcean sea-state data, port congestion queues, Baltic Dry Indices, and forward bunker fuel benchmarks with multi-horizon machine learning (XGBoost), the system predicts dry bulk freight rates up to 90 days in advance and recommends actionable charter fixture strategies (`BOOK NOW`, `WAIT`, `CONSIDER ALTERNATIVE`).

---

## 2. System Architecture

```
CargoPredict/
├── frontend/       # Canonical React 19 + TypeScript + Tailwind UI
├── backend/        # FastAPI Application, Routers, Services, Core, Tests
├── ml_engine/      # Production XGBoost Models (14D, 30D, 90D), Inference, Configs
├── data/           # Data Schema Documentation & Data Contracts (Supabase-backed)
├── docs/           # Architecture, API, ML, Deployment, and Cleanup Reports
├── scripts/        # Startup, Dev Servers, Health Check, and Test Runners
├── .gitignore      # Git ignore definitions
├── README.md       # Root project documentation
└── LICENSE         # MIT Open-Source License
```

---

## 3. Quick Start

### Prerequisites
- Python 3.10+ (Recommended: Python 3.12)
- Node.js 18+ or Bun
- Supabase PostgreSQL instance

### Setup Environment
1. Copy the environment template:
   ```bash
   cp .env.example backend/.env
   ```
2. Configure `SUPABASE_DATABASE_URL` in `backend/.env` with your PostgreSQL connection string.

### Start the Application
You can start the production backend which automatically serves the compiled frontend:
```bash
# Using startup script (Windows):
scripts\start_backend.bat

# Or manually:
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

### Start Frontend Development Server (Optional)
If modifying the React frontend source:
```bash
cd frontend
bun run dev
# Or: npm run dev
```

---

## 4. Pre-Seeded User Accounts

| Username | Password | Role | Description |
|---|---|---|---|
| `dhruvil` | `dhruvil123` | `customer` | Procurement Officer — General access |
| `dwip` | `dwip123` | `customer` | Chartering Manager — General access |
| `admin` | `admin123` | `admin` | Administrator — Full access to Data & Model Admin Console |

---

## 5. How ML Inference Works
1. When a user requests a freight prediction for a trading route (e.g. `R001: Australia → Vizag`) across a horizon (14D, 30D, or 90D), the backend queries the latest 30-feature vector from `ml.ml_freight_daily` in Supabase PostgreSQL.
2. The `MLForecastEngine` singleton loads the corresponding trained artifact (`ml_engine/models/xgboost_<horizon>d.joblib`).
3. If scenario shocks are applied (e.g. bunker fuel +20%, port congestion +15%), the feature vector is dynamically stressed.
4. The scikit-learn preprocessor encodes categorical variables and normalizes numerical features.
5. The XGBoost model calculates the predicted point estimate and empirical quantile intervals (P10, P50, P90).
6. The prediction feeds directly into the optimization engine to verify draft clearance against port bathymetry before delivering a final chartering recommendation.

---

## 6. How Supabase Is Used
- **25 Relational Tables**: Grounded in global port master data, vessel classes (Capesize, Panamax, etc.), Baltic Dry Indices, and bunker prices.
- **19,240 Verified Freight Records**: Reside in `ml.ml_freight_daily`, maintaining a complete historical audit trail for time-series forecasting.
- **Application State**: User accounts, settings, and analysis history persist in the `cargopredict_app` schema.

---

## 7. Running Tests
Run the comprehensive test suite (23 integration and ML tests):
```bash
# Using test script (Windows):
scripts\run_tests.bat

# Or via pytest:
cd backend
pytest tests/test_canonical_integration.py tests/test_ml_engine.py -v
```

---

## 8. Documentation Index
- [System Architecture](file:///docs/architecture/system_architecture.md)
- [REST API Reference](file:///docs/api/api_reference.md)
- [ML Model Card](file:///docs/ml/ml_model_card.md)
- [Deployment Guide](file:///docs/deployment/deployment_guide.md)
- [Cleanup & Reorganization Report](file:///docs/cleanup/cleanup_report.md)
- [Database Schema & Contracts](file:///data/README.md)

---

## 9. License
Distributed under the MIT License. See [LICENSE](file:///LICENSE) for details.
