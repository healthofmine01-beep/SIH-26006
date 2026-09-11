"""
Authentication and User Settings API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.auth import (
    authenticate_user, 
    create_access_token, 
    get_current_user, 
    get_user_settings, 
    update_user_settings
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

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

@router.post("/login")
def login(req: LoginRequest, response: Response):
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password. Please verify your credentials."
        )

    token = create_access_token({
        "sub": user["username"],
        "role": user["role"],
        "full_name": user["full_name"]
    })

    # Set HTTP-only secure cookie for web browser session
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax"
    )

    settings = get_user_settings(user["username"])

    return {
        "status": "success",
        "access_token": token,
        "token_type": "bearer",
        "user": user,
        "settings": settings
    }

@router.get("/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    settings = get_user_settings(current_user["username"])
    return {
        "user": current_user,
        "settings": settings
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"status": "success", "message": "Successfully logged out."}

@router.get("/settings")
def fetch_settings(current_user: dict = Depends(get_current_user)):
    return get_user_settings(current_user["username"])

@router.put("/settings")
def save_settings(req: SettingsUpdateRequest, current_user: dict = Depends(get_current_user)):
    data = req.model_dump(exclude_unset=True)
    updated = update_user_settings(current_user["username"], data)
    return {"status": "success", "settings": updated}
