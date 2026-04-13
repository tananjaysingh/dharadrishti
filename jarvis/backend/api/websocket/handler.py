"""
J.A.R.V.I.S — WebSocket Connection Manager
Handles real-time bidirectional communication with frontend and mobile clients.
"""

import json
import asyncio
import logging
from datetime import datetime
from typing import Optional
from fastapi import WebSocket

from backend.models.schemas import WSEvent, WSEventType, OrbState, WSStatusUpdate

logger = logging.getLogger("jarvis.websocket")


class ConnectionManager:
    """Manages WebSocket connections for desktop and mobile clients."""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}  # client_id -> websocket
        self.client_types: dict[str, str] = {}  # client_id -> "web" or "mobile"
        self._lock = asyncio.Lock()
        self._heartbeat_interval = 30  # seconds

    @property
    def connected_count(self) -> int:
        return len(self.active_connections)

    async def connect(self, websocket: WebSocket, client_id: str, client_type: str = "web"):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self.active_connections[client_id] = websocket
            self.client_types[client_id] = client_type
        logger.info(f"Client connected: {client_id} ({client_type}) | Total: {self.connected_count}")

        # Send welcome event
        await self.send_to(client_id, WSEvent(
            type=WSEventType.NOTIFICATION,
            data={"title": "Connected", "message": "J.A.R.V.I.S online", "level": "success"},
        ))

    async def disconnect(self, client_id: str):
        """Remove a WebSocket connection."""
        async with self._lock:
            self.active_connections.pop(client_id, None)
            self.client_types.pop(client_id, None)
        logger.info(f"Client disconnected: {client_id} | Total: {self.connected_count}")

    async def send_to(self, client_id: str, event: WSEvent):
        """Send an event to a specific client."""
        ws = self.active_connections.get(client_id)
        if ws:
            try:
                await ws.send_text(event.model_dump_json())
            except Exception as e:
                logger.error(f"Error sending to {client_id}: {e}")
                await self.disconnect(client_id)

    async def broadcast(self, event: WSEvent, exclude: Optional[str] = None):
        """Broadcast an event to all connected clients."""
        disconnected = []
        for client_id, ws in self.active_connections.items():
            if client_id == exclude:
                continue
            try:
                await ws.send_text(event.model_dump_json())
            except Exception:
                disconnected.append(client_id)

        for client_id in disconnected:
            await self.disconnect(client_id)

    async def broadcast_to_type(self, event: WSEvent, client_type: str):
        """Broadcast to all clients of a specific type (web or mobile)."""
        for client_id, ct in list(self.client_types.items()):
            if ct == client_type:
                await self.send_to(client_id, event)

    async def update_orb_state(self, state: OrbState, message: str = None):
        """Broadcast orb state change to all clients."""
        await self.broadcast(WSEvent(
            type=WSEventType.ORB_STATE,
            data=WSStatusUpdate(orb_state=state, message=message).model_dump(),
        ))

    async def send_system_stats(self, stats: dict):
        """Broadcast system stats to all clients."""
        await self.broadcast(WSEvent(
            type=WSEventType.SYSTEM_STATS,
            data=stats,
        ))

    async def send_command_response(self, response: dict):
        """Broadcast command response to all clients."""
        await self.broadcast(WSEvent(
            type=WSEventType.RESPONSE,
            data=response,
        ))

    async def request_confirmation(self, command_id: int, action: str, details: str):
        """Send a confirmation request to all clients."""
        await self.broadcast(WSEvent(
            type=WSEventType.CONFIRMATION_REQUEST,
            data={
                "command_id": command_id,
                "action": action,
                "details": details,
                "message": f"Shall I proceed with: {action}?",
            },
        ))

    async def handle_message(self, client_id: str, data: dict):
        """Process an incoming WebSocket message from a client."""
        event_type = data.get("type")

        if event_type == "heartbeat":
            await self.send_to(client_id, WSEvent(
                type=WSEventType.HEARTBEAT,
                data={"status": "alive"},
            ))
        elif event_type == "command":
            # Will be handled by the main app
            return data
        elif event_type == "confirmation_response":
            return data
        else:
            logger.warning(f"Unknown event type from {client_id}: {event_type}")

        return None


# Singleton instance
ws_manager = ConnectionManager()
