"""
test_forecasting.py
--------------------
Runs the full pipeline on SYNTHETIC data so you can validate everything
works end-to-end before Member 2's real dataset arrives. Once real data
is in data/processed/, point these fixtures at it instead.
"""

import numpy as np
import pandas as pd
import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.preprocessing import clean, validate, chronological_split
from src.features import build_features, feature_columns
from src.baseline import get_baseline
from src.xgboost_model import QuantileXGBForecaster, confidence_from_interval
from src.evaluation import evaluate_quantile_forecast, walk_forward_splits, build_comparison_table
from src.quantile_forecast import forecast_for_route


CONFIG = {
    "data": {"date_column": "date", "target_column": "freight_rate"},
    "features": {
        "lags": [1, 3, 7, 14, 30],
        "rolling_windows_mean": [7, 14, 30],
        "rolling_windows_std": [7, 30],
        "market_columns": ["BDI", "bunker_price"],
    },
}


@pytest.fixture
def synthetic_df():
    rng = np.random.default_rng(42)
    n = 900  # ~2.5 years of daily data
    dates = pd.date_range("2022-01-01", periods=n, freq="D")
    trend = np.linspace(20, 28, n)
    seasonal = 2 * np.sin(np.arange(n) * 2 * np.pi / 30)
    noise = rng.normal(0, 1.2, n)
    freight_rate = trend + seasonal + noise

    df = pd.DataFrame({
        "date": dates,
        "route": "Australia -> Visakhapatnam",
        "vessel_class": "Panamax",
        "freight_rate": freight_rate,
        "BDI": rng.normal(1500, 100, n),
        "bunker_price": rng.normal(600, 30, n),
    })
    return df


def test_clean_and_validate(synthetic_df):
    report = validate(synthetic_df, "date", "freight_rate", "route")
    assert report["n_rows"] == len(synthetic_df)
    cleaned = clean(synthetic_df, "date", "freight_rate", "route")
    assert cleaned["freight_rate"].isna().sum() == 0


def test_chronological_split_no_leakage(synthetic_df):
    train, val, test = chronological_split(synthetic_df, "date", "2023-06-30", "2024-01-31")
    assert train["date"].max() <= pd.Timestamp("2023-06-30")
    assert val["date"].min() > pd.Timestamp("2023-06-30")
    assert test["date"].min() > pd.Timestamp("2024-01-31")


def test_feature_pipeline_no_target_leakage(synthetic_df):
    featured = build_features(synthetic_df, CONFIG)
    cols = feature_columns(CONFIG)
    # every requested feature column should exist
    for c in cols:
        assert c in featured.columns, f"missing feature column {c}"
    # rolling/lag features should be NaN on day 1 (nothing to look back on)
    assert featured.loc[0, "lag_1"] != featured.loc[0, "lag_1"]  # NaN check


def test_holt_baseline_runs(synthetic_df):
    baseline = get_baseline("holt", seasonal_periods=30)
    series = synthetic_df.set_index("date")["freight_rate"]
    baseline.fit(series[:-30])
    preds = baseline.predict(30)
    assert len(preds) == 30
    assert not np.isnan(preds).any()


def test_quantile_xgb_end_to_end(synthetic_df):
    featured = build_features(synthetic_df, CONFIG)
    cols = feature_columns(CONFIG)
    featured = featured.dropna(subset=cols + ["freight_rate"])

    horizon = 14
    featured["target"] = featured["freight_rate"].shift(-horizon)
    featured = featured.dropna(subset=["target"])

    train = featured.iloc[:-60]
    test = featured.iloc[-60:]

    model = QuantileXGBForecaster(
        quantiles=[0.10, 0.50, 0.90],
        params={"n_estimators": 50, "max_depth": 3},
    )
    model.fit(train[cols], train["target"])

    preds = model.predict(test[cols])
    assert list(preds.columns) == ["p10", "p50", "p90"]
    # monotonicity check
    assert (preds["p10"] <= preds["p50"]).all()
    assert (preds["p50"] <= preds["p90"]).all()

    metrics = evaluate_quantile_forecast(
        test["target"].to_numpy(), preds["p10"].to_numpy(),
        preds["p50"].to_numpy(), preds["p90"].to_numpy(),
    )
    assert 0 <= metrics["p90_coverage"] <= 1
    assert metrics["wape"] >= 0


def test_single_row_handoff_schema(synthetic_df):
    """Validates the exact dict schema Member 4 will receive."""
    featured = build_features(synthetic_df, CONFIG)
    cols = feature_columns(CONFIG)
    featured = featured.dropna(subset=cols + ["freight_rate"])

    horizon = 30
    featured["target"] = featured["freight_rate"].shift(-horizon)
    train = featured.dropna(subset=["target"])

    model = QuantileXGBForecaster(params={"n_estimators": 50, "max_depth": 3})
    model.fit(train[cols], train["target"])

    latest_row = featured[cols].tail(1)
    result = forecast_for_route(model, latest_row, "Australia -> Visakhapatnam", "Panamax", horizon)

    expected_keys = {"route", "vessel_class", "forecast_horizon", "p10", "p50", "p90", "confidence"}
    assert set(result.keys()) == expected_keys
    assert result["p10"] <= result["p50"] <= result["p90"]
    assert 0 <= result["confidence"] <= 1


def test_walk_forward_splits_are_chronological(synthetic_df):
    splits = list(walk_forward_splits(
        synthetic_df, "date", initial_train_window_days=365, step_days=30, horizon=30
    ))
    assert len(splits) > 0
    for train_idx, test_idx in splits:
        assert synthetic_df.loc[train_idx, "date"].max() < synthetic_df.loc[test_idx, "date"].min()


def test_comparison_table_shape():
    fake_results = {
        "Holt": {"wape": 0.12, "mae": 1.1, "rmse": 1.5, "p90_coverage": 0.87},
        "XGBoost": {"wape": 0.08, "mae": 0.9, "rmse": 1.2, "p90_coverage": 0.91},
    }
    table = build_comparison_table(fake_results)
    assert list(table.columns) == ["Model", "WAPE", "MAE", "RMSE", "P90 Coverage"]
    assert len(table) == 2
