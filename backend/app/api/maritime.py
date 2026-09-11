"""
Maritime Intelligence API Routes: ports, routes, fleet specs, market indicators, dashboard summary.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.auth import get_current_user
from app.services.maritime_service import MaritimeIntelligenceService

router = APIRouter(prefix="/api/maritime", tags=["Maritime Intelligence"])

@router.get("/dashboard-summary")
def get_dashboard_summary(current_user: Optional[dict] = Depends(get_current_user)):
    """Returns aggregated KPI metrics, route rates, and forecast points directly from Supabase."""
    return MaritimeIntelligenceService.get_dashboard_summary()

@router.get("/ports")
def get_all_ports(current_user: Optional[dict] = Depends(get_current_user)):
    return MaritimeIntelligenceService.get_ports_overview()

@router.get("/ports/{port_id}")
def get_single_port(port_id: str, current_user: Optional[dict] = Depends(get_current_user)):
    port_data = MaritimeIntelligenceService.get_port_detail(port_id)
    if not port_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Port {port_id} not found")
    return port_data

@router.get("/routes")
def get_all_routes(current_user: Optional[dict] = Depends(get_current_user)):
    return MaritimeIntelligenceService.get_routes_overview()

@router.get("/vessels")
def get_vessel_fleet(current_user: Optional[dict] = Depends(get_current_user)):
    return MaritimeIntelligenceService.get_vessel_specifications()

@router.get("/market-drivers")
def get_market_drivers(current_user: Optional[dict] = Depends(get_current_user)):
    return MaritimeIntelligenceService.get_market_drivers()
