"""
J.A.R.V.I.S — Settings API Route
"""

from fastapi import APIRouter
from backend.models.schemas import SettingUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/")
async def get_settings():
    """Get current configuration."""
    from backend.main import app_state
    config = app_state["config"]
    return config


@router.put("/")
async def update_setting(request: SettingUpdate):
    """Update a runtime setting."""
    from backend.main import app_state
    db = app_state["db"]
    db.set_setting(request.key, str(request.value))
    return {"success": True, "message": f"Setting '{request.key}' updated"}
