"""
J.A.R.V.I.S — Main FastAPI Application
The central server that ties together all components.
"""

import os
import sys
import time
import json
import asyncio
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.utils.helpers import load_config, load_commands_config, get_time_greeting
from backend.utils.security import SecurityManager
from backend.models.database import Database
from backend.models.schemas import WSEvent, WSEventType, OrbState, WSStatusUpdate, CommandSource
from backend.api.websocket.handler import ConnectionManager, ws_manager
from backend.core.command_executor import CommandExecutor
from backend.core.context_memory import ContextMemory
from backend.core.ai_integration import AIIntegration
from desktop_agent.agent import DesktopAgent

# ── Logging ──────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("jarvis")

# ── Application State ────────────────────────────────────────

app_state = {}
START_TIME = time.time()


# ── Lifespan ─────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    logger.info("=" * 60)
    logger.info("  J.A.R.V.I.S — Initializing...")
    logger.info("=" * 60)

    # Load configuration
    config = load_config()
    commands_config = load_commands_config()

    # Initialize database
    db_path = os.path.join(PROJECT_ROOT, config.get("database", {}).get("path", "database/jarvis.db"))
    db = Database(db_path)

    # Initialize security
    security_conf = config.get("security", {})
    security = SecurityManager(
        secret_key=security_conf.get("jwt_secret", "change-me"),
        expiry_hours=security_conf.get("jwt_expiry_hours", 24),
    )

    # Initialize desktop agent
    agent_config = {**commands_config, **config.get("desktop", {})}
    agent = DesktopAgent(config=agent_config)

    # Initialize command executor
    executor = CommandExecutor(
        db=db,
        agent=agent,
        require_confirm=config.get("desktop", {}).get("dangerous_commands_confirm", True),
    )

    # Initialize context memory
    context = ContextMemory(db)

    # Initialize AI integration
    ai = AIIntegration(config.get("ai", {}))

    # Store in app state
    app_state.update({
        "config": config,
        "commands_config": commands_config,
        "db": db,
        "security": security,
        "agent": agent,
        "executor": executor,
        "context": context,
        "ai": ai,
        "ws_manager": ws_manager,
    })

    # Log startup
    greeting = get_time_greeting()
    logger.info(f"  {greeting}")
    logger.info(f"  Server: http://0.0.0.0:{config.get('server', {}).get('port', 8400)}")
    logger.info(f"  WebSocket: ws://0.0.0.0:{config.get('server', {}).get('port', 8400)}/ws")
    logger.info("  All systems online.")
    logger.info("=" * 60)

    # Start background stats broadcaster
    stats_task = asyncio.create_task(broadcast_stats_loop())

    yield

    # Shutdown
    stats_task.cancel()
    logger.info("J.A.R.V.I.S shutting down. Goodbye, sir.")


# ── Background Tasks ─────────────────────────────────────────

async def broadcast_stats_loop():
    """Periodically broadcast system stats to all clients."""
    from desktop_agent.system_control import SystemControl
    while True:
        try:
            await asyncio.sleep(5)  # Every 5 seconds
            if ws_manager.connected_count > 0:
                stats = SystemControl.get_stats()
                await ws_manager.send_system_stats(stats)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Stats broadcast error: {e}")
            await asyncio.sleep(10)


# ── FastAPI App ──────────────────────────────────────────────

app = FastAPI(
    title="J.A.R.V.I.S",
    description="Just A Really Very Intelligent System — AI Desktop Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Import and register routes ───────────────────────────────

from backend.api.routes.commands import router as commands_router
from backend.api.routes.system import router as system_router
from backend.api.routes.files import router as files_router
from backend.api.routes.auth import router as auth_router
from backend.api.routes.settings import router as settings_router

app.include_router(commands_router)
app.include_router(system_router)
app.include_router(files_router)
app.include_router(auth_router)
app.include_router(settings_router)


# ── Health Check ─────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "name": "J.A.R.V.I.S",
        "version": "1.0.0",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "connected_clients": ws_manager.connected_count,
        "greeting": get_time_greeting(),
    }


# ── WebSocket Endpoint ──────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str = Query(default=None),
    client_type: str = Query(default="web"),
    token: str = Query(default=None),
):
    """Main WebSocket endpoint for real-time communication."""
    if not client_id:
        import uuid
        client_id = str(uuid.uuid4())[:8]

    # Optional token validation for mobile clients
    if client_type == "mobile" and token:
        security = app_state.get("security")
        if security:
            payload = security.verify_token(token)
            if not payload:
                await websocket.close(code=4001, reason="Invalid token")
                return

    await ws_manager.connect(websocket, client_id, client_type)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                # Treat plain text as a command
                message = {"type": "command", "data": {"text": data}}

            result = await ws_manager.handle_message(client_id, message)

            if result:
                msg_type = result.get("type")

                if msg_type == "command":
                    # Execute the command
                    cmd_data = result.get("data", {})
                    text = cmd_data.get("text", "")
                    source = CommandSource.MOBILE if client_type == "mobile" else CommandSource.WEB

                    if text:
                        # Update orb state
                        await ws_manager.update_orb_state(OrbState.PROCESSING, text)

                        executor = app_state["executor"]
                        context = app_state["context"]

                        context.add_user_message(text)

                        async def on_confirm(cmd_id, intent, text):
                            await ws_manager.request_confirmation(cmd_id, intent, text)

                        response = await executor.execute(text, source.value, on_confirm)
                        context.add_assistant_message(response.response_text)

                        await ws_manager.send_command_response(response.model_dump())
                        await ws_manager.update_orb_state(OrbState.IDLE)

                elif msg_type == "confirmation_response":
                    cmd_id = result.get("data", {}).get("command_id")
                    confirmed = result.get("data", {}).get("confirmed", False)
                    if cmd_id is not None:
                        executor = app_state["executor"]
                        response = await executor.confirm(cmd_id, confirmed)
                        await ws_manager.send_command_response(response.model_dump())

    except WebSocketDisconnect:
        await ws_manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for {client_id}: {e}")
        await ws_manager.disconnect(client_id)


# ── Serve Frontend (if built) ────────────────────────────────

frontend_dist = PROJECT_ROOT / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")


# ── Entry Point ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    config = load_config()
    host = config.get("server", {}).get("host", "0.0.0.0")
    port = config.get("server", {}).get("port", 8400)

    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=True,
        reload_dirs=[str(PROJECT_ROOT / "backend"), str(PROJECT_ROOT / "desktop_agent")],
        log_level="info",
    )
