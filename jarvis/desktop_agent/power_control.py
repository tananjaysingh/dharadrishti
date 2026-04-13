"""
J.A.R.V.I.S — Power Control Agent
Shutdown, restart, sleep, and lock the system.
"""

import subprocess
import logging

logger = logging.getLogger("jarvis.power_control")


class PowerControl:
    """System power management — all actions are dangerous and require confirmation."""

    DANGEROUS_ACTIONS = {"shutdown", "restart", "reboot", "poweroff", "hibernate"}

    @staticmethod
    def is_dangerous(action: str) -> bool:
        """Check if an action requires confirmation."""
        return action.lower() in PowerControl.DANGEROUS_ACTIONS

    @staticmethod
    def shutdown() -> dict:
        """Shutdown the system."""
        try:
            subprocess.run(["systemctl", "poweroff"], check=True, timeout=10)
            return {"success": True, "message": "Shutting down the system..."}
        except Exception as e:
            logger.error(f"Shutdown failed: {e}")
            return {"success": False, "message": f"Shutdown failed: {e}"}

    @staticmethod
    def restart() -> dict:
        """Restart the system."""
        try:
            subprocess.run(["systemctl", "reboot"], check=True, timeout=10)
            return {"success": True, "message": "Restarting the system..."}
        except Exception as e:
            logger.error(f"Restart failed: {e}")
            return {"success": False, "message": f"Restart failed: {e}"}

    @staticmethod
    def sleep() -> dict:
        """Suspend the system."""
        try:
            subprocess.run(["systemctl", "suspend"], check=True, timeout=10)
            return {"success": True, "message": "System going to sleep..."}
        except Exception as e:
            logger.error(f"Sleep failed: {e}")
            return {"success": False, "message": f"Sleep failed: {e}"}

    @staticmethod
    def hibernate() -> dict:
        """Hibernate the system."""
        try:
            subprocess.run(["systemctl", "hibernate"], check=True, timeout=10)
            return {"success": True, "message": "Hibernating..."}
        except Exception as e:
            return {"success": False, "message": f"Hibernate failed: {e}"}

    @staticmethod
    def lock() -> dict:
        """Lock the screen."""
        try:
            subprocess.run(["loginctl", "lock-session"], check=True, timeout=5)
            return {"success": True, "message": "Screen locked"}
        except Exception as e:
            # Fallback to xdg-screensaver
            try:
                subprocess.run(["xdg-screensaver", "lock"], check=True, timeout=5)
                return {"success": True, "message": "Screen locked"}
            except Exception as e2:
                return {"success": False, "message": f"Failed to lock screen: {e2}"}

    @staticmethod
    def logout() -> dict:
        """Log out the current user."""
        try:
            subprocess.run(["loginctl", "terminate-user", ""], check=True, timeout=10)
            return {"success": True, "message": "Logging out..."}
        except Exception as e:
            return {"success": False, "message": f"Logout failed: {e}"}
