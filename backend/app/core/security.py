"""
Core security utilities for CargoPredict:
Password hashing (PBKDF2-HMAC-SHA256) and JWT token generation/validation.
"""
import time
import json
import base64
import hashlib
import hmac
import secrets
from typing import Optional
from app.core.config import SECRET_KEY, TOKEN_EXPIRY_HOURS

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
