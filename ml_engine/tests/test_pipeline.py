"""
test_pipeline.py
-----------------
Runs against your ACTUAL uploaded files (data/incoming/), not synthetic
data. This is deliberate: the most important thing to prove right now
isn't "can XGBoost fit a curve" — it's "does the engine correctly
refuse to fabricate a forecast given the data you actually have."
"""

import sys
from pathlib import Path
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.data_loader import load_all, load_config
from src.data_contract import DataContract
from src.readiness import overall_verdict, assess_group
from src.inference import ForecastEngine

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "configs" / "model_config.yaml"
RULES_PATH = ROOT / "configs" / "validation_rules.yaml"


@pytest.fixture(scope="module")
def config():
    return load_config(str(CONFIG_PATH))


@pytest.fixture(scope="module")
def contract(config):
    return DataContract(str(RULES_PATH), config)


@pytest.fixture(scope="module")
def datasets(config):
    import os
    os.chdir(ROOT)  # so relative paths in config resolve
    return load_all(config)


def test_training_eligible_file_is_currently_empty(datasets):
    """Documents the actual current state — if this ever fails because
    someone dropped in 0 real rows, that's GOOD news and this test
    should be updated."""
    assert len(datasets["training_eligible"]) == 0


def test_demo_rows_are_all_simulated_and_not_training_eligible(datasets):
    demo = datasets["demo_integration"]
    assert len(demo) == 45
    assert (demo["data_status"] == "SIMULATED").all()
    assert (demo["training_eligible"] == False).all()


def test_excluded_rows_are_all_unverified(datasets):
    excluded = datasets["excluded_rows"]
    assert len(excluded) == 30
    assert (excluded["data_status"] == "UNVERIFIED").all()


def test_overall_verdict_matches_readiness_report(datasets, contract):
    verdict = overall_verdict(datasets, contract)
    assert verdict["verdict"] == "INSUFFICIENT_VERIFIED_TARGET_DATA"
    assert verdict["training_eligible_rows"] == 0


def test_is_training_eligible_never_passes_simulated_rows(datasets, contract):
    """Even if a bug somewhere set training_eligible=True on a SIMULATED
    row, the data_status check must still block it."""
    demo = datasets["demo_integration"].copy()
    demo["training_eligible"] = True  # simulate the bug
    mask = contract.is_training_eligible(demo)
    assert not mask.any(), "SIMULATED rows must never pass the training-eligibility gate"


def test_quality_weight_matches_validation_rules_scale(datasets, contract):
    demo = datasets["demo_integration"]
    weights = contract.quality_weight(demo)
    # observed demo data_quality_score is 0.7 (the "warning" weight) — already 0-1 scale
    assert weights.between(0, 1).all()
    assert abs(weights.iloc[0] - 0.7) < 1e-6


def test_predict_refuses_when_data_insufficient(config):
    import os
    os.chdir(ROOT)
    engine = ForecastEngine(str(CONFIG_PATH), str(RULES_PATH))
    result = engine.predict("AU-PPA", "SUPRAMAX", "USD_PER_DAY", horizon=7)
    assert result["status"] == "INSUFFICIENT_VERIFIED_TARGET_DATA"
    assert result["p10"] is None and result["p50"] is None and result["p90"] is None


def test_predict_demo_runs_as_explicit_plumbing_check_only():
    import os
    os.chdir(ROOT)
    engine = ForecastEngine(str(CONFIG_PATH), str(RULES_PATH))
    result = engine.predict_demo("AU-PPA", "SUPRAMAX", "USD_PER_DAY", horizon=7)
    assert result["status"] == "SIMULATED_DEMO_ONLY"
    assert "not a real forecast" in result["message"]
    # numbers should be populated (pipeline works) but explicitly flagged
    if result["p50"] is not None:
        assert result["p10"] <= result["p50"] <= result["p90"]


def test_assess_group_reports_zero_rows_for_every_real_group(datasets, contract, config):
    # any plausible route/vessel query against the empty training file
    # must report 0 eligible rows, never a fabricated positive count
    verdict = assess_group(datasets["training_eligible"], contract,
                            "AU-PPA", "SUPRAMAX", "USD_PER_DAY", 7,
                            config["min_training_rows_per_group"])
    assert verdict["eligible_rows"] == 0
    assert verdict["verdict"] == "INSUFFICIENT_VERIFIED_TARGET_DATA"
