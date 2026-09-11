"""
baseline.py
-----------
Stage 1 statistical baseline (Holt), fit per (route_id, vessel_type,
freight_rate_unit) group — never across groups, and never across the
two non-combinable target units.
"""

from __future__ import annotations
import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import Holt, ExponentialSmoothing


class HoltBaseline:
    def __init__(self, seasonal_periods: int | None = None):
        self.seasonal_periods = seasonal_periods
        self.fit_result = None

    def fit(self, series: pd.Series):
        series = series.astype(float)
        if self.seasonal_periods and len(series) > 2 * self.seasonal_periods:
            model = ExponentialSmoothing(
                series, trend="add", seasonal="add",
                seasonal_periods=self.seasonal_periods,
                initialization_method="estimated",
            )
        else:
            model = Holt(series, initialization_method="estimated")
        self.fit_result = model.fit()
        return self

    def predict(self, steps: int) -> np.ndarray:
        if self.fit_result is None:
            raise RuntimeError("Call .fit() before .predict()")
        return self.fit_result.forecast(steps).to_numpy()


def fit_baseline_per_group(df: pd.DataFrame, target_col: str, date_col: str,
                           group_cols: list[str], seasonal_periods: int = 7) -> dict:
    """Returns {group_key_tuple: fitted HoltBaseline}. Skips groups with
    too few points for a stable fit rather than forcing a fit that will
    just produce noise."""
    fits = {}
    for key, g in df.sort_values(date_col).groupby(group_cols):
        series = g.set_index(date_col)[target_col].dropna()
        if len(series) < 10:
            continue
        fits[key] = HoltBaseline(seasonal_periods).fit(series)
    return fits
