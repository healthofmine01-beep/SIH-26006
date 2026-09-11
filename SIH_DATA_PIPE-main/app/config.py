"""
CargoPredict Application Configuration
Loads database credentials and application settings safely from .env.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from project root
load_dotenv(BASE_DIR / ".env")

# Supabase PostgreSQL connection string
SUPABASE_DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")
if not SUPABASE_DATABASE_URL:
    user = os.getenv("POSTGRES_USER", "cargopredict")
    password = os.getenv("POSTGRES_PASSWORD", "cargopredict")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "cargopredict_db")
    SUPABASE_DATABASE_URL = f"postgresql://{user}:{password}@{host}:{port}/{db}"

# Application Security
SECRET_KEY = os.getenv("CARGOPREDICT_SECRET_KEY", "cargopredict-production-secret-key-2026-secure-sih")
TOKEN_EXPIRY_HOURS = int(os.getenv("TOKEN_EXPIRY_HOURS", "24"))

# Application Metadata
APP_NAME = "CargoPredict"
APP_VERSION = "2.4.0"
APP_DESCRIPTION = "Enterprise Maritime Freight Forecasting & Decision-Support System"

# Host & Port
APP_HOST = os.getenv("APP_HOST", "127.0.0.1")
APP_PORT = int(os.getenv("APP_PORT", "8000"))
