"""
evaluation.py
-------------
WAPE / MAE / RMSE / pinball loss / P90 coverage, and walk-forward
splitting grouped by (route_id, vessel_type, freight_rate_unit) so a
fold never bleeds one lane's history into another's test window.
"""

from __future__ import annotations
import numpy as np
import pandas as pd


def wape(y_true, y_pred) -> float:
    y_true, y_pred = np.asarray(y_true, dtype=float), np.asarray(y_pred, dtype=float)
    denom = np.sum(np.abs(y_true))
    return float(np.sum(np.abs(y_true - y_pred)) / denom) if denom else np.nan


def mae(y_true, y_pred) -> float:
    return float(np.mean(np.abs(np.asarray(y_true) - np.asarray(y_pred))))


def rmse(y_true, y_pred) -> float:
    return float(np.sqrt(np.mean((np.asarray(y_true) - np.asarray(y_pred)) ** 2)))


def pinball_loss(y_true, y_pred, quantile: float) -> float:
    y_true, y_pred = np.asarray(y_true, dtype=float), np.asarray(y_pred, dtype=float)
    diff = y_true - y_pred
    return float(np.mean(np.maximum(quantile * diff, (quantile - 1) * diff)))


def p90_coverage(y_true, p90_pred) -> float:
    y_true, p90_pred = np.asarray(y_true, dtype=float), np.asarray(p90_pred, dtype=float)
    return float(np.mean(y_true <= p90_pred))


def evaluate_quantile_forecast(y_true, p10, p50, p90) -> dict:
    return {
        "wape": wape(y_true, p50),
        "mae": mae(y_true, p50),
        "rmse": rmse(y_true, p50),
        "pinball_loss_p10": pinball_loss(y_true, p10, 0.10),
        "pinball_loss_p50": pinball_loss(y_true, p50, 0.50),
        "pinball_loss_p90": pinball_loss(y_true, p90, 0.90),
        "p90_coverage": p90_coverage(y_true, p90),
    }


def walk_forward_splits(df: pd.DataFrame, date_column: str, group_columns: list[str],
                         initial_train_window_days: int, step_days: int, horizon: int,
                         expanding: bool = True):
    """Yields (train_idx, test_idx) pairs, computed independently within
    each (route_id, vessel_type, freight_rate_unit) group so folds never
    cross lanes."""
    for _, g in df.groupby(group_columns):
        dates = g[date_column].sort_values().unique()
        if len(dates) == 0:
            continue
        train_end = pd.Timestamp(dates[0]) + pd.Timedelta(days=initial_train_window_days)

        while True:
            test_start = train_end
            test_end = test_start + pd.Timedelta(days=horizon)
            if test_end > dates[-1]:
                break

            if expanding:
                train_mask = g[date_column] <= train_end
            else:
                window_start = train_end - pd.Timedelta(days=initial_train_window_days)
                train_mask = (g[date_column] > window_start) & (g[date_column] <= train_end)

            test_mask = (g[date_column] > test_start) & (g[date_column] <= test_end)

            train_idx = g.index[train_mask]
            test_idx = g.index[test_mask]
            if len(test_idx) > 0 and len(train_idx) > 0:
                yield train_idx, test_idx

            train_end = train_end + pd.Timedelta(days=step_days)


def build_comparison_table(results: dict[str, dict]) -> pd.DataFrame:
    rows = []
    for model_name, m in results.items():
        rows.append({
            "Model": model_name,
            "WAPE": m.get("wape"),
            "MAE": m.get("mae"),
            "RMSE": m.get("rmse"),
            "P90 Coverage": m.get("p90_coverage"),
        })
    return pd.DataFrame(rows)
