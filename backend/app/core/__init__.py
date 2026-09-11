"""
Core configuration and security package for CargoPredict.
"""
from app.core.config import (
    APP_NAME,
    APP_VERSION,
    APP_DESCRIPTION,
    APP_HOST,
    APP_PORT,
    SECRET_KEY,
    TOKEN_EXPIRY_HOURS,
    SUPABASE_DATABASE_URL
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token
)

__all__ = [
    "APP_NAME",
    "APP_VERSION",
    "APP_DESCRIPTION",
    "APP_HOST",
    "APP_PORT",
    "SECRET_KEY",
    "TOKEN_EXPIRY_HOURS",
    "SUPABASE_DATABASE_URL",
    "hash_password",
    "verify_password",
    "create_access_token",
    "verify_access_token"
]
