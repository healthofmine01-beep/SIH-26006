"""
FastAPI API routers package for CargoPredict.
"""
from app.api import auth, forecasts, maritime, optimize, admin

__all__ = ["auth", "forecasts", "maritime", "optimize", "admin"]
