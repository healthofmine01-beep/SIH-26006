"""
Admin Console API Routes: pipeline status, 28-table catalog, data quality checks, user administration.
Protected by require_admin dependency.
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.auth import require_admin
from app.services.admin_service import AdminMonitoringService

router = APIRouter(prefix="/api/admin", tags=["Administration"])

@router.get("/pipeline-runs")
def get_pipeline_runs(admin_user: dict = Depends(require_admin)):
    return AdminMonitoringService.get_pipeline_runs()

@router.get("/table-loads")
def get_table_load_results(
    run_id: Optional[str] = Query(None, description="Optional pipeline run UUID"),
    admin_user: dict = Depends(require_admin)
):
    return AdminMonitoringService.get_table_load_results(run_id)

@router.get("/data-quality")
def get_data_quality_report(admin_user: dict = Depends(require_admin)):
    return AdminMonitoringService.get_data_quality_results()

@router.get("/database-catalog")
def get_database_catalog(admin_user: dict = Depends(require_admin)):
    return AdminMonitoringService.get_database_catalog()

@router.get("/users")
def list_system_users(admin_user: dict = Depends(require_admin)):
    return AdminMonitoringService.get_users_list()

@router.get("/model-metrics")
def get_admin_model_metrics(admin_user: dict = Depends(require_admin)):
    from app.services.ml_engine import MLForecastEngine
    return MLForecastEngine.get_instance().get_model_metrics()

