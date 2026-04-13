"""
J.A.R.V.I.S — Commands API Route
POST /api/command — Execute a voice/text command.
GET /api/commands/history — Get command history.
POST /api/commands/confirm — Confirm a dangerous command.
"""

from fastapi import APIRouter, HTTPException
from backend.models.schemas import (
    CommandRequest, CommandResponse, ConfirmationResponse,
    CommandHistoryItem, CommandStatus,
)

router = APIRouter(prefix="/api", tags=["commands"])


@router.post("/command", response_model=CommandResponse)
async def execute_command(request: CommandRequest):
    """Execute a text command. The core endpoint for all interactions."""
    from backend.main import app_state

    executor = app_state["executor"]
    ws_manager = app_state["ws_manager"]
    context = app_state["context"]

    # Save user message in context
    context.add_user_message(request.text)

    # Execute
    async def on_confirm_needed(cmd_id, intent, text):
        await ws_manager.request_confirmation(cmd_id, intent, text)

    response = await executor.execute(
        text=request.text,
        source=request.source.value,
        on_confirmation_needed=on_confirm_needed,
    )

    # Save assistant response to context
    context.add_assistant_message(response.response_text)

    # Broadcast response via WebSocket
    await ws_manager.send_command_response(response.model_dump())

    return response


@router.post("/commands/confirm", response_model=CommandResponse)
async def confirm_command(request: ConfirmationResponse):
    """Confirm or cancel a dangerous command."""
    from backend.main import app_state

    executor = app_state["executor"]
    response = await executor.confirm(request.command_id, request.confirmed)

    # Broadcast result
    ws_manager = app_state["ws_manager"]
    await ws_manager.send_command_response(response.model_dump())

    return response


@router.get("/commands/history")
async def get_command_history(limit: int = 20):
    """Get recent command history."""
    from backend.main import app_state

    db = app_state["db"]
    history = db.get_recent_commands(limit)
    return {"commands": history, "total": len(history)}
