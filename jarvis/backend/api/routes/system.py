"""
J.A.R.V.I.S — System API Route
GET /api/system/stats — System statistics.
POST /api/system/volume — Set volume.
POST /api/system/brightness — Set brightness.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/system", tags=["system"])


class LevelRequest(BaseModel):
    level: int


class ToggleRequest(BaseModel):
    enabled: bool


@router.get("/stats")
async def get_system_stats():
    """Get current system statistics (CPU, RAM, disk, battery, etc.)."""
    from desktop_agent.system_control import SystemControl
    stats = SystemControl.get_stats()
    return stats


@router.post("/volume")
async def set_volume(request: LevelRequest):
    """Set system volume (0-100)."""
    from desktop_agent.system_control import SystemControl
    return SystemControl.set_volume(request.level)


@router.post("/brightness")
async def set_brightness(request: LevelRequest):
    """Set screen brightness (0-100)."""
    from desktop_agent.system_control import SystemControl
    return SystemControl.set_brightness(request.level)


@router.post("/wifi")
async def toggle_wifi(request: ToggleRequest):
    """Toggle Wi-Fi on/off."""
    from desktop_agent.system_control import SystemControl
    return SystemControl.toggle_wifi(request.enabled)


@router.get("/wifi")
async def get_wifi_status():
    """Get Wi-Fi connection status."""
    from desktop_agent.system_control import SystemControl
    return SystemControl.get_wifi_status()


@router.post("/bluetooth")
async def toggle_bluetooth(request: ToggleRequest):
    """Toggle Bluetooth on/off."""
    from desktop_agent.system_control import SystemControl
    return SystemControl.toggle_bluetooth(request.enabled)


@router.post("/lock")
async def lock_screen():
    """Lock the screen."""
    from desktop_agent.power_control import PowerControl
    return PowerControl.lock()


@router.post("/screenshot")
async def take_screenshot(region: str = "full"):
    """Take a screenshot."""
    from desktop_agent.screenshot import ScreenshotCapture
    sc = ScreenshotCapture()
    return sc.capture(region)
