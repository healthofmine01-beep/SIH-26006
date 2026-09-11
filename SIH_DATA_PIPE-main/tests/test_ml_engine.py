"""
Dedicated Integration Tests for CargoPredict ML Engine.
Verifies real-time multi-horizon XGBoost inference, Supabase feature vector extraction,
scenario parameter sensitivity, and optimization integration.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ml_engine import MLForecastEngine

client = TestClient(app)


def test_ml_engine_singleton_and_artifacts():
    """Verify MLForecastEngine singleton can load all 3 XGBoost artifacts."""
    engine = MLForecastEngine.get_instance()
    for horizon in [14, 30, 90]:
        art = engine.load_artifact(horizon)
        assert art is not None
        assert "model" in art
        assert "preprocessor" in art
        assert "features" in art
        assert len(art["features"]) == 30


def test_feature_vector_extraction_supabase():
    """Verify feature vector query from ml.ml_freight_daily returns expected float types."""
    engine = MLForecastEngine.get_instance()
    features = engine.fetch_feature_vector(route_id="R001", vessel_class="Capesize")
    assert features is not None
    assert features["route_id"] == "R001"
    assert features["vessel_class"] == "Capesize"
    assert isinstance(features["freight_rate_usd_per_mt"], float)
    assert isinstance(features["distance_nm"], float)
    assert isinstance(features["bdi_proxy"], float)
    assert isinstance(features["vlsfo_singapore_usd_per_mt"], float)
    assert features["distance_nm"] > 0
    assert features["bdi_proxy"] > 0


def test_xgboost_14d_inference():
    """Verify 14-day inference executes xgboost_14d.joblib and returns plausible bounds."""
    engine = MLForecastEngine.get_instance()
    res = engine.predict(route_id="R001", vessel_class="Capesize", horizon=14)
    assert res["status"] == "SUCCESS"
    assert "14D" in res["model_name"]
    assert res["horizon"] == 14
    assert res["predicted_rate"] > 0
    assert res["p10"] <= res["p50"] <= res["p90"]
    assert res["ci_lower"] <= res["predicted_rate"] <= res["ci_upper"]
    assert res["features_used_count"] == 30
    assert len(res["trajectory"]) > 0


def test_xgboost_30d_inference():
    """Verify 30-day inference executes xgboost_30d.joblib."""
    engine = MLForecastEngine.get_instance()
    res = engine.predict(route_id="R002", vessel_class="Capesize", horizon=30)
    assert res["status"] == "SUCCESS"
    assert "30D" in res["model_name"]
    assert res["horizon"] == 30
    assert res["predicted_rate"] > 0
    assert res["p10"] <= res["p50"] <= res["p90"]


def test_xgboost_90d_inference():
    """Verify 90-day inference executes xgboost_90d.joblib."""
    engine = MLForecastEngine.get_instance()
    res = engine.predict(route_id="R003", vessel_class="Supramax", horizon=90)
    assert res["status"] == "SUCCESS"
    assert "90D" in res["model_name"]
    assert res["horizon"] == 90
    assert res["predicted_rate"] > 0
    assert res["p10"] <= res["p50"] <= res["p90"]


def test_scenario_sensitivity_bunker_fuel():
    """Verify that a positive bunker fuel shock scenario is applied to model input."""
    engine = MLForecastEngine.get_instance()
    base = engine.predict(route_id="R001", vessel_class="Capesize", horizon=14, bunker_vlsfo_delta_pct=0.0)
    shock = engine.predict(route_id="R001", vessel_class="Capesize", horizon=14, bunker_vlsfo_delta_pct=25.0)
    assert shock["status"] == "SUCCESS"
    assert shock["scenario_applied"]["bunker_vlsfo_delta_pct"] == 25.0
    assert shock["predicted_rate"] > 0
    # Modifying fuel change alters feature vector inputs into the XGBoost transformer
    assert shock["rate_delta"] is not None


def test_scenario_sensitivity_vessel_supply():
    """Verify that an increase in vessel supply is applied to model input."""
    engine = MLForecastEngine.get_instance()
    base = engine.predict(route_id="R001", vessel_class="Capesize", horizon=14, vessel_supply_delta_pct=0.0)
    supply_boom = engine.predict(route_id="R001", vessel_class="Capesize", horizon=14, vessel_supply_delta_pct=30.0)
    assert supply_boom["status"] == "SUCCESS"
    assert supply_boom["scenario_applied"]["vessel_supply_delta_pct"] == 30.0
    assert supply_boom["predicted_rate"] > 0


def test_api_forecast_predict_endpoint_horizons():
    """Verify /api/forecasts/predict endpoint for all 3 horizons with authentication."""
    login_res = client.post("/api/auth/login", json={"username": "dhruvil", "password": "dhruvil123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    for h in [14, 30, 90]:
        res = client.get(f"/api/forecasts/predict?route_id=R001&horizon_days={h}", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["horizon_days"] == h
        assert data["predicted_rate_usd_per_mt"] > 0
        assert data["current_rate_usd_per_mt"] > 0
        assert data["p10"] <= data["p50"] <= data["p90"]
        assert len(data["forecast"]) == h
        assert "XGBoost" in data["model_name"]


def test_api_forecast_metrics_endpoint():
    """Verify /api/forecasts/metrics returns empirical metrics from model_comparison.csv."""
    login_res = client.post("/api/auth/login", json={"username": "dhruvil", "password": "dhruvil123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/forecasts/metrics", headers=headers)
    assert res.status_code == 200
    metrics = res.json()
    assert isinstance(metrics, list)
    assert len(metrics) >= 6
    horizons = {m["horizon"] for m in metrics if m["model"] == "XGBoost"}
    assert horizons == {14, 30, 90}
    # Verify MAE and RMSE are empirical numbers
    for m in metrics:
        if m["model"] == "XGBoost":
            assert 1.0 < m["mae"] < 2.0
            assert 1.0 < m["rmse"] < 2.5
            assert m["r2"] > 0.90


def test_api_admin_model_metrics_endpoint():
    """Verify /api/admin/model-metrics works for admin and rejects unauthenticated."""
    unauth = client.get("/api/admin/model-metrics")
    assert unauth.status_code in [401, 403]

    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_res.json()["access_token"]
    res = client.get("/api/admin/model-metrics", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    metrics = res.json()
    assert isinstance(metrics, list)
    assert len(metrics) >= 6


def test_forecast_feeds_optimization_decision():
    """Verify that optimization uses ML forecast rate and propagates into landed cost."""
    login_res = client.post("/api/auth/login", json={"username": "dhruvil", "password": "dhruvil123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "cargoType": "Coking Coal",
        "cargoQuantity": 160000,
        "origin": "Hay Point, Australia",
        "destinationPort": "Visakhapatnam (Vizag), India",
        "contractPreference": "Spot",
        "targetDeliveryDate": "2026-09-14"
    }
    res = client.post("/api/optimize/analyze", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["estimatedRatePerTonne"] > 0
    assert data["totalFreightCost"] == round(data["estimatedRatePerTonne"] * 160000)
    assert "technicalDetails" in data
    assert "forecastModel" in data["technicalDetails"]
    assert "XGBoost 14D Regressor" in data["technicalDetails"]["forecastModel"]
    assert "mlPredictedRate" in data["technicalDetails"]
    assert data["technicalDetails"]["mlPredictedRate"] == data["estimatedRatePerTonne"]
    assert "mlSpotRate" in data["technicalDetails"]
    assert "mlP10" in data["technicalDetails"]
    assert "mlP90" in data["technicalDetails"]
