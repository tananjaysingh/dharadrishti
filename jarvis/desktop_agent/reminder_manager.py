"""
J.A.R.V.I.S — Reminder Manager
Set, check, and fire reminders with persistent SQLite storage.
"""

import os
import time
import logging
import threading
import sqlite3
from datetime import datetime, timedelta
from typing import Callable, Optional

logger = logging.getLogger("jarvis.reminders")


def parse_time_expression(text: str) -> Optional[datetime]:
    """Parse human time expressions into datetime objects.
    
    Supports:
        "in 5 minutes", "in 1 hour", "in 30 seconds",
        "at 3pm", "at 15:30", "tomorrow at 9am"
    """
    import re
    now = datetime.now()

    # "in X minutes/hours/seconds"
    m = re.search(r"in\s+(\d+)\s+(second|minute|hour|min|sec|hr)s?", text, re.IGNORECASE)
    if m:
        amount = int(m.group(1))
        unit = m.group(2).lower()
        if unit in ("second", "sec"):
            return now + timedelta(seconds=amount)
        elif unit in ("minute", "min"):
            return now + timedelta(minutes=amount)
        elif unit in ("hour", "hr"):
            return now + timedelta(hours=amount)

    # "at HH:MM" or "at H:MMam/pm"
    m = re.search(r"at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?", text, re.IGNORECASE)
    if m:
        hour = int(m.group(1))
        minute = int(m.group(2) or 0)
        ampm = (m.group(3) or "").lower()
        if ampm == "pm" and hour < 12:
            hour += 12
        elif ampm == "am" and hour == 12:
            hour = 0

        target = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if target <= now:
            target += timedelta(days=1)  # Tomorrow

        if "tomorrow" in text.lower():
            if target.date() == now.date():
                target += timedelta(days=1)

        return target

    # Default: 5 minutes from now
    return now + timedelta(minutes=5)


class ReminderManager:
    """Persistent reminder system with background checker."""

    def __init__(self, db_path: str = None, on_fire: Callable = None, check_interval: int = 30):
        self.db_path = db_path or os.path.expanduser("~/.local/share/jarvis/reminders.db")
        self.on_fire = on_fire  # Callback when reminder fires: fn(message)
        self.check_interval = check_interval
        self._running = False
        self._thread: Optional[threading.Thread] = None

        # Ensure directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _init_db(self):
        """Create reminders table if not exists."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS reminders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    message TEXT NOT NULL,
                    fire_at TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    fired INTEGER DEFAULT 0
                )
            """)

    def set_reminder(self, text: str) -> dict:
        """Parse and set a reminder from natural language."""
        try:
            # Extract the reminder message and time
            import re

            # Remove "remind me to" / "set a reminder to" prefix
            message = re.sub(
                r"^(?:remind\s+me\s+(?:to\s+)?|set\s+(?:a\s+)?reminder\s+(?:to\s+)?)",
                "", text, flags=re.IGNORECASE,
            ).strip()

            # Try to extract time part
            time_part = ""
            time_match = re.search(r"(in\s+\d+\s+\w+|at\s+\d{1,2}:?\d{0,2}\s*(?:am|pm)?|tomorrow.*)", message, re.IGNORECASE)
            if time_match:
                time_part = time_match.group(0)
                message = message[:time_match.start()].strip().rstrip(",").strip()

            if not message:
                message = text  # Use full text as message

            fire_at = parse_time_expression(time_part or text)
            if not fire_at:
                fire_at = datetime.now() + timedelta(minutes=5)

            # Store in database
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    "INSERT INTO reminders (message, fire_at, created_at) VALUES (?, ?, ?)",
                    (message, fire_at.isoformat(), datetime.now().isoformat()),
                )

            time_str = fire_at.strftime("%I:%M %p" if fire_at.date() == datetime.now().date() else "%b %d at %I:%M %p")
            logger.info(f"Reminder set: '{message}' at {fire_at}")

            return {
                "success": True,
                "message": f"Reminder set for {time_str}: {message}",
                "data": {"message": message, "fire_at": fire_at.isoformat()},
            }
        except Exception as e:
            logger.error(f"Failed to set reminder: {e}")
            return {"success": False, "message": f"Failed to set reminder: {e}"}

    def list_reminders(self) -> dict:
        """List upcoming (unfired) reminders."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                rows = conn.execute(
                    "SELECT id, message, fire_at FROM reminders WHERE fired = 0 ORDER BY fire_at",
                ).fetchall()

            if not rows:
                return {"success": True, "message": "No upcoming reminders"}

            reminders = []
            for r in rows:
                fire_at = datetime.fromisoformat(r[2])
                reminders.append({
                    "id": r[0],
                    "message": r[1],
                    "fire_at": fire_at.strftime("%b %d at %I:%M %p"),
                })

            names = "; ".join(f"{r['fire_at']}: {r['message']}" for r in reminders[:5])
            return {
                "success": True,
                "message": f"{len(reminders)} upcoming reminder{'s' if len(reminders) != 1 else ''}: {names}",
                "data": {"reminders": reminders},
            }
        except Exception as e:
            return {"success": False, "message": f"Failed to list reminders: {e}"}

    def start_checker(self):
        """Start background thread to check and fire reminders."""
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._check_loop, daemon=True)
        self._thread.start()
        logger.info("Reminder checker started")

    def stop_checker(self):
        """Stop the reminder checker."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=5)

    def _check_loop(self):
        """Background loop checking for due reminders."""
        while self._running:
            try:
                now = datetime.now().isoformat()
                with sqlite3.connect(self.db_path) as conn:
                    rows = conn.execute(
                        "SELECT id, message FROM reminders WHERE fired = 0 AND fire_at <= ?",
                        (now,),
                    ).fetchall()

                    for row in rows:
                        rid, message = row
                        logger.info(f"🔔 Reminder fired: {message}")

                        # Mark as fired
                        conn.execute("UPDATE reminders SET fired = 1 WHERE id = ?", (rid,))

                        # Call fire callback
                        if self.on_fire:
                            self.on_fire(f"Reminder: {message}")

            except Exception as e:
                logger.error(f"Reminder check error: {e}")

            time.sleep(self.check_interval)
