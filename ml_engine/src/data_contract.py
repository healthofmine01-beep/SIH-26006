"""
data_contract.py
-----------------
Encodes the rules from CODEXA_M2_to_M3_Data_Contract.md and
validation_rules.yaml as executable checks, instead of leaving them as
prose that's easy to accidentally violate in a notebook.

Key rules enforced here:
- data_status of SIMULATED/UNVERIFIED/TEMPLATE never counts toward training,
  regardless of what any single flag says elsewhere.
- freight_rate_usd_per_mt and freight_rate_usd_per_day are never combined
  or converted into each other.
- Missing values mean "unavailable", never invented/imputed with a guess.
"""

from __future__ import annotations
from pathlib import Path
import yaml
import pandas as pd


class DataContract:
    def __init__(self, validation_rules_path: str, model_config: dict):
        with open(validation_rules_path) as f:
            self.rules = yaml.safe_load(f)
        self.config = model_config

    # ---- status / eligibility ----------------------------------------

    @property
    def training_allowed_status(self) -> set[str]:
        return set(self.config["training_allowed_data_status"])

    def is_training_eligible(self, df: pd.DataFrame) -> pd.Series:
        """
        Row-level boolean mask. A row only counts toward training if:
        1. its own `training_eligible` flag is True, AND
        2. its `data_status` is REAL or DERIVED (never SIMULATED/UNVERIFIED/TEMPLATE),
           even if some upstream flag claims otherwise.
        """
        te_col = self.config["data"]["training_eligible_column"]
        status_col = self.config["data"]["data_status_column"]

        te = df[te_col].astype(bool) if te_col in df.columns else pd.Series(False, index=df.index)

        def _status_ok(s: str) -> bool:
            # data_status can be pipe-delimited, e.g. "REAL|DERIVED"
            parts = set(str(s).split("|"))
            return bool(parts & self.training_allowed_status)

        status_ok = df[status_col].apply(_status_ok) if status_col in df.columns else pd.Series(False, index=df.index)
        return te & status_ok

    # ---- quality weighting ---------------------------------------------

    def quality_weight(self, df: pd.DataFrame) -> pd.Series:
        """
        Per-row sample weight from data_quality_score. Auto-detects 0-1 vs
        0-100 scale (the data dictionary says 0-100; the actual files
        observed so far are 0-1 — handle both defensively).
        """
        col = self.config["data"]["quality_score_column"]
        if col not in df.columns:
            return pd.Series(1.0, index=df.index)
        scores = pd.to_numeric(df[col], errors="coerce")
        if scores.max(skipna=True) is not None and scores.max(skipna=True) > 1.0:
            scores = scores / 100.0
        return scores.fillna(0.0).clip(0.0, 1.0)

    # ---- freshness / plausibility (defense-in-depth on top of Member 2's own checks) --

    def flag_stale(self, df: pd.DataFrame, freshness_col: str = "source_freshness_hours") -> pd.Series:
        if freshness_col not in df.columns:
            return pd.Series(False, index=df.index)
        hours = pd.to_numeric(df[freshness_col], errors="coerce")
        return hours > self.rules["stale_warning_hours"]

    def flag_extreme_change(self, df: pd.DataFrame, change_col: str = "freight_change_7d") -> pd.Series:
        if change_col not in df.columns:
            return pd.Series(False, index=df.index)
        pct = pd.to_numeric(df[change_col], errors="coerce")
        return pct.abs() > self.rules["extreme_freight_pct_change"]

    def target_column_for_unit(self, unit: str) -> str:
        """Never convert between units — pick the right target column for
        whichever unit this route/vessel/group actually uses."""
        targets = self.config["data"]["target_columns"]
        if unit == "USD_PER_MT":
            return targets["usd_per_mt"]
        elif unit == "USD_PER_DAY":
            return targets["usd_per_day"]
        raise ValueError(
            f"Unrecognized freight_rate_unit '{unit}'. Allowed: "
            f"{self.rules['allowed_freight_units']}. Never guess/convert."
        )
