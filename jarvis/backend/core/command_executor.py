"""
J.A.R.V.I.S — Command Executor
Routes parsed commands through the desktop agent with confirmation handling.
"""

import time
import logging
from typing import Optional, Callable, Awaitable

from backend.models.schemas import CommandStatus, CommandResponse
from backend.models.database import Database
from backend.core.command_parser import CommandParser, HELP_TEXT
from desktop_agent.agent import DesktopAgent

logger = logging.getLogger("jarvis.executor")


class CommandExecutor:
    """Executes parsed commands and manages confirmation flows."""

    def __init__(self, db: Database, agent: DesktopAgent, require_confirm: bool = True):
        self.db = db
        self.agent = agent
        self.parser = CommandParser()
        self.require_confirm = require_confirm
        self._pending_confirmations: dict[int, dict] = {}  # cmd_id -> parsed_command

    async def execute(
        self,
        text: str,
        source: str = "web",
        on_confirmation_needed: Optional[Callable] = None,
    ) -> CommandResponse:
        """
        Execute a command from raw text.
        
        Args:
            text: Raw command text
            source: Command source (voice, web, mobile)
            on_confirmation_needed: Async callback when confirmation is needed
        """
        start_time = time.time()

        # Save to history
        cmd_record = self.db.add_command(text, source)

        # Parse the command
        parsed = self.parser.parse(text)
        intent = parsed["intent"]
        entities = parsed["entities"]

        logger.info(f"Parsed command: intent={intent}, entities={entities}, confidence={parsed['confidence']}")

        # Update history with parsed data
        self.db.update_command(
            cmd_record.id,
            intent=intent,
            entities=entities,
            status="processing",
        )

        # Handle special intents
        if intent == "help":
            return self._complete_command(cmd_record.id, start_time, True, HELP_TEXT)

        if intent == "unknown" or (intent == "ai_query" and parsed["confidence"] < 0.3):
            return self._complete_command(
                cmd_record.id, start_time, False,
                "I didn't understand that command. Say 'help' to see what I can do.",
            )

        # Handle multi-step commands
        if parsed.get("multi_step") and parsed.get("steps"):
            return await self._execute_multi_step(cmd_record.id, parsed["steps"], source, start_time)

        # Check if command needs confirmation
        if self.require_confirm and self.agent.is_dangerous(intent):
            self._pending_confirmations[cmd_record.id] = parsed
            self.db.update_command(cmd_record.id, status="confirmation_required")

            if on_confirmation_needed:
                await on_confirmation_needed(cmd_record.id, intent, text)

            return CommandResponse(
                id=cmd_record.id,
                status=CommandStatus.CONFIRMATION_REQUIRED,
                intent=intent,
                response_text=f"This action requires confirmation: {text}. Shall I proceed?",
                requires_confirmation=True,
            )

        # Execute the command
        result = self.agent.execute(intent, entities)
        success = result.get("success", False)
        message = result.get("message", "Done")

        return self._complete_command(cmd_record.id, start_time, success, message, intent, result.get("data"))

    async def confirm(self, cmd_id: int, confirmed: bool) -> CommandResponse:
        """Handle confirmation response for a dangerous command."""
        parsed = self._pending_confirmations.pop(cmd_id, None)

        if not parsed:
            return CommandResponse(
                id=cmd_id,
                status=CommandStatus.FAILED,
                response_text="No pending confirmation found for this command.",
            )

        if not confirmed:
            self.db.update_command(cmd_id, status="cancelled")
            return CommandResponse(
                id=cmd_id,
                status=CommandStatus.CANCELLED,
                intent=parsed["intent"],
                response_text="Command cancelled.",
            )

        # Execute the confirmed command
        start_time = time.time()
        result = self.agent.execute(parsed["intent"], parsed["entities"])
        success = result.get("success", False)
        message = result.get("message", "Done")

        return self._complete_command(cmd_id, start_time, success, message, parsed["intent"])

    async def _execute_multi_step(self, cmd_id: int, steps: list, source: str, start_time: float) -> CommandResponse:
        """Execute a multi-step command sequentially."""
        results = []
        all_success = True

        for i, step in enumerate(steps):
            intent = step["intent"]
            entities = step["entities"]

            # Check for dangerous steps in multi-step
            if self.require_confirm and self.agent.is_dangerous(intent):
                results.append(f"Step {i+1}: Skipped (requires confirmation) - {step['raw_text']}")
                continue

            result = self.agent.execute(intent, entities)
            success = result.get("success", False)
            message = result.get("message", "Done")
            results.append(f"Step {i+1}: {'✓' if success else '✗'} {message}")

            if not success:
                all_success = False

        combined_message = " | ".join(results)
        return self._complete_command(cmd_id, start_time, all_success, combined_message, "multi_step")

    def _complete_command(
        self, cmd_id: int, start_time: float, success: bool,
        message: str, intent: str = None, data: dict = None,
    ) -> CommandResponse:
        """Finalize a command execution and update the database."""
        elapsed_ms = int((time.time() - start_time) * 1000)
        status = "success" if success else "failed"

        self.db.update_command(
            cmd_id,
            status=status,
            response=message,
            execution_time_ms=elapsed_ms,
        )

        return CommandResponse(
            id=cmd_id,
            status=CommandStatus.SUCCESS if success else CommandStatus.FAILED,
            intent=intent,
            response_text=message,
            execution_time_ms=elapsed_ms,
            data=data,
        )
