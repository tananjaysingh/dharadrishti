"""
J.A.R.V.I.S — AI Integration (Optional)
Connect to local or cloud AI for natural language understanding.
"""

import logging
from typing import Optional

logger = logging.getLogger("jarvis.ai")


class AIIntegration:
    """Optional AI backend for complex queries. Disabled by default."""

    def __init__(self, config: dict = None):
        config = config or {}
        self.enabled = config.get("enabled", False)
        self.provider = config.get("provider", "ollama")

    async def ask(self, query: str, context: list = None) -> dict:
        """Ask the AI a question. Returns response dict."""
        if not self.enabled:
            return {
                "success": False,
                "message": "AI integration is not enabled. Enable it in config/settings.yaml.",
            }

        # Placeholder — will be implemented when AI is configured
        return {
            "success": False,
            "message": f"AI provider '{self.provider}' is configured but not yet connected.",
        }
