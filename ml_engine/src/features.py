"""
features.py
-----------
Builds lag / rolling / market features exactly as specified in the config:

    lag_1, lag_3, lag_7, lag_14, lag_30
    rolling_mean_7, rolling_mean_14, rolling_mean_30
    rolling_std_7, rolling_std_30
    + passthrough market columns (BDI, BPI, BSI, bunker_price, ...)
"""

from __future__ import annotations
import pandas as pd
import numpy as np


def add_lag_features(df: pd.DataFrame, target_column: str, lags: list[int],
                      group_column: str | None = None) -> pd.DataFrame:
    df = df.copy()
    grouped = df.groupby(group_column)[target_column] if group_column else df[target_column]
    for lag in lags:
        df[f"lag_{lag}"] = grouped.shift(lag) if group_column else df[target_column].shift(lag)
    return df


def add_rolling_features(df: pd.DataFrame, target_column: str,
                          mean_windows: list[int], std_windows: list[int],
                          group_column: str | None = None) -> pd.DataFrame:
    df = df.copy()

    def _roll(series: pd.Series, window: int, how: str):
        # shift(1) first so the current day's own value never leaks into
        # its own rolling stat
        s = series.shift(1)
        return s.rolling(window, min_periods=max(2, window // 2))

    if group_column:
        for w in mean_windows:
            df[f"rolling_mean_{w}"] = (
                df.groupby(group_column)[target_column]
                  .apply(lambda s: s.shift(1).rolling(w, min_periods=max(2, w // 2)).mean())
                  .reset_index(level=0, drop=True)
            )
        for w in std_windows:
            df[f"rolling_std_{w}"] = (
                df.groupby(group_column)[target_column]
                  .apply(lambda s: s.shift(1).rolling(w, min_periods=max(2, w // 2)).std())
                  .reset_index(level=0, drop=True)
            )
    else:
        for w in mean_windows:
            df[f"rolling_mean_{w}"] = df[target_column].shift(1).rolling(w, min_periods=max(2, w // 2)).mean()
        for w in std_windows:
            df[f"rolling_std_{w}"] = df[target_column].shift(1).rolling(w, min_periods=max(2, w // 2)).std()

    return df


def add_calendar_features(df: pd.DataFrame, date_column: str) -> pd.DataFrame:
    df = df.copy()
    df["day_of_week"] = df[date_column].dt.dayofweek
    df["month"] = df[date_column].dt.month
    df["is_month_end"] = df[date_column].dt.is_month_end.astype(int)
    return df


def build_features(df: pd.DataFrame, config: dict, group_column: str | None = None) -> pd.DataFrame:
    """One-shot pipeline: lags + rolling stats + calendar features.
    Market columns (BDI, bunker_price, etc.) are assumed already present
    in df from Member 2's data and are passed through untouched — just
    make sure they're not leaking future information (i.e. they should
    already be lagged/available-at-prediction-time upstream)."""
    date_col = config["data"]["date_column"]
    target_col = config["data"]["target_column"]
    feat_cfg = config["features"]

    df = add_lag_features(df, target_col, feat_cfg["lags"], group_column)
    df = add_rolling_features(
        df, target_col,
        feat_cfg["rolling_windows_mean"],
        feat_cfg["rolling_windows_std"],
        group_column,
    )
    df = add_calendar_features(df, date_col)
    return df


def feature_columns(config: dict) -> list[str]:
    """Returns the list of column names the model should train on."""
    feat_cfg = config["features"]
    cols = [f"lag_{l}" for l in feat_cfg["lags"]]
    cols += [f"rolling_mean_{w}" for w in feat_cfg["rolling_windows_mean"]]
    cols += [f"rolling_std_{w}" for w in feat_cfg["rolling_windows_std"]]
    cols += ["day_of_week", "month", "is_month_end"]
    cols += [c for c in feat_cfg["market_columns"]]
    return cols
