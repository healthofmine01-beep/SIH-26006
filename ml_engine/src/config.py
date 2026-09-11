TARGET = "freight_rate_usd_per_mt"

GROUP_COLUMNS = [
    "route_id",
    "vessel_class"
]

CATEGORICAL_FEATURES = [
    "route_id",
    "vessel_class",
    "cargo_type"
]

NUMERIC_FEATURES = [
    "distance_nm",

    "bdi_proxy",
    "vlsfo_singapore_usd_per_mt",
    "usd_inr",

    "vessels_waiting",
    "average_wait_hours",
    "congestion_score",

    "wave_height_m",
    "wind_speed_kph",
    "rainfall_mm",

    "available_vessel_count",
    "ballast_vessel_count",

    "freight_lag_1",
    "freight_lag_7",
    "freight_lag_14",
    "freight_lag_30",

    "freight_rolling_mean_7",
    "freight_rolling_mean_14",
    "freight_rolling_mean_30",

    "freight_rolling_std_7",

    "fuel_change_7d_pct",
    "usd_inr_change_7d_pct",

    "day_of_week",
    "month",
    "quarter",

    "storm_flag",
    "monsoon_flag",
]

HORIZONS = [14, 30, 90]