"""
Authentication and Authorization Module for CargoPredict.
Provides PBKDF2-HMAC-SHA256 password hashing, secure token generation,
exact required user seeding, and FastAPI security dependencies.
"""
import hmac
import hashlib
import secrets
import json
import base64
import time
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import SECRET_KEY, TOKEN_EXPIRY_HOURS
from app.db import get_connection, execute_dict_query, init_app_storage

security_bearer = HTTPBearer(auto_error=False)

# In-memory fast cache and resilient fallback store for exact requested accounts
ACCOUNTS_SEED = {
    "dhruvil": {
        "password": "dhruvil123",
        "role": "customer",
        "full_name": "Dhruvil Bhavsar",
        "default_route": "R001",
        "default_vessel": "Capesize",
        "theme": "dark"
    },
    "dwip": {
        "password": "dwip123",
        "role": "customer",
        "full_name": "Dwip Dalwadi",
        "default_route": "R002",
        "default_vessel": "Panamax",
        "theme": "dark"
    },
    "admin": {
        "password": "admin123",
        "role": "admin",
        "full_name": "System Administrator",
        "default_route": "R001",
        "default_vessel": "Capesize",
        "theme": "dark"
    }
}

# User preferences in-memory fallback
USER_SETTINGS_STORE = {}

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Generates a secure PBKDF2-HMAC-SHA256 password hash."""
    if not salt:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return dk.hex(), salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Verifies a password against the stored PBKDF2 hash."""
    dk = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return hmac.compare_digest(dk.hex(), stored_hash)

def create_access_token(data: dict, expires_in_seconds: int = None) -> str:
    """Creates a signed, URL-safe base64 authentication token with HMAC-SHA256 signature."""
    if expires_in_seconds is None:
        expires_in_seconds = TOKEN_EXPIRY_HOURS * 3600

    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_in_seconds
    payload_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode('utf-8').rstrip('=')

    sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"

def verify_access_token(token: str) -> Optional[dict]:
    """Decodes and validates token signature and expiry."""
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None
        payload_b64, sig = parts
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), payload_b64.encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None

        # Add padding back
        padding = 4 - (len(payload_b64) % 4)
        if padding != 4:
            payload_b64 += '=' * padding
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))

        if payload.get("exp", 0) < time.time():
            return None  # Token expired

        return payload
    except Exception:
        return None

def seed_users():
    """Ensures exact required users exist in PostgreSQL and in-memory cache."""
    init_app_storage()
    for username, info in ACCOUNTS_SEED.items():
        pwd_hash, salt = hash_password(info["password"])
        # Seed into in-memory settings store
        if username not in USER_SETTINGS_STORE:
            USER_SETTINGS_STORE[username] = {
                "theme": info.get("theme", "dark"),
                "default_route": info.get("default_route", "R001"),
                "default_vessel": info.get("default_vessel", "Capesize"),
                "currency": "USD",
                "notifications_enabled": True,
                "saved_scenarios": []
            }
        # Attempt to seed into PostgreSQL table
        try:
            with get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO cargopredict_app.users (username, password_hash, salt, role, full_name)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (username) DO UPDATE 
                        SET password_hash = EXCLUDED.password_hash,
                            salt = EXCLUDED.salt,
                            role = EXCLUDED.role,
                            full_name = EXCLUDED.full_name;
                    """, (username, pwd_hash, salt, info["role"], info["full_name"]))

                    cur.execute("""
                        INSERT INTO cargopredict_app.user_settings (username, theme, default_route, default_vessel, currency)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (username) DO NOTHING;
                    """, (username, info.get("theme", "dark"), info.get("default_route", "R001"), info.get("default_vessel", "Capesize"), "USD"))
        except Exception as e:
            print(f"User seed DB notice for {username}: {e}")

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Authenticates username and password against database and seed store."""
    username = username.strip().lower()
    # Check DB first
    try:
        user_row = execute_dict_query(
            "SELECT username, password_hash, salt, role, full_name FROM cargopredict_app.users WHERE username = %s;",
            (username,),
            fetch_one=True
        )
        if user_row and verify_password(password, user_row["password_hash"], user_row["salt"]):
            # Update last login timestamp in DB
            try:
                with get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("UPDATE cargopredict_app.users SET last_login = CURRENT_TIMESTAMP WHERE username = %s;", (username,))
            except Exception:
                pass
            return {
                "username": user_row["username"],
                "role": user_row["role"],
                "full_name": user_row["full_name"]
            }
    except Exception:
        pass

    # Fallback to exact seed accounts
    if username in ACCOUNTS_SEED and ACCOUNTS_SEED[username]["password"] == password:
        return {
            "username": username,
            "role": ACCOUNTS_SEED[username]["role"],
            "full_name": ACCOUNTS_SEED[username]["full_name"]
        }
    return None

def get_user_settings(username: str) -> dict:
    """Fetches user settings from database or fallback cache."""
    try:
        settings_row = execute_dict_query(
            "SELECT theme, default_route, default_vessel, currency, notifications_enabled, saved_scenarios FROM cargopredict_app.user_settings WHERE username = %s;",
            (username,),
            fetch_one=True
        )
        if settings_row:
            if isinstance(settings_row.get("saved_scenarios"), str):
                try:
                    settings_row["saved_scenarios"] = json.loads(settings_row["saved_scenarios"])
                except Exception:
                    settings_row["saved_scenarios"] = []
            return settings_row
    except Exception:
        pass

    return USER_SETTINGS_STORE.get(username, {
        "theme": "dark",
        "default_route": "R001",
        "default_vessel": "Capesize",
        "currency": "USD",
        "notifications_enabled": True,
        "saved_scenarios": []
    })

def update_user_settings(username: str, new_settings: dict) -> dict:
    """Updates user settings in database and cache."""
    current = get_user_settings(username)
    current.update(new_settings)
    USER_SETTINGS_STORE[username] = current

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                scenarios_json = json.dumps(current.get("saved_scenarios", []))
                cur.execute("""
                    INSERT INTO cargopredict_app.user_settings (username, theme, default_route, default_vessel, currency, notifications_enabled, saved_scenarios, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (username) DO UPDATE
                    SET theme = EXCLUDED.theme,
                        default_route = EXCLUDED.default_route,
                        default_vessel = EXCLUDED.default_vessel,
                        currency = EXCLUDED.currency,
                        notifications_enabled = EXCLUDED.notifications_enabled,
                        saved_scenarios = EXCLUDED.saved_scenarios,
                        updated_at = CURRENT_TIMESTAMP;
                """, (
                    username,
                    current.get("theme", "dark"),
                    current.get("default_route", "R001"),
                    current.get("default_vessel", "Capesize"),
                    current.get("currency", "USD"),
                    current.get("notifications_enabled", True),
                    scenarios_json
                ))
    except Exception as e:
        print(f"Could not persist settings to DB: {e}")

    return current

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> dict:
    """FastAPI dependency to extract and authenticate current user from Bearer header or cookie."""
    token = None
    if credentials:
        token = credentials.credentials
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")
    elif "Authorization" in request.headers:
        auth_header = request.headers.get("Authorization")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = verify_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return {
        "username": payload["sub"],
        "role": payload.get("role", "customer"),
        "full_name": payload.get("full_name", payload["sub"])
    }

async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """FastAPI dependency enforcing Admin role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource."
        )
    return current_user
