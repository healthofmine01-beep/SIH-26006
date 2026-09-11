"""
quantile_forecast.py
---------------------
Stage 3/4 orchestration: combines Holt baseline + XGBoost quantile model
(+ TFT later, if enabled) into the final P10/P50/P90 forecast per
route / vessel_class / horizon.

This is the module that ultimately produces the dict Member 4 consumes.
"""

from __future__ import annotations
import numpy as np
import pandas as pd

from .xgboost_model import QuantileXGBForecaster, confidence_from_interval


def make_horizon_targets(df: pd.DataFrame, target_column: str, horizon: int,
                          group_column: str | None = None) -> pd.Series:
    """
    Builds the label to predict: the target value `horizon` days ahead.
    Use this to train a separate model per horizon (14 / 30 / 90), which
    is simpler and more robust than one multi-output model for a hackathon
    timeline.
    """
    if group_column:
        return df.groupby(group_column)[target_column].shift(-horizon)
    return df[target_column].shift(-horizon)


def forecast_for_route(
    xgb_model: QuantileXGBForecaster,
    X_latest: pd.DataFrame,
    route: str,
    vessel_class: str,
    horizon: int,
) -> dict:
    """
    Produces exactly the handoff schema specified for Member 4:

        {
          "route": "...",
          "vessel_class": "...",
          "forecast_horizon": 30,
          "p10": ...,
          "p50": ...,
          "p90": ...,
          "confidence": ...
        }

    X_latest should be a single-row feature vector representing "today"
    for this route/vessel_class (i.e. the most recent available features).
    """
    preds = xgb_model.predict(X_latest)  # 1-row DataFrame: p10, p50, p90
    p10 = float(preds["p10"].iloc[0])
    p50 = float(preds["p50"].iloc[0])
    p90 = float(preds["p90"].iloc[0])
    confidence = float(confidence_from_interval(
        np.array([p10]), np.array([p50]), np.array([p90])
    )[0])

    return {
        "route": route,
        "vessel_class": vessel_class,
        "forecast_horizon": horizon,
        "p10": round(p10, 2),
        "p50": round(p50, 2),
        "p90": round(p90, 2),
        "confidence": round(confidence, 2),
    }


def ensemble_point_forecast(baseline_pred: np.ndarray, xgb_p50: np.ndarray,
                             tft_pred: np.ndarray | None = None,
                             weights: dict | None = None) -> np.ndarray:
    """
    Optional Stage 4 ensembling of point forecasts (baseline / xgboost /
    tft) before quantiles are derived. Only meaningful once TFT exists —
    until then, xgb_p50 alone is your point forecast.
    """
    weights = weights or {"baseline": 0.2, "xgboost": 0.5, "tft": 0.3}
    if tft_pred is None:
        w_sum = weights["baseline"] + weights["xgboost"]
        return (weights["baseline"] * baseline_pred + weights["xgboost"] * xgb_p50) / w_sum
    return (
        weights["baseline"] * baseline_pred
        + weights["xgboost"] * xgb_p50
        + weights["tft"] * tft_pred
    )
