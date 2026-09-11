"""
Main FastAPI application entrypoint for CargoPredict.
Serves canonical React/TypeScript frontend and all secure API endpoints.
"""
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_NAME, APP_VERSION, APP_DESCRIPTION
from app.auth import seed_users
from app.db import execute_dict_query
from app.routers import (
    auth_routes,
    forecast_routes,
    optimization_routes,
    maritime_routes,
    admin_routes
)

BASE_DIR = Path(__file__).resolve().parent

# Path to the canonical React frontend dist folder
FRONTEND_DIST = BASE_DIR.parent.parent / "maritime---freight-forecasting-&-vessel-optimizer (3)" / "dist"

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_routes.router)
app.include_router(forecast_routes.router)
app.include_router(optimization_routes.router)
app.include_router(maritime_routes.router)
app.include_router(admin_routes.router)

# Mount canonical frontend static assets if dist exists
if FRONTEND_DIST.exists() and (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

@app.on_event("startup")
def on_startup():
    """Seed required accounts and initialize application storage."""
    print("CargoPredict starting up. Seeding accounts and initializing storage...")
    seed_users()
    print("CargoPredict ready.")

@app.get("/api/health", tags=["System"])
def health_check():
    """System health check endpoint verifying Supabase connectivity."""
    db_status = "HEALTHY"
    row_count = 0
    try:
        res = execute_dict_query("SELECT COUNT(*) as count FROM ml.ml_freight_daily;", fetch_one=True)
        row_count = res.get("count", 0) if res else 0
    except Exception as e:
        db_status = f"ERROR: {str(e)[:100]}"

    return {
        "status": "UP",
        "app_name": APP_NAME,
        "version": APP_VERSION,
        "database": {
            "status": db_status,
            "ml_freight_daily_rows": row_count
        }
    }

@app.get("/{full_path:path}", response_class=HTMLResponse, tags=["Frontend"])
def serve_spa(full_path: str):
    """Serves the canonical React frontend index.html with client-side routing fallback."""
    if full_path:
        target_file = FRONTEND_DIST / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))
    index_file = FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return HTMLResponse(
        content="<h1>CargoPredict API is running. Building frontend bundle...</h1>",
        status_code=200
    )
