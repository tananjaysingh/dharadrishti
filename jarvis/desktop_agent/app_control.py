"""
J.A.R.V.I.S — App Control Agent
Open and close applications, open URLs.
"""

import subprocess
import logging
import os
from typing import Optional

logger = logging.getLogger("jarvis.app_control")


# Default app aliases — extended at runtime from commands.yaml
APP_ALIASES = {
    "spotify": "spotify",
    "chrome": "google-chrome",
    "firefox": "firefox",
    "terminal": "gnome-terminal",
    "files": "nautilus",
    "calculator": "gnome-calculator",
    "settings": "gnome-control-center",
    "text editor": "gedit",
    "code": "code",
    "vscode": "code",
    "discord": "discord",
    "vlc": "vlc",
    "gimp": "gimp",
    "steam": "steam",
}

WEBSITE_SHORTCUTS = {
    "youtube": "https://www.youtube.com",
    "google": "https://www.google.com",
    "github": "https://github.com",
    "gmail": "https://mail.google.com",
    "twitter": "https://twitter.com",
    "reddit": "https://www.reddit.com",
    "netflix": "https://www.netflix.com",
    "chatgpt": "https://chat.openai.com",
    "claude": "https://claude.ai",
}


class AppControl:
    """Control application lifecycle on Linux desktop."""

    def __init__(self, aliases: dict = None, websites: dict = None):
        self.aliases = {**APP_ALIASES, **(aliases or {})}
        self.websites = {**WEBSITE_SHORTCUTS, **(websites or {})}

    def open_app(self, app_name: str) -> dict:
        """Open an application by name."""
        app_lower = app_name.lower().strip()

        # Check if it's a website shortcut
        if app_lower in self.websites:
            return self.open_url(self.websites[app_lower])

        # Resolve alias
        command = self.aliases.get(app_lower, app_lower)

        try:
            # Check if command exists
            which_result = subprocess.run(
                ["which", command],
                capture_output=True, text=True, timeout=5,
            )

            if which_result.returncode != 0:
                # Try to find it with a fuzzy search
                for alias, cmd in self.aliases.items():
                    if app_lower in alias or alias in app_lower:
                        command = cmd
                        break
                else:
                    return {
                        "success": False,
                        "message": f"Application '{app_name}' not found. Available apps: {', '.join(sorted(self.aliases.keys()))}",
                    }

            # Launch the application
            env = os.environ.copy()
            subprocess.Popen(
                [command],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
                env=env,
            )
            logger.info(f"Opened application: {command}")
            return {"success": True, "message": f"Opening {app_name}"}

        except Exception as e:
            logger.error(f"Failed to open {app_name}: {e}")
            return {"success": False, "message": f"Failed to open {app_name}: {e}"}

    def close_app(self, app_name: str) -> dict:
        """Close an application by name."""
        app_lower = app_name.lower().strip()
        command = self.aliases.get(app_lower, app_lower)

        try:
            # Try wmctrl first (graceful close)
            result = subprocess.run(
                ["wmctrl", "-l"],
                capture_output=True, text=True, timeout=5,
            )

            closed = False
            if result.returncode == 0:
                for line in result.stdout.strip().split("\n"):
                    if app_lower in line.lower() or command in line.lower():
                        window_id = line.split()[0]
                        subprocess.run(
                            ["wmctrl", "-ic", window_id],
                            timeout=5,
                        )
                        closed = True

            if not closed:
                # Fallback to pkill
                subprocess.run(["pkill", "-f", command], timeout=5)
                closed = True

            if closed:
                return {"success": True, "message": f"Closed {app_name}"}
            else:
                return {"success": False, "message": f"Could not find {app_name} running"}

        except Exception as e:
            logger.error(f"Failed to close {app_name}: {e}")
            return {"success": False, "message": f"Failed to close {app_name}: {e}"}

    @staticmethod
    def open_url(url: str) -> dict:
        """Open a URL in the default browser."""
        try:
            if not url.startswith(("http://", "https://")):
                url = f"https://{url}"
            subprocess.Popen(
                ["xdg-open", url],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            return {"success": True, "message": f"Opening {url}"}
        except Exception as e:
            return {"success": False, "message": f"Failed to open URL: {e}"}

    @staticmethod
    def get_running_apps() -> list:
        """Get list of currently open windows/apps."""
        try:
            result = subprocess.run(
                ["wmctrl", "-l"],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0:
                apps = []
                for line in result.stdout.strip().split("\n"):
                    if line.strip():
                        parts = line.split(None, 3)
                        if len(parts) >= 4:
                            apps.append({
                                "window_id": parts[0],
                                "desktop": parts[1],
                                "host": parts[2],
                                "title": parts[3],
                            })
                return apps
        except Exception as e:
            logger.error(f"Failed to list apps: {e}")
        return []
