"""
J.A.R.V.I.S — Pydantic Schemas
Data models for API requests, responses, and WebSocket events.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


# ── Enums ─────────────────────────────────────────────────

class CommandSource(str, Enum):
    VOICE = "voice"
    WEB = "web"
    MOBILE = "mobile"


class CommandStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    CONFIRMATION_REQUIRED = "confirmation_required"


class OrbState(str, Enum):
    IDLE = "idle"
    LISTENING = "listening"
    PROCESSING = "processing"
    RESPONDING = "responding"
    ERROR = "error"


class WSEventType(str, Enum):
    COMMAND = "command"
    RESPONSE = "response"
    STATUS_UPDATE = "status_update"
    SYSTEM_STATS = "system_stats"
    ORB_STATE = "orb_state"
    WAVEFORM_DATA = "waveform_data"
    NOTIFICATION = "notification"
    CONFIRMATION_REQUEST = "confirmation_request"
    CONFIRMATION_RESPONSE = "confirmation_response"
    HEARTBEAT = "heartbeat"
    FILE_TRANSFER = "file_transfer"
    CLIPBOARD_SYNC = "clipboard_sync"


# ── Request Models ────────────────────────────────────────

class CommandRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000, description="The command text")
    source: CommandSource = CommandSource.WEB
    session_id: Optional[str] = None


class ConfirmationResponse(BaseModel):
    command_id: int
    confirmed: bool


class PairingRequest(BaseModel):
    code: str = Field(..., min_length=4, max_length=8)
    device_name: Optional[str] = "Unknown Device"


class SettingUpdate(BaseModel):
    key: str
    value: Any


class FileSearchRequest(BaseModel):
    directory: str = "~"
    pattern: str = "*"
    file_type: Optional[str] = None  # pdf, txt, jpg, etc.
    max_results: int = 50


# ── Response Models ───────────────────────────────────────

class CommandResponse(BaseModel):
    id: Optional[int] = None
    status: CommandStatus
    intent: Optional[str] = None
    response_text: str
    execution_time_ms: Optional[int] = None
    data: Optional[dict] = None
    requires_confirmation: bool = False


class SystemStats(BaseModel):
    cpu_percent: float
    ram_total_gb: float
    ram_used_gb: float
    ram_percent: float
    disk_total_gb: float
    disk_used_gb: float
    disk_percent: float
    battery_percent: Optional[float] = None
    battery_charging: Optional[bool] = None
    cpu_temp: Optional[float] = None
    uptime_seconds: float
    network_up: bool = True


class PairingResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    expires_at: Optional[str] = None
    message: str


class FileSearchResult(BaseModel):
    path: str
    name: str
    size_bytes: int
    modified: str
    file_type: str


class CommandHistoryItem(BaseModel):
    id: int
    timestamp: str
    raw_text: str
    intent: Optional[str]
    status: str
    response: Optional[str]
    source: str


# ── WebSocket Event Models ────────────────────────────────

class WSEvent(BaseModel):
    type: WSEventType
    data: Any
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class WSCommandEvent(BaseModel):
    text: str
    source: CommandSource


class WSStatusUpdate(BaseModel):
    orb_state: OrbState
    message: Optional[str] = None
    progress: Optional[float] = None  # 0.0 to 1.0


class WSNotification(BaseModel):
    title: str
    message: str
    level: str = "info"  # info, warning, error, success
    duration_ms: int = 5000


# ── Health Check ──────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "online"
    name: str = "J.A.R.V.I.S"
    version: str = "1.0.0"
    uptime_seconds: float
    voice_engine: str = "offline"
    connected_clients: int = 0
