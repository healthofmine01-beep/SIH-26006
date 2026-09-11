"""
inference.py
------------
The single entry point for a forecast. This is the module that stands
between "we have a model object" and "we tell Member 4 a number" — it
will NOT emit p10/p50/p90 as if they were real unless the readiness
gate says the group is READY.

Three possible outcomes per (route_id, vessel_type, freight_rate_unit,
horizon) request:

  READY                        -> real quantile forecast, trained on
                                   verified data, confidence populated
  INSUFFICIENT_VERIFIED_TARGET_DATA
                                -> p10/p50/p90 are null, `message`
                                   explains why, nothing is fabricated
  SIMULATED_DEMO_ONLY           -> only returned if the caller explicitly
                                   asks for a demo/plumbing check; numbers
                                   are populated but clearly flagged as
                                   not representing a real forecast
"""

from __future__ import annotations
import pandas as pd
import yaml

from .data_contract import DataContract
from .data_loader import load_all
from .readiness import assess_group
from .xgboost_model import QuantileXGBForecaster, confidence_from_interval


class ForecastEngine:
    def __init__(self, config_path: str = "configs/model_config.yaml",
                 validation_rules_path: str = "configs/validation_rules.yaml"):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)
        self.contract = DataContract(validation_rules_path, self.config)
        self.datasets = load_all(self.config)
        self.feature_cols = self.config["feature_columns"]
        self._trained_models: dict[tuple, QuantileXGBForecaster] = {}

    # ---- real training path (currently blocked by data readiness) --------

    def train_group(self, route_id: str, vessel_type: str, freight_rate_unit: str,
                     horizon: int) -> dict:
        """Attempts to fit a real quantile model for this lane/horizon.
        Returns the readiness verdict; only actually fits if READY."""
        training_df = self.datasets["training_eligible"]
        min_rows = self.config["min_training_rows_per_group"]
        verdict = assess_group(training_df, self.contract, route_id, vessel_type,
                                freight_rate_unit, horizon, min_rows)

        if verdict["verdict"] != "READY":
            return verdict

        mask = self.contract.is_training_eligible(training_df)
        mask &= training_df["route_id"].eq(route_id)
        mask &= training_df["vessel_type"].eq(vessel_type)
        mask &= training_df["freight_rate_unit"].eq(freight_rate_unit)
        group_df = training_df[mask].sort_values(self.config["data"]["date_column"])

        target_col = self.contract.target_column_for_unit(freight_rate_unit)
        # Only require the TARGET to be present. Feature columns may be
        # legitimately null (e.g. bdi_lag_1/bunker_price_lag_1 are 0% populated
        # in the current data) — XGBoost handles missing feature values natively
        # via its split logic, so we don't discard rows over them.
        group_df = group_df.dropna(subset=[target_col])
        group_df["_target_h"] = group_df[target_col].shift(-horizon)
        group_df = group_df.dropna(subset=["_target_h"])

        weights = self.contract.quality_weight(group_df) if self.config["quality_weighting"]["enabled"] else None

        model = QuantileXGBForecaster(
            quantiles=self.config["models"]["xgboost"]["quantiles"],
            params=self.config["models"]["xgboost"]["params"],
        )
        model.fit(group_df[self.feature_cols], group_df["_target_h"], sample_weight=weights)
        self._trained_models[(route_id, vessel_type, freight_rate_unit, horizon)] = model
        verdict["trained"] = True
        return verdict

    # ---- the honest handoff -----------------------------------------------

    def predict(self, route_id: str, vessel_type: str, freight_rate_unit: str,
                horizon: int) -> dict:
        base = {
            "route_id": route_id,
            "vessel_type": vessel_type,
            "freight_rate_unit": freight_rate_unit,
            "forecast_horizon": horizon,
            "p10": None, "p50": None, "p90": None, "confidence": None,
        }

        key = (route_id, vessel_type, freight_rate_unit, horizon)
        if key not in self._trained_models:
            self.train_group(route_id, vessel_type, freight_rate_unit, horizon)

        if key not in self._trained_models:
            base["status"] = "INSUFFICIENT_VERIFIED_TARGET_DATA"
            base["message"] = (
                "No verified, training-eligible data for this route/vessel/unit. "
                "Per README_MEMBER3.md this engine will not fabricate a forecast "
                "from SIMULATED or UNVERIFIED rows. Use predict_demo() explicitly "
                "if you need a plumbing/schema check instead."
            )
            return base

        model = self._trained_models[key]
        training_df = self.datasets["training_eligible"]
        mask = training_df["route_id"].eq(route_id) & training_df["vessel_type"].eq(vessel_type) \
            & training_df["freight_rate_unit"].eq(freight_rate_unit)
        latest = training_df[mask].sort_values(self.config["data"]["date_column"]).tail(1)

        preds = model.predict(latest[self.feature_cols])
        p10, p50, p90 = float(preds["p10"].iloc[0]), float(preds["p50"].iloc[0]), float(preds["p90"].iloc[0])
        conf = float(confidence_from_interval(
            preds["p10"].to_numpy(), preds["p50"].to_numpy(), preds["p90"].to_numpy()
        )[0])

        base.update({"status": "READY", "p10": round(p10, 2), "p50": round(p50, 2),
                     "p90": round(p90, 2), "confidence": round(conf, 2)})
        return base

    def predict_demo(self, route_id: str, vessel_type: str, freight_rate_unit: str,
                      horizon: int) -> dict:
        """
        Explicit, opt-in plumbing check using CODEXA_M3_Demo_Integration.csv
        (SIMULATED data). Numbers come back populated so you can verify the
        pipeline works end-to-end, but the output is clearly flagged and
        must never be reported as a real forecast or accuracy figure.
        """
        demo_df = self.datasets["demo_integration"]
        mask = demo_df["route_id"].eq(route_id) & demo_df["vessel_type"].eq(vessel_type) \
            & demo_df["freight_rate_unit"].eq(freight_rate_unit)
        group_df = demo_df[mask].sort_values(self.config["data"]["date_column"]).copy()

        target_col = self.contract.target_column_for_unit(freight_rate_unit)
        group_df["_target_h"] = group_df[target_col].shift(-horizon)
        # Only require the target; XGBoost handles missing feature values
        # (e.g. bdi_lag_1/bunker_price_lag_1, 0% populated in this demo) natively.
        fit_df = group_df.dropna(subset=["_target_h"])

        base = {
            "route_id": route_id, "vessel_type": vessel_type,
            "freight_rate_unit": freight_rate_unit, "forecast_horizon": horizon,
            "status": "SIMULATED_DEMO_ONLY",
            "p10": None, "p50": None, "p90": None, "confidence": None,
            "message": "SIMULATED data (training_eligible=false). Pipeline/schema "
                       "validation only — not a real forecast, do not report as accuracy.",
        }
        if len(fit_df) < 10:
            base["message"] += " Not enough demo rows even for a plumbing check."
            return base

        model = QuantileXGBForecaster(
            quantiles=self.config["models"]["xgboost"]["quantiles"],
            params={"n_estimators": 50, "max_depth": 3},  # tiny model, it's a smoke test
        )
        model.fit(fit_df[self.feature_cols], fit_df["_target_h"])
        latest = group_df.tail(1)
        preds = model.predict(latest[self.feature_cols])

        base.update({
            "p10": round(float(preds["p10"].iloc[0]), 2),
            "p50": round(float(preds["p50"].iloc[0]), 2),
            "p90": round(float(preds["p90"].iloc[0]), 2),
        })
        return base
