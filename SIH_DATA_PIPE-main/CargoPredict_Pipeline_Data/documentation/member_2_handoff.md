# Member 2 to Member 3 Handoff

- Target: freight_rate_usd_per_mt
- Grain: date + route_id + vessel_class
- Forecast horizons: 14, 30 and 90 days
- Main portable file: ml_ready/ml_freight_daily.csv
- Optional Parquet is produced only when a Parquet engine is installed.
- All target values in this ML table are synthetic demonstration values.
- Do not report performance as production accuracy.
- Split chronologically and retain route_id groups.
