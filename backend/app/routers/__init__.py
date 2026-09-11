"""
Routers backward compatibility proxy.
Delegates to app.api.* routers.
"""
from app.api import (
    admin as admin_routes,
    auth as auth_routes,
    forecasts as forecast_routes,
    maritime as maritime_routes,
    optimize as optimization_routes
)

__all__ = [
    "admin_routes",
    "auth_routes",
    "forecast_routes",
    "maritime_routes",
    "optimization_routes"
]
