"""
Database connection and execution layer for CargoPredict.
Manages connection pooling and query execution against Supabase PostgreSQL.
"""
import os
import json
import decimal
import datetime
from contextlib import contextmanager
import psycopg
from psycopg.rows import dict_row
from app.config import SUPABASE_DATABASE_URL

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

def sanitize_row(row: dict) -> dict:
    """Ensure all Decimals, dates, UUIDs are converted to native JSON serializable types."""
    res = {}
    for k, v in row.items():
        if isinstance(v, decimal.Decimal):
            res[k] = float(v)
        elif isinstance(v, (datetime.date, datetime.datetime)):
            res[k] = v.isoformat()
        else:
            res[k] = v
    return res

@contextmanager
def get_connection():
    """Yields an active connection with proper SSL and pooler settings."""
    conn = None
    try:
        conn = psycopg.connect(
            SUPABASE_DATABASE_URL,
            sslmode="require",
            connect_timeout=15,
            autocommit=True,
            application_name="cargopredict_app",
            prepare_threshold=None  # Essential for Supabase transaction poolers
        )
        yield conn
    finally:
        if conn is not None and not conn.closed:
            conn.close()

def execute_query(query: str, params: tuple = None, fetch: str = "all"):
    """Execute a query returning raw rows."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            if fetch == "all":
                return cur.fetchall()
            elif fetch == "one":
                return cur.fetchone()
            return None

def execute_dict_query(query: str, params: tuple = None, fetch_one: bool = False):
    """Execute a query returning row(s) as Python dictionary with sanitized values."""
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(query, params or ())
            if fetch_one:
                row = cur.fetchone()
                return sanitize_row(row) if row else None
            rows = cur.fetchall()
            return [sanitize_row(r) for r in rows]

def init_app_storage():
    """Initializes user management and settings storage in Supabase PostgreSQL."""
    create_schema_sql = """
    CREATE SCHEMA IF NOT EXISTS cargopredict_app;

    CREATE TABLE IF NOT EXISTS cargopredict_app.users (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT NOT NULL,
        full_name TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS cargopredict_app.user_settings (
        username TEXT PRIMARY KEY REFERENCES cargopredict_app.users(username),
        theme TEXT DEFAULT 'dark',
        default_route TEXT DEFAULT 'R001',
        default_vessel TEXT DEFAULT 'Capesize',
        currency TEXT DEFAULT 'USD',
        notifications_enabled BOOLEAN DEFAULT TRUE,
        saved_scenarios TEXT DEFAULT '[]',
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    """
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(create_schema_sql)
        print("Initialized cargopredict_app storage in PostgreSQL.")
    except Exception as e:
        print(f"PostgreSQL storage init error (using graceful fallback if needed): {e}")
