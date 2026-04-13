"""
J.A.R.V.I.S — Screenshot Agent
Capture screenshots using scrot or gnome-screenshot.
"""

import subprocess
import os
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("jarvis.screenshot")


class ScreenshotCapture:
    """Take screenshots on Linux desktop."""

    def __init__(self, save_dir: str = "~/Pictures/Screenshots"):
        self.save_dir = os.path.expanduser(save_dir)
        os.makedirs(self.save_dir, exist_ok=True)

    def capture(self, region: str = "full") -> dict:
        """
        Capture a screenshot.
        
        Args:
            region: 'full' for full screen, 'window' for active window, 'select' for selection
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"jarvis_screenshot_{timestamp}.png"
        filepath = os.path.join(self.save_dir, filename)

        # Try gnome-screenshot first (comes with Zorin OS)
        try:
            cmd = ["gnome-screenshot"]
            if region == "window":
                cmd.append("-w")
            elif region == "select":
                cmd.append("-a")
            cmd.extend(["-f", filepath])

            subprocess.run(cmd, check=True, timeout=30)

            if os.path.exists(filepath):
                size = os.path.getsize(filepath)
                return {
                    "success": True,
                    "message": f"Screenshot saved",
                    "path": filepath,
                    "size": size,
                }
        except (FileNotFoundError, subprocess.CalledProcessError):
            pass

        # Fallback to import (ImageMagick)
        try:
            cmd = ["import"]
            if region == "full":
                cmd.extend(["-window", "root"])
            elif region == "window":
                # Get active window
                result = subprocess.run(
                    ["xdotool", "getactivewindow"],
                    capture_output=True, text=True, timeout=5,
                )
                if result.returncode == 0:
                    cmd.extend(["-window", result.stdout.strip()])
            cmd.append(filepath)

            subprocess.run(cmd, check=True, timeout=30)

            if os.path.exists(filepath):
                return {
                    "success": True,
                    "message": "Screenshot saved",
                    "path": filepath,
                }
        except Exception:
            pass

        return {"success": False, "message": "Failed to capture screenshot. Install gnome-screenshot or scrot."}
