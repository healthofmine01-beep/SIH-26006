"""
Decision Support and Optimization API Routes.
Exposes endpoints matching canonical React frontend: analyze, history, landed cost, charter strategy.
"""
from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.auth import get_current_user
from app.services.optimization_service import DecisionOptimizationService

router = APIRouter(prefix="/api/optimize", tags=["Optimization"])

class FreightAnalysisInputModel(BaseModel):
    cargoType: str
    cargoQuantity: float
    origin: str
    destinationPort: str
    requiredDate: Optional[str] = None
    contractPreference: Optional[str] = "Spot"

@router.post("/analyze")
def run_shipment_analysis(
    req: FreightAnalysisInputModel,
    current_user: Optional[dict] = Depends(get_current_user)
):
    username = current_user.get("username") if current_user else "dhruvil"
    return DecisionOptimizationService.analyze_shipment(req.model_dump(), username=username)

@router.get("/history")
def get_user_history(
    current_user: Optional[dict] = Depends(get_current_user)
):
    username = current_user.get("username") if current_user else "dhruvil"
    return DecisionOptimizationService.get_user_history(username=username)

@router.get("/port-tariffs")
def get_port_tariffs(current_user: dict = Depends(get_current_user)):
    return DecisionOptimizationService.get_port_cost_profiles()

@router.get("/landed-cost")
def compute_landed_cost(
    cargo_volume_mt: float = Query(75000.0, ge=5000.0, le=300000.0, description="Cargo volume in metric tons"),
    cargo_type: str = Query("Coking Coal", description="Cargo type"),
    vessel_class: str = Query("Capesize", description="Vessel class"),
    current_user: Optional[dict] = Depends(get_current_user)
):
    return DecisionOptimizationService.optimize_landed_cost(cargo_volume_mt, cargo_type, vessel_class)

@router.get("/charter-strategy")
def evaluate_charter_strategy(
    route_id: str = Query("R001", description="Trading route identifier"),
    current_user: Optional[dict] = Depends(get_current_user)
):
    return DecisionOptimizationService.optimize_charter_strategy(route_id)

@router.get("/procurement-windows")
def find_procurement_windows(
    route_id: str = Query("R001", description="Trading route identifier"),
    cargo_volume_mt: float = Query(75000.0, ge=5000.0, le=300000.0, description="Cargo volume in metric tons"),
    current_user: Optional[dict] = Depends(get_current_user)
):
    return DecisionOptimizationService.get_procurement_windows(route_id, cargo_volume_mt)
