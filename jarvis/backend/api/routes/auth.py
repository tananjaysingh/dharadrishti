"""
J.A.R.V.I.S — Auth API Route
Device pairing with QR codes and JWT tokens.
"""

import io
import uuid
import base64
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from backend.models.schemas import PairingRequest, PairingResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/qr-code")
async def generate_qr_code():
    """Generate a QR code for mobile device pairing."""
    from backend.main import app_state
    import qrcode

    security = app_state["security"]
    config = app_state["config"]

    code = security.generate_pairing_code()
    host = config.get("server", {}).get("host", "0.0.0.0")
    port = config.get("server", {}).get("port", 8400)

    # Get local IP
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        local_ip = "localhost"

    # QR data
    qr_data = {
        "host": local_ip,
        "port": port,
        "code": code,
        "name": "J.A.R.V.I.S",
    }

    # Generate QR image
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(str(qr_data))
    qr.make(fit=True)
    img = qr.make_image(fill_color="cyan", back_color="#0a0e1a")

    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode()

    return {
        "qr_image": f"data:image/png;base64,{img_base64}",
        "code": code,
        "host": local_ip,
        "port": port,
        "expires_in_seconds": 300,
    }


@router.post("/pair", response_model=PairingResponse)
async def pair_device(request: PairingRequest):
    """Pair a mobile device using a pairing code."""
    from backend.main import app_state

    security = app_state["security"]
    db = app_state["db"]

    if not security.validate_pairing_code(request.code):
        raise HTTPException(status_code=401, detail="Invalid or expired pairing code")

    device_id = security.generate_device_id()
    token, expires_at = security.create_token(device_id, request.device_name)

    db.add_paired_device(device_id, request.device_name, request.code, token)

    return PairingResponse(
        success=True,
        token=token,
        expires_at=expires_at,
        message=f"Device '{request.device_name}' paired successfully",
    )
