"""
Database layer for CargoPredict (backward compatibility proxy).
Re-exports connection and query execution functions from app.database.connection.
"""
from app.database.connection import (
    json_serial,
    sanitize_row,
    get_connection,
    execute_query,
    execute_dict_query,
    init_app_storage
)

__all__ = [
    "json_serial",
    "sanitize_row",
    "get_connection",
    "execute_query",
    "execute_dict_query",
    "init_app_storage"
]
