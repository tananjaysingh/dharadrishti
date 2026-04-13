"""
J.A.R.V.I.S — Desktop Agent Coordinator
Main orchestrator that routes commands to the appropriate agent module.
"""

import os
import subprocess
import logging
from datetime import datetime
from typing import Optional

from .app_control import AppControl
from .system_control import SystemControl
from .power_control import PowerControl
from .file_search import FileSearch
from .media_control import MediaControl
from .screenshot import ScreenshotCapture
from .clipboard import ClipboardManager
from .notifications import NotificationManager
from .notes_manager import NotesManager
from .reminder_manager import ReminderManager

logger = logging.getLogger("jarvis.agent")


class DesktopAgent:
    """
    Main desktop agent that coordinates all sub-agents.
    This is the central entry point for executing desktop commands.
    """

    def __init__(self, config: dict = None):
        config = config or {}
        aliases = config.get("app_aliases", {})
        websites = config.get("website_shortcuts", {})

        self.app = AppControl(aliases=aliases, websites=websites)
        self.system = SystemControl()
        self.power = PowerControl()
        self.files = FileSearch()
        self.media = MediaControl()
        self.screenshot = ScreenshotCapture(
            save_dir=config.get("screenshot_dir", "~/Pictures/Screenshots")
        )
        self.clipboard = ClipboardManager()
        self.notifications = NotificationManager()
        self.notes = NotesManager(
            notes_dir=config.get("notes", {}).get("directory") if isinstance(config.get("notes"), dict) else None
        )
        self.reminders = ReminderManager(
            on_fire=self._on_reminder_fired,
            check_interval=config.get("reminders", {}).get("check_interval", 30) if isinstance(config.get("reminders"), dict) else 30,
        )

        # Start reminder checker
        self.reminders.start_checker()

        # External callback for when Jarvis needs to speak (set by service)
        self._speak_callback = None

    def set_speak_callback(self, callback):
        """Set a callback for Jarvis to speak (used by reminders, etc.)."""
        self._speak_callback = callback

    def _on_reminder_fired(self, message: str):
        """Called when a reminder is due."""
        logger.info(f"🔔 {message}")
        self.notifications.send_jarvis_notification(message)
        if self._speak_callback:
            self._speak_callback(message)

    def execute(self, intent: str, entities: dict = None) -> dict:
        """
        Execute a command based on parsed intent and entities.
        
        Args:
            intent: The command intent (e.g., 'open_app', 'set_volume')
            entities: Extracted entities (e.g., {'app': 'spotify', 'level': 50})
        
        Returns:
            Result dict with 'success', 'message', and optional data
        """
        entities = entities or {}

        try:
            # ── App Control ──
            if intent == "open_app":
                return self.app.open_app(entities.get("app", ""))

            elif intent == "close_app":
                return self.app.close_app(entities.get("app", ""))

            elif intent == "open_url":
                return self.app.open_url(entities.get("url", ""))

            elif intent == "list_apps":
                apps = self.app.get_running_apps()
                return {
                    "success": True,
                    "message": f"{len(apps)} applications running",
                    "data": {"apps": apps},
                }

            # ── Volume ──
            elif intent == "set_volume":
                return self.system.set_volume(entities.get("level", 50))

            elif intent == "get_volume":
                vol = self.system.get_volume()
                return {"success": True, "message": f"Volume is at {vol}%", "data": {"level": vol}}

            elif intent == "mute":
                return self.system.mute(True)

            elif intent == "unmute":
                return self.system.mute(False)

            # ── Brightness ──
            elif intent == "set_brightness":
                return self.system.set_brightness(entities.get("level", 50))

            elif intent == "get_brightness":
                b = self.system.get_brightness()
                return {"success": True, "message": f"Brightness is at {b}%", "data": {"level": b}}

            # ── Wi-Fi ──
            elif intent == "wifi_on":
                return self.system.toggle_wifi(True)

            elif intent == "wifi_off":
                return self.system.toggle_wifi(False)

            elif intent == "wifi_status":
                status = self.system.get_wifi_status()
                return {"success": True, "message": f"Wi-Fi: {'connected' if status['connected'] else 'disconnected'}", "data": status}

            # ── Bluetooth ──
            elif intent == "bluetooth_on":
                return self.system.toggle_bluetooth(True)

            elif intent == "bluetooth_off":
                return self.system.toggle_bluetooth(False)

            # ── System Stats ──
            elif intent == "system_stats":
                stats = self.system.get_stats()
                msg = (
                    f"CPU: {stats['cpu_percent']}%, "
                    f"RAM: {stats['ram_percent']}%, "
                    f"Disk: {stats['disk_percent']}%"
                )
                if stats.get("battery_percent") is not None:
                    msg += f", Battery: {round(stats['battery_percent'])}%"
                return {"success": True, "message": msg, "data": stats}

            # ── Battery (dedicated spoken response) ──
            elif intent == "battery_status":
                stats = self.system.get_stats()
                bp = stats.get("battery_percent")
                if bp is not None:
                    charging = stats.get("battery_charging", False)
                    status = "and charging" if charging else "and not charging"
                    return {"success": True, "message": f"Battery is at {round(bp)}% {status}"}
                else:
                    return {"success": True, "message": "No battery detected. This might be a desktop PC."}

            # ── Time & Date ──
            elif intent == "get_time":
                now = datetime.now()
                time_str = now.strftime("%I:%M %p")
                date_str = now.strftime("%A, %B %d, %Y")
                return {"success": True, "message": f"It's {time_str} on {date_str}"}

            elif intent == "get_date":
                now = datetime.now()
                date_str = now.strftime("%A, %B %d, %Y")
                return {"success": True, "message": f"Today is {date_str}"}

            # ── Empty Trash ──
            elif intent == "empty_trash":
                trash_dir = os.path.expanduser("~/.local/share/Trash")
                if os.path.exists(trash_dir):
                    subprocess.run(
                        ["rm", "-rf", f"{trash_dir}/files", f"{trash_dir}/info"],
                        timeout=30,
                    )
                    # Recreate directories
                    os.makedirs(f"{trash_dir}/files", exist_ok=True)
                    os.makedirs(f"{trash_dir}/info", exist_ok=True)
                    return {"success": True, "message": "Trash has been emptied"}
                return {"success": True, "message": "Trash is already empty"}

            # ── Notes ──
            elif intent == "create_note":
                content = entities.get("content", "")
                return self.notes.create_note(content)

            elif intent == "list_notes":
                return self.notes.list_notes()

            elif intent == "read_note":
                return self.notes.read_note(entities.get("name"))

            # ── Reminders ──
            elif intent == "set_reminder":
                return self.reminders.set_reminder(entities.get("text", ""))

            elif intent == "list_reminders":
                return self.reminders.list_reminders()

            # ── Read Notifications ──
            elif intent == "read_notifications":
                return self._read_recent_notifications()

            # ── File Search ──
            elif intent == "search_files":
                return self.files.search(
                    directory=entities.get("directory", "~"),
                    pattern=entities.get("pattern", "*"),
                    file_type=entities.get("file_type"),
                    max_results=entities.get("max_results", 50),
                )

            elif intent == "recent_files":
                return self.files.get_recent_files(
                    directory=entities.get("directory", "~"),
                    count=entities.get("count", 10),
                )

            # ── Media ──
            elif intent == "media_play_pause":
                return self.media.play_pause()

            elif intent == "media_play":
                return self.media.play()

            elif intent == "media_pause":
                return self.media.pause()

            elif intent == "media_next":
                return self.media.next_track()

            elif intent == "media_prev":
                return self.media.prev_track()

            elif intent == "media_stop":
                return self.media.stop()

            elif intent == "now_playing":
                return self.media.get_now_playing()

            # ── Screenshot ──
            elif intent == "screenshot":
                region = entities.get("region", "full")
                return self.screenshot.capture(region)

            # ── Power ──
            elif intent == "shutdown":
                return self.power.shutdown()

            elif intent == "restart":
                return self.power.restart()

            elif intent == "sleep":
                return self.power.sleep()

            elif intent == "lock":
                return self.power.lock()

            elif intent == "hibernate":
                return self.power.hibernate()

            # ── Clipboard ──
            elif intent == "get_clipboard":
                return self.clipboard.get_clipboard()

            elif intent == "set_clipboard":
                return self.clipboard.set_clipboard(entities.get("content", ""))

            # ── Notifications ──
            elif intent == "notify":
                return self.notifications.send_jarvis_notification(
                    entities.get("message", "Notification from Jarvis")
                )

            # ── Greeting ──
            elif intent == "greeting":
                from backend.utils.helpers import get_time_greeting
                greeting = get_time_greeting()
                return {"success": True, "message": greeting}

            # ── Unknown ──
            else:
                return {
                    "success": False,
                    "message": f"I don't know how to handle the intent: {intent}",
                }

        except Exception as e:
            logger.error(f"Agent execution error for intent '{intent}': {e}", exc_info=True)
            return {"success": False, "message": f"An error occurred: {e}"}

    def _read_recent_notifications(self) -> dict:
        """Read recent desktop notifications via dbus history or log."""
        try:
            # Try to get notification history from dunst or notification daemon
            result = subprocess.run(
                ["dbus-send", "--session", "--dest=org.freedesktop.Notifications",
                 "--type=method_call", "--print-reply",
                 "/org/freedesktop/Notifications",
                 "org.freedesktop.Notifications.GetServerInformation"],
                capture_output=True, text=True, timeout=5,
            )
            # Most GNOME DEs don't expose notification history via dbus
            # Fallback: read from Jarvis's own command log
            return {
                "success": True,
                "message": "Notification reading is available through the desktop notification center. "
                           "I can read my own command history though. Would you like that?",
            }
        except Exception:
            return {
                "success": True,
                "message": "No notification history available. You can check your desktop notification center.",
            }

    def is_dangerous(self, intent: str) -> bool:
        """Check if an intent requires confirmation before execution."""
        dangerous_intents = {
            "shutdown", "restart", "hibernate", "logout",
            "close_app",  # closing apps can lose unsaved work
            "empty_trash",  # permanent deletion
        }
        return intent in dangerous_intents

