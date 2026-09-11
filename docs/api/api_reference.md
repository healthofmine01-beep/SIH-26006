# CargoPredict — REST API Reference

All endpoints return JSON and are hosted under `/api`. Interactive documentation is available at `/api/docs` (Swagger UI) and `/api/redoc`.

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/login`
- **Description**: Authenticates user credentials and issues a signed JWT token.
- **Request Body**:
  ```json
  {
    "username": "dhruvil",
    "password": "dhruvil123"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "access_token": "eyJ...",
    "token_type": "bearer",
    "user": {
      "username": "dhruvil",
      "role": "customer",
      "full_name": "Dhruvil Bhavsar"
    },
    "settings": { ... }
  }
  ```

### `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns current user profile and user settings.

### `POST /api/auth/logout`
- **Description**: Invalidates browser session cookies and terminates local session.

---

## 2. Freight Forecasting (`/api/forecasts`)

### `GET /api/forecasts/predict`
- **Description**: Executes multi-horizon XGBoost model inference using Supabase feature vectors.
- **Query Parameters**:
  - `route_id` (string, default: `"R001"`)
  - `vessel_class` (string, optional: `"Capesize"`)
  - `horizon_days` (integer: `14`, `30`, or `90`)
  - `fuel_shift_pct` (float: scenario fuel price shift %)
  - `congestion_shift_pct` (float: scenario congestion shift %)
  - `vessel_supply_shift_pct` (float: scenario tonnage supply shift %)
- **Response**:
  ```json
  {
    "route_id": "R001",
    "horizon_days": 14,
    "model_name": "XGBoost (14D)",
    "current_spot_rate": 28.0,
    "predicted_rate": 27.6,
    "p10": 26.2,
    "p50": 27.6,
    "p90": 29.0,
    "ci_lower": 25.8,
    "ci_upper": 29.4,
    "kpis": {
      "projected_change_pct": -1.43,
      "volatility_score": 1.42
    },
    "forecast": [
      {
        "date": "2026-09-01",
        "predicted_rate_usd_per_mt": 27.97,
        "ci_80_lower": 26.3,
        "ci_80_upper": 29.6
      }
    ]
  }
  ```

### `GET /api/forecasts/metrics`
- **Description**: Returns empirical validation metrics (MAE, RMSE, WAPE, R²) across all trained horizons.

---

## 3. Optimization & Decision Support (`/api/optimize`)

### `POST /api/optimize/analyze`
- **Description**: Evaluates shipment parameters against destination port draft limits and returns optimal fixture timing (BOOK NOW, WAIT, CONSIDER ALTERNATIVE).
- **Request Body**:
  ```json
  {
    "cargoType": "Coking Coal",
    "cargoQuantity": 160000,
    "origin": "Hay Point, Australia",
    "destinationPort": "Visakhapatnam (Vizag), India",
    "contractPreference": "Spot"
  }
  ```

---

## 4. Administration Console (`/api/admin`) — RBAC: Admin Only
- `GET /api/admin/database-catalog`: Schema and table inventory across all 28 tables.
- `GET /api/admin/pipeline-runs`: Prefect ETL pipeline execution logs and status.
- `GET /api/admin/data-quality`: Automated data freshness and null-check audits.
- `GET /api/admin/model-metrics`: Model comparison table comparing XGBoost vs. baseline.
