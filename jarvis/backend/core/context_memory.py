"""
J.A.R.V.I.S — Context Memory Manager
Manages conversation context for multi-turn interactions.
"""

import uuid
import logging
from typing import Optional
from backend.models.database import Database

logger = logging.getLogger("jarvis.context")


class ContextMemory:
    """Manages conversation sessions and context for continuity."""

    def __init__(self, db: Database, max_context_length: int = 10):
        self.db = db
        self.max_context_length = max_context_length
        self._current_session: Optional[str] = None

    @property
    def session_id(self) -> str:
        if not self._current_session:
            self._current_session = self.new_session()
        return self._current_session

    def new_session(self) -> str:
        """Start a new conversation session."""
        self._current_session = str(uuid.uuid4())[:8]
        logger.info(f"New session started: {self._current_session}")
        return self._current_session

    def add_user_message(self, content: str):
        """Add a user message to the current session."""
        self.db.add_context(self.session_id, "user", content)

    def add_assistant_message(self, content: str):
        """Add an assistant response to the current session."""
        self.db.add_context(self.session_id, "assistant", content)

    def get_context(self) -> list:
        """Get recent conversation context for the current session."""
        return self.db.get_context(self.session_id, self.max_context_length)

    def get_summary(self) -> str:
        """Get a text summary of recent context."""
        context = self.get_context()
        if not context:
            return "No conversation history."
        lines = []
        for msg in context[-5:]:
            role = "You" if msg["role"] == "user" else "Jarvis"
            lines.append(f"{role}: {msg['content']}")
        return "\n".join(lines)
