"""
CargoPredict System Health Check Script.
Tests:
1. Backend HTTP connection & /api/health
2. Supabase PostgreSQL database connectivity & row count
3. Authentication endpoints for customer & admin
4. Real multi-horizon XGBoost inference (14D, 30D, 90D)
5. SPA route refresh fallback
"""
import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, path, headers=None, expected_code=200):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            assert resp.status == expected_code, f"Expected {expected_code}, got {resp.status}"
            print(f"[PASS] {name:30} -> {resp.status} OK")
            return data
    except Exception as e:
        print(f"[FAIL] {name:30} -> {e}")
        return None

def main():
    print("===================================================")
    print("CargoPredict System Health Check")
    print("===================================================\n")

    # 1. Health check
    health_data = test_endpoint("System Health API", "/api/health")
    if health_data:
        try:
            h = json.loads(health_data.decode("utf-8"))
            print(f"       App: {h.get('app_name')} v{h.get('version')}")
            print(f"       DB Status: {h.get('database', {}).get('status')}")
            print(f"       Rows in ml_freight_daily: {h.get('database', {}).get('ml_freight_daily_rows')}")
        except Exception:
            pass

    # 2. Login test
    token = None
    login_url = f"{BASE_URL}/api/auth/login"
    login_req = urllib.request.Request(
        login_url,
        data=json.dumps({"username": "dhruvil", "password": "dhruvil123"}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(login_req) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            token = res.get("access_token")
            print(f"[PASS] {'Authentication (dhruvil)':30} -> 200 OK (Role: {res['user']['role']})")
    except Exception as e:
        print(f"[FAIL] {'Authentication (dhruvil)':30} -> {e}")

    auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 3. ML Inference (14D, 30D, 90D)
    for h in [14, 30, 90]:
        ml_data = test_endpoint(f"ML Forecast ({h}D Horizon)", f"/api/forecasts/predict?route_id=R001&horizon_days={h}", headers=auth_headers)
        if ml_data:
            try:
                m = json.loads(ml_data.decode("utf-8"))
                rate = m.get("predicted_rate", m.get("predicted_rate_usd_per_mt"))
                print(f"       Predicted Rate: ${rate:.2f}/MT | Model: {m.get('model_name')}")
            except Exception:
                pass

    # 4. SPA Routes on Refresh
    for route in ["/", "/dashboard", "/forecast", "/new-analysis", "/admin"]:
        test_endpoint(f"SPA Refresh: {route}", route)

    print("\n===================================================")
    print("Health check finished.")
    print("===================================================")

if __name__ == "__main__":
    main()
