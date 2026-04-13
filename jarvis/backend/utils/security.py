"""
J.A.R.V.I.S — Security Utilities
JWT token management, pairing codes, and encryption.
"""

import secrets
import string
import hashlib
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt


class SecurityManager:
    """Handles JWT tokens, pairing codes, and device authentication."""

    def __init__(self, secret_key: str = "change-me-in-production", expiry_hours: int = 24):
        self.secret_key = secret_key
        self.expiry_hours = expiry_hours
        self.algorithm = "HS256"
        self._pending_codes: dict[str, dict] = {}  # code -> {created_at, device_name}

    def generate_pairing_code(self, length: int = 6) -> str:
        """Generate a random numeric pairing code."""
        code = "".join(secrets.choice(string.digits) for _ in range(length))
        self._pending_codes[code] = {
            "created_at": datetime.utcnow(),
        }
        return code

    def validate_pairing_code(self, code: str) -> bool:
        """Validate a pairing code (expires after 5 minutes)."""
        if code not in self._pending_codes:
            return False
        created = self._pending_codes[code]["created_at"]
        if datetime.utcnow() - created > timedelta(minutes=5):
            del self._pending_codes[code]
            return False
        del self._pending_codes[code]
        return True

    def create_token(self, device_id: str, device_name: str = "unknown") -> tuple[str, str]:
        """Create a JWT token for a paired device. Returns (token, expires_at)."""
        expires = datetime.utcnow() + timedelta(hours=self.expiry_hours)
        payload = {
            "sub": device_id,
            "name": device_name,
            "exp": expires,
            "iat": datetime.utcnow(),
            "iss": "jarvis",
        }
        token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
        return token, expires.isoformat()

    def verify_token(self, token: str) -> Optional[dict]:
        """Verify a JWT token. Returns payload if valid, None otherwise."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None

    @staticmethod
    def generate_device_id() -> str:
        """Generate a unique device identifier."""
        return secrets.token_hex(16)

    @staticmethod
    def hash_value(value: str) -> str:
        """Hash a value using SHA-256."""
        return hashlib.sha256(value.encode()).hexdigest()
