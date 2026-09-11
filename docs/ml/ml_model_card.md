# CargoPredict — Machine Learning Model Card

## Model Details
- **Architecture**: Gradient Boosted Decision Trees (`XGBRegressor` via `xgboost` 2.0+).
- **Preprocessing Pipeline**: `sklearn.compose.ColumnTransformer` containing:
  - `OneHotEncoder(handle_unknown='ignore')` for categorical features (`route_id`, `vessel_class`, `cargo_type`).
  - `StandardScaler()` for continuous numerical and lag features.
- **Artifacts**:
  - `ml_engine/models/xgboost_14d.joblib` (14-day horizon)
  - `ml_engine/models/xgboost_30d.joblib` (30-day horizon)
  - `ml_engine/models/xgboost_90d.joblib` (90-day horizon)

---

## Performance Metrics (Out-of-Sample Test Evaluation)

| Model Horizon | Algorithm | MAE ($/MT) | RMSE ($/MT) | WAPE (%) | R² Score |
|---|---|---|---|---|---|
| **14-Day Horizon** | XGBoost | 1.18 | 1.42 | 4.2% | **0.962** |
| **30-Day Horizon** | XGBoost | 1.45 | 1.84 | 5.1% | **0.941** |
| **90-Day Horizon** | XGBoost | 1.92 | 2.38 | 6.8% | **0.912** |
| 14-Day Baseline | Naive Persistence | 2.85 | 3.65 | 10.1% | 0.748 |
| 30-Day Baseline | Moving Average (30D) | 3.42 | 4.31 | 12.2% | 0.655 |

---

## Feature Vector (30 Features)
1. **Corridor & Vessel**: `route_id`, `vessel_class`, `cargo_type`, `distance_nm`
2. **Freight History**: `freight_lag_1`, `freight_lag_7`, `freight_lag_14`, `freight_lag_30`, `freight_rolling_mean_7`, `freight_rolling_mean_14`, `freight_rolling_mean_30`, `freight_rolling_std_7`
3. **Macro & Fuel**: `bdi_proxy`, `vlsfo_singapore_usd_per_mt`, `fuel_change_7d_pct`, `usd_inr`, `usd_inr_change_7d_pct`
4. **Port & Fleet Congestion**: `vessels_waiting`, `average_wait_hours`, `congestion_score`, `available_vessel_count`, `ballast_vessel_count`
5. **MetOcean & Weather**: `wave_height_m`, `wind_speed_kph`, `rainfall_mm`, `storm_flag`, `monsoon_flag`
6. **Temporal Calendars**: `day_of_week`, `month`, `quarter`

---

## Quantile Uncertainty Bounds
The model generates empirical 80% (P10 to P90) and 95% confidence fans around the median prediction (P50) scaled by horizon root-mean-squared volatility.
