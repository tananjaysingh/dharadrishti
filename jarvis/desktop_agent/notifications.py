"""
J.A.R.V.I.S — Notifications Agent
Read and manage desktop notifications.
"""

import subprocess
import logging

logger = logging.getLogger("jarvis.notifications")


class NotificationManager:
    """Send desktop notifications and manage notification history."""

    @staticmethod
    def send_notification(title: str, message: str, urgency: str = "normal", icon: str = "dialog-information") -> dict:
        """Send a desktop notification."""
        try:
            cmd = [
                "notify-send",
                "--urgency", urgency,
                "--icon", icon,
                "--app-name", "J.A.R.V.I.S",
                title,
                message,
            ]
            subprocess.run(cmd, check=True, timeout=5)
            return {"success": True, "message": "Notification sent"}
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return {"success": False, "message": str(e)}

    @staticmethod
    def send_jarvis_notification(message: str, urgency: str = "normal"):
        """Send a notification from Jarvis."""
        return NotificationManager.send_notification("J.A.R.V.I.S", message, urgency)
