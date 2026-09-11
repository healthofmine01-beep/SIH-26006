"""
readiness.py
------------
This is the module that actually enforces "don't report accuracy from
data that isn't verified." It reproduces the same style of verdict as
CODEXA_M3_Data_Readiness_Summary.json, but scoped per (route_id,
vessel_type, freight_rate_unit, horizon) group, since a project could
plausibly have verified data for one lane and not another.

Any code path that wants to fit a real model MUST go through
`assess_group()` first and respect its verdict.
"""

from __future__ import annotations
import pandas as pd

from .data_contract import DataContract


def overall_verdict(datasets: dict[str, pd.DataFrame], contract: DataContract) -> dict:
    training_df = datasets["training_eligible"]
    eligible_mask = contract.is_training_eligible(training_df) if len(training_df) else pd.Series(dtype=bool)
    n_eligible = int(eligible_mask.sum())

    return {
        "training_eligible_rows": n_eligible,
        "demo_rows": len(datasets["demo_integration"]),
        "excluded_unverified_rows": len(datasets["excluded_rows"]),
        "verdict": "READY" if n_eligible > 0 else "INSUFFICIENT_VERIFIED_TARGET_DATA",
        "message": (
            "Verified, training-eligible target rows are available."
            if n_eligible > 0 else
            "Zero rows in CODEXA_M3_Training_Eligible.csv pass the training-eligibility "
            "gate (training_eligible=True AND data_status in REAL/DERIVED). Per "
            "README_MEMBER3.md, do not report model accuracy from the demo or "
            "excluded-rows files. See CODEXA_M2_to_M3_Data_Contract.md 'Data still "
            "required' for what's needed to unblock this."
        ),
    }


def assess_group(training_df: pd.DataFrame, contract: DataContract,
                  route_id: str, vessel_type: str, freight_rate_unit: str,
                  horizon: int, min_rows: int) -> dict:
    """Per-lane readiness check. Returns a verdict dict; never returns
    forecast numbers itself — that's inference.py's job, and it must
    check this verdict first."""
    if len(training_df) == 0:
        n = 0
    else:
        mask = contract.is_training_eligible(training_df)
        mask &= training_df["route_id"].eq(route_id)
        mask &= training_df["vessel_type"].eq(vessel_type)
        mask &= training_df["freight_rate_unit"].eq(freight_rate_unit)
        n = int(mask.sum())

    ready = n >= min_rows
    return {
        "route_id": route_id,
        "vessel_type": vessel_type,
        "freight_rate_unit": freight_rate_unit,
        "forecast_horizon": horizon,
        "eligible_rows": n,
        "min_rows_required": min_rows,
        "verdict": "READY" if ready else "INSUFFICIENT_VERIFIED_TARGET_DATA",
    }
