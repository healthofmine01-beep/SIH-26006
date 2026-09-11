"""
Pydantic schemas package for CargoPredict.
"""
from app.schemas.auth import LoginRequest, SettingsUpdateRequest, UserResponse
from app.schemas.optimization import FreightAnalysisInputModel

__all__ = [
    "LoginRequest",
    "SettingsUpdateRequest",
    "UserResponse",
    "FreightAnalysisInputModel"
]
