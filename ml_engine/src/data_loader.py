"""
data_loader.py
--------------
Loads the three files Member 2/3 actually hand off, each tagged with an
explicit `provenance` label so a training-eligible row and a simulated
row can never be silently mixed downstream.

    training_eligible -> provenance="TRAINING_ELIGIBLE"   (0 rows today)
    demo_integration  -> provenance="SIMULATED_DEMO"       (schema/plumbing only)
    excluded_rows     -> provenance="EXCLUDED_UNVERIFIED"  (visibility only, never trained on)
"""

from __future__ import annotations
from pathlib import Path
import pandas as pd
import yaml


def _load_csv(path: str, provenance: str) -> pd.DataFrame:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Expected Member 2/3 handoff file not found: {p}")
    df = pd.read_csv(p)
    df["provenance"] = provenance
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
    return df


def load_all(config: dict) -> dict[str, pd.DataFrame]:
    files = config["data"]["files"]
    return {
        "training_eligible": _load_csv(files["training_eligible"], "TRAINING_ELIGIBLE"),
        "demo_integration": _load_csv(files["demo_integration"], "SIMULATED_DEMO"),
        "excluded_rows": _load_csv(files["excluded_rows"], "EXCLUDED_UNVERIFIED"),
    }


def load_config(config_path: str = "configs/model_config.yaml") -> dict:
    with open(config_path) as f:
        return yaml.safe_load(f)
