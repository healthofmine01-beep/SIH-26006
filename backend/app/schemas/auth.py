"""
Authentication Pydantic schemas for request validation.
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class LoginRequest(BaseModel):
    username: str
    password: str

class SettingsUpdateRequest(BaseModel):
    theme: Optional[str] = None
    default_route: Optional[str] = None
    default_vessel: Optional[str] = None
    currency: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    saved_scenarios: Optional[List[Dict[str, Any]]] = None

class UserResponse(BaseModel):
    username: str
    role: str
    full_name: str
