# CargoPredict — Data & Schema Architecture

## Overview
CargoPredict utilizes a cloud-native **Supabase PostgreSQL** database instance with 25 relational tables and 19,240 verified records for the machine learning freight corridor features.

Runtime data is fetched on demand directly from the PostgreSQL instance via connection pooling; large static CSV files are not bundled with the application runtime.

---

## Database Schemas & Table Directory

### 1. Reference Domain (`reference` schema)
- `reference.port_master`: Core geographic and operational data for global ports.
- `reference.port_specifications`: Deep draft, tidal window, and berth constraints.
- `reference.vessel_specifications`: Vessel classes (Capesize, Panamax, Supramax, Handysize, VLOC) with DWT, beam, LOA, and draft limits.
- `reference.cargo_types`: Bulk commodity profiles, stowage factors, and handling requirements.
- `reference.trade_routes`: Standard trading corridors (e.g., Newcastle → Vizag, Hay Point → Paradip).

### 2. Market Domain (`market` schema)
- `market.baltic_indices`: Baltic Dry Index (BDI), BCI (Capesize), BPI (Panamax), BSI (Supramax).
- `market.bunker_prices`: Singapore 0.5% VLSFO, MGO, and Rotterdam benchmark spot prices.
- `market.ffa_rates`: Forward Freight Agreements for forward curve modeling.
- `market.macro_indicators`: USD/INR exchange rates, steel production, and crude benchmarks.

### 3. Operations Domain (`operations` schema)
- `operations.vessel_tracking`: AIS vessel positions, headings, and ballasting status.
- `operations.port_congestion`: Queue length, average waiting hours, and berth turnaround times.
- `operations.lineup_status`: Port berth lineups and laycan scheduling.

### 4. Weather Domain (`weather` schema)
- `weather.cyclone_warnings`: MetOcean warnings in the Bay of Bengal, Arabian Sea, and Indian Ocean.
- `weather.sea_conditions`: Significant wave height, swell period, and surface wind speed.
- `weather.rainfall_metrics`: Monsoon precipitation metrics affecting port discharge operations.

### 5. Machine Learning Domain (`ml` schema)
- `ml.ml_freight_daily`: **19,240 verified historical rows** serving as the feature vector foundation for multi-horizon XGBoost inference (14D, 30D, 90D). Contains 30 engineered features including rolling freight averages, lag indicators, bunker differentials, and congestion proxies.
- `ml.model_metadata`: Registration of active model artifacts, training dates, and hyperparameters.

### 6. Application Domain (`cargopredict_app` schema)
- `cargopredict_app.users`: User accounts (`dhruvil`, `dwip`, `admin`) with salted PBKDF2 password hashes and RBAC roles.
- `cargopredict_app.user_settings`: User theme, default trading corridors, and notification preferences.
- `cargopredict_app.analysis_history`: User-saved freight analysis runs and scenario simulations.

---

## Data Contracts & Validation Rules
1. **Zero Fake Replacement Data**: All operational calculations are grounded in real database constraints (e.g. Haldia 8.8m draft constraint, Vizag 18.2m draft).
2. **Feature Alignment**: ML feature vectors queried from `ml.ml_freight_daily` must strictly match the 30-feature vector expected by the scikit-learn transformers and XGBoost estimators.
3. **Immutability**: Historical records are append-only.
