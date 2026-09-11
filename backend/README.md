# CargoPredict — Backend API & Services

FastAPI REST backend serving real-time analytics, machine learning inference, and decision optimization.

---

## Architecture
```
backend/
├── app/
│   ├── main.py                  # FastAPI application entrypoint & SPA static server
│   ├── api/                     # Modular route controllers
│   │   ├── auth.py              # Login, session, preferences
│   │   ├── forecasts.py         # Multi-horizon ML prediction endpoint
│   │   ├── optimize.py          # Port constraint & fixture decision endpoint
│   │   ├── maritime.py          # Port, vessel, and route catalogs
│   │   └── admin.py             # Admin catalog & model evaluation metrics
│   ├── services/                # Business logic services
│   │   ├── ml_engine.py         # XGBoost model loader & inference engine
│   │   ├── optimization_service.py # Draft clearance and fixture rule engine
│   │   ├── forecasting_service.py # Corridor trajectory construction
│   │   ├── maritime_service.py  # Fleet & port data lookups
│   │   └── admin_service.py     # Database catalog audits
│   ├── core/                    # Core configuration and security
│   │   ├── config.py            # Environment settings and Supabase URL
│   │   └── security.py          # PBKDF2 password hashing and JWT issuance
│   ├── database/                # Database layer
│   │   ├── connection.py        # Connection pooling (psycopg dict_row)
│   │   └── schemas/             # Schema definitions
│   └── schemas/                 # Pydantic request/response validation
├── tests/                       # Integration & ML test suites
├── requirements.txt             # Pinned backend dependencies
├── .env                         # Real credentials (never committed)
└── .env.example                 # Placeholder template
```

---

## Starting the Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## Running Tests
```bash
pytest tests/test_canonical_integration.py tests/test_ml_engine.py -v
```
Verifies health, database counts, RBAC, 14D/30D/90D ML inference, and optimization.
