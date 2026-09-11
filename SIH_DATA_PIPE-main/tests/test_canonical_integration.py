"""
End-to-End Integration Tests for CargoPredict Application.
Verifies Supabase PostgreSQL database connectivity, authentication, RBAC,
forecasting, optimization analysis, and admin catalog endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import execute_dict_query

client = TestClient(app)

def test_health_and_database_connectivity():
    """Verify system health endpoint and connection to Supabase database."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["database"]["status"] == "HEALTHY"
    assert data["database"]["ml_freight_daily_rows"] == 19240

def test_supabase_database_table_counts():
    """Verify active tables in Supabase database."""
    tables = execute_dict_query("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema IN ('reference', 'synthetic', 'ml', 'audit')
        ORDER BY table_schema, table_name;
    """)
    active_tables = [t for t in tables if not t["table_name"].startswith('_cp_previous')]
    assert len(active_tables) >= 28, f"Expected 28 tables, found {len(active_tables)}"

def test_authentication_dhruvil():
    """Test login for customer account 'dhruvil'."""
    res = client.post("/api/auth/login", json={"username": "dhruvil", "password": "dhruvil123"})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "success"
    assert body["user"]["username"] == "dhruvil"
    assert body["user"]["role"] == "customer"
    assert "access_token" in body

def test_authentication_dwip():
    """Test login for customer account 'dwip'."""
    res = client.post("/api/auth/login", json={"username": "dwip", "password": "dwip123"})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "success"
    assert body["user"]["username"] == "dwip"
    assert body["user"]["role"] == "customer"

def test_authentication_admin():
    """Test login for admin account 'admin'."""
    res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "success"
    assert body["user"]["username"] == "admin"
    assert body["user"]["role"] == "admin"

def test_authentication_invalid_credentials():
    """Test login with invalid password."""
    res = client.post("/api/auth/login", json={"username": "dhruvil", "password": "wrongpassword"})
    assert res.status_code == 401

def test_rbac_customer_forbidden_from_admin():
    """Ensure customer account cannot access admin endpoints."""
    # Login as customer
    login_res = client.post("/api/auth/login", json={"username": "dhruvil", "password": "dhruvil123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to access admin database catalog
    admin_res = client.get("/api/admin/database-catalog", headers=headers)
    assert admin_res.status_code == 403

def test_rbac_admin_allowed_access():
    """Ensure admin account can access admin database catalog."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    admin_res = client.get("/api/admin/database-catalog", headers=headers)
    assert admin_res.status_code == 200
    catalog = admin_res.json()
    assert catalog["total_tables"] == 28
    assert len(catalog["tables"]) == 28
    assert catalog["database_status"] == "ONLINE (Healthy)"

def test_analyze_shipment_endpoint():
    """Test freight analysis calculation using real database constraints."""
    login_res = client.post("/api/auth/login", json={"username": "dhruvil", "password": "dhruvil123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "cargoType": "Coking Coal",
        "cargoQuantity": 160000,
        "origin": "Hay Point, Australia",
        "destinationPort": "Visakhapatnam (Vizag), India",
        "contractPreference": "Spot"
    }
    res = client.post("/api/optimize/analyze", json=payload, headers=headers)
    assert res.status_code == 200
    result = res.json()
    assert result["recommendedVessel"] == "Capesize"
    assert result["recommendedAction"] in ["BOOK NOW", "WAIT", "CONSIDER ALTERNATIVE"]
    assert result["estimatedRatePerTonne"] > 0
    assert result["totalFreightCost"] > 0
    assert "technicalDetails" in result
    assert result["technicalDetails"]["portMaxDraftMeters"] == 18.2

def test_analyze_shipment_draft_constraint_haldia():
    """Test that Haldia draft constraint triggers ALTERNATIVE recommendation for large parcels."""
    payload = {
        "cargoType": "Coking Coal",
        "cargoQuantity": 120000,
        "origin": "Gladstone, Australia",
        "destinationPort": "Haldia Port, India",
        "contractPreference": "Spot"
    }
    res = client.post("/api/optimize/analyze", json=payload)
    assert res.status_code == 200
    result = res.json()
    assert result["recommendedAction"] == "CONSIDER ALTERNATIVE"
    assert result["technicalDetails"]["portMaxDraftMeters"] == 8.8
    assert "draft" in result["reasons"]["portCompatibility"].lower()

def test_dashboard_summary_endpoint():
    """Test dashboard summary endpoint returning real Supabase metrics."""
    res = client.get("/api/maritime/dashboard-summary")
    assert res.status_code == 200
    data = res.json()
    assert "kpi_metrics" in data
    assert data["kpi_metrics"]["predictedFreightRate"] > 0
    assert "route_rates" in data
    assert len(data["route_rates"]) >= 8
    assert "forecast_data" in data
    assert len(data["forecast_data"]) > 0

def test_frontend_serving():
    """Test that root route serves canonical React frontend bundle."""
    res = client.get("/")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "<div id=\"root\"></div>" in res.text or "CargoPredict" in res.text
