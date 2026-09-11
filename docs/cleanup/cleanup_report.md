# CargoPredict — Project Cleanup & Architecture Reorganization Report

**Date**: September 10, 2026  
**Status**: Completed & Verified  

---

## 1. Overview of Reorganization
The CargoPredict codebase has been reorganized into a modular 6-part architecture separating frontend, backend, machine learning, data documentation, documentation, and operational scripts:

```
CargoPredict/
├── frontend/       # Canonical React 19 + TypeScript + Vite UI
├── backend/        # FastAPI Application, Routers, Services, Core, Tests
├── ml_engine/      # Production XGBoost Models (14D, 30D, 90D), Inference, Configs
├── data/           # Data Schema Documentation & Data Contracts (Supabase-backed)
├── docs/           # Architecture, API, ML, Deployment, and Cleanup Reports
├── scripts/        # Startup, Dev Servers, Health Check, and Test Runners
├── .gitignore      # Root ignore rule set
├── README.md       # Full architecture and developer guide
└── LICENSE         # MIT Open-Source License
```

---

## 2. Inventory Changes & Audit

### A. Files Moved
| Original Location | New Location | Rationale |
|---|---|---|
| `maritime---freight-forecasting-&-vessel-optimizer (3)/*` | `frontend/*` | Consolidated into standard top-level `frontend/` directory. |
| `SIH_DATA_PIPE-main/SIH_DATA_PIPE-main/app/*` | `backend/app/*` | Moved into standard `backend/` directory with clean modular subpackages. |
| `SIH_DATA_PIPE-main/SIH_DATA_PIPE-main/tests/*` | `backend/tests/*` | Moved integration and ML test suites into `backend/tests/`. |
| `SIH_DATA_PIPE-main/SIH_DATA_PIPE-main/database/*` | `backend/database/*` | Moved SQL queries and table DDL schemas into backend database folder. |
| `SIH_DATA_PIPE-main/SIH_DATA_PIPE-main/.env` | `backend/.env` | Secure runtime environment file containing real Supabase connection string. |
| `SIH_DATA_PIPE-main/SIH_DATA_PIPE-main/.env.example` | `backend/.env.example` & `/.env.example` | Clean placeholders for new deployments. |
| `SIH_ML-engine-main/SIH_ML-engine-main/*` | `ml_engine/*` | Consolidated ML models, inference pipelines, and evaluation configs. |

---

### B. Duplicate Files Removed / Consolidated
1. **Model Artifact Duplicates**:
   - `backend/app/ml_engine/models/xgboost_14d.joblib`
   - `backend/app/ml_engine/models/xgboost_30d.joblib`
   - `backend/app/ml_engine/models/xgboost_90d.joblib`
   - **Action**: Removed duplicate copies totaling ~6.2 MB. The single canonical models are now located exclusively in `ml_engine/models/`. `backend/app/services/ml_engine.py` dynamically resolves the canonical model directory.
2. **Duplicate Reports & Evaluations**:
   - `backend/app/ml_engine/reports/model_comparison.csv`
   - **Action**: Consolidated into canonical `ml_engine/reports/model_comparison.csv`.

---

### C. Generated & Temporary Files Removed
- All `__pycache__/*.pyc` bytecode across `app/`, `src/`, `tests/`.
- Temporary OS files (`.DS_Store`).
- `.pytest_cache/` transient execution caches.
- Scratch scripts used during intermediate testing.

---

### D. Data Files Retained vs. Archived
- **Retained in Database**: All 25 database tables and **19,240 rows** in `ml.ml_freight_daily` remain intact in Supabase PostgreSQL.
- **Data Documentation**: Fully documented in `data/README.md`.
- **Pipeline Data Files**: The raw 38 CSV data files in `CargoPredict_Pipeline_Data/` were used for the one-time initial seed into Supabase. Because the application queries Supabase directly at runtime, these files are not shipped in the active application runtime.

---

### E. Files Retained and Why
- All React components in `frontend/src/components/` (26 components): Retained because every component serves a route or interactive dialog in the canonical UI.
- All 3 trained XGBoost artifacts in `ml_engine/models/`: Retained because they provide real multi-horizon inference for 14-day, 30-day, and 90-day predictions.
- All database queries and schema definitions in `backend/database/`: Retained for auditability and schema tracking.
- All integration and ML test files in `backend/tests/`: Retained to maintain 100% CI/CD regression testing coverage.

---

## 3. Final Verification Status
- **Frontend Build**: `0 errors` (Vite / Bun).
- **Pytest Test Suites**: `23/23 tests passed` (100%).
- **Supabase Connectivity**: Verified (19,240 rows).
- **Browser Refresh**: Verified (No white screen across all routes).
- **Authentication**: Verified for `dhruvil`, `dwip`, and `admin`.
