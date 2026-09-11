"""
Freight Forecasting API Routes.
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.auth import get_current_user
from app.services.forecasting_service import FreightForecastingService

router = APIRouter(prefix="/api/forecasts", tags=["Forecasting"])

@router.get("/routes")
def list_forecast_routes(current_user: dict = Depends(get_current_user)):
    return FreightForecastingService.get_available_routes()

@router.get("/history")
def get_freight_history(
    route_id: str = Query("R001", description="Trading route identifier"),
    vessel_class: Optional[str] = Query(None, description="Vessel class"),
    days: int = Query(180, ge=7, le=365, description="Number of historical days"),
    current_user: dict = Depends(get_current_user)
):
    return FreightForecastingService.get_historical_freight(route_id, vessel_class, days)

@router.get("/predict")
def get_freight_prediction(
    route_id: str = Query("R001", description="Trading route identifier"),
    vessel_class: Optional[str] = Query(None, description="Vessel class"),
    horizon_days: int = Query(30, description="Forecast horizon (14, 30, 90)"),
    fuel_shift_pct: float = Query(0.0, ge=-50.0, le=100.0, description="Fuel price change %"),
    congestion_shift_pct: float = Query(0.0, ge=-50.0, le=100.0, description="Port congestion change %"),
    vessel_supply_shift_pct: float = Query(0.0, ge=-50.0, le=50.0, description="Vessel supply change %"),
    current_user: dict = Depends(get_current_user)
):
    return FreightForecastingService.generate_forecast(
        route_id=route_id,
        vessel_class=vessel_class,
        horizon_days=horizon_days,
        fuel_price_shift_pct=fuel_shift_pct,
        congestion_shift_pct=congestion_shift_pct,
        vessel_supply_shift_pct=vessel_supply_shift_pct
    )

@router.get("/metrics")
def get_model_evaluation_metrics(current_user: dict = Depends(get_current_user)):
    from app.services.ml_engine import MLForecastEngine
    return MLForecastEngine.get_instance().get_model_metrics()

