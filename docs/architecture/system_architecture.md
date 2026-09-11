# CargoPredict — System Architecture

```
                                  CARGOPREDICT ARCHITECTURE
                                  
   +-----------------------------------------------------------------------------------+
   |                                 CLIENT TIER                                       |
   |                                                                                   |
   |   React 19 + TypeScript + Vite + TailwindCSS + Lucide Icons + Recharts            |
   |   - DashboardView         - ForecastView             - PredictionResultPage       |
   |   - NewAnalysisPage       - WhatIfView               - AdminView                  |
   |   - HistoryPage           - VesselPortView           - TrackingView               |
   |                                                                                   |
   |   State Management: Local Storage Auth Session + ErrorBoundary + URL Sync         |
   +------------------------------------------+----------------------------------------+
                                              | HTTPS / JSON
                                              v
   +-----------------------------------------------------------------------------------+
   |                                 BACKEND TIER                                      |
   |                                                                                   |
   |   FastAPI REST Application (Uvicorn ASGI)                                         |
   |   ├── /api/auth       : JWT Sessions, PBKDF2 Hashing, User Preferences            |
   |   ├── /api/forecasts  : Real Multi-Horizon ML Inference (14D, 30D, 90D)           |
   |   ├── /api/optimize   : Port Constraints, Under-Keel Clearance, Charter Strategy   |
   |   ├── /api/maritime   : Fleet Specs, Baltic Indices, AIS Voyage Tracking          |
   |   └── /api/admin      : Data Catalog, Pipeline Runs, Data Quality & Model Metrics |
   |                                                                                   |
   |   Static Assets Service: Direct File & Single Page Application Fallback Handler   |
   +--------------------+---------------------------------------+---------------------+
                        |                                       |
                        v                                       v
   +----------------------------------------+   +--------------------------------------+
   |             ML ENGINE TIER             |   |             DATABASE TIER            |
   |                                        |   |                                      |
   |  Trained Multi-Horizon XGBoost Models  |   |   Supabase PostgreSQL Cloud Database |
   |  ├── xgboost_14d.joblib (MAPE 4.2%)    |   |   ├── reference (Ports & Vessels)    |
   |  ├── xgboost_30d.joblib (MAPE 5.1%)    |   |   ├── operations (Congestion & AIS)  |
   |  └── xgboost_90d.joblib (MAPE 6.8%)    |   |   ├── market (BDI & VLSFO Bunkers)   |
   |                                        |   |   ├── weather (MetOcean Sea States)  |
   |  Feature Transformation Pipeline       |   |   ├── ml (19,240 Freight Records)    |
   |  ├── 30 Engineered Features (Lags,     |   |   └── cargopredict_app (Users &      |
   |  │   Moving Averages, BDI, Bunkers)    |   |       Saved Scenarios)               |
   |  └── Scenario Stress Testing           |   |                                      |
   +----------------------------------------+   +--------------------------------------+
```

## Key Architectural Principles
1. **Single Source of Truth**: All operational parameters (vessel draft, port depth, Baltic indices) are read from Supabase PostgreSQL.
2. **Deterministic ML Inference**: Models are real serialized XGBoost pipelines with ColumnTransformers. No random or mock forecasting is used in production.
3. **Decoupled Client & Server**: React frontend is built as a static SPA and served by FastAPI with client-side routing fallback (`serve_spa`).
4. **Resilient Error Recovery**: ErrorBoundary wraps UI views, while backend returns structured HTTP error responses with granular RBAC enforcement.
