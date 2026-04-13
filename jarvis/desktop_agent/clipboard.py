"""
J.A.R.V.I.S — Clipboard Agent
Manage clipboard content between PC and mobile.
"""

import subprocess
import logging

logger = logging.getLogger("jarvis.clipboard")


class ClipboardManager:
    """Manage system clipboard using xclip or xsel."""

    @staticmethod
    def get_clipboard() -> dict:
        """Get current clipboard content."""
        try:
            result = subprocess.run(
                ["xclip", "-selection", "clipboard", "-o"],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0:
                content = result.stdout
                return {
                    "success": True,
                    "content": content,
                    "length": len(content),
                }
        except FileNotFoundError:
            # Try xsel
            try:
                result = subprocess.run(
                    ["xsel", "--clipboard", "--output"],
                    capture_output=True, text=True, timeout=5,
                )
                if result.returncode == 0:
                    return {"success": True, "content": result.stdout, "length": len(result.stdout)}
            except FileNotFoundError:
                pass

        return {"success": False, "message": "Could not read clipboard. Install xclip: sudo apt install xclip"}

    @staticmethod
    def set_clipboard(content: str) -> dict:
        """Set clipboard content."""
        try:
            proc = subprocess.Popen(
                ["xclip", "-selection", "clipboard"],
                stdin=subprocess.PIPE,
                timeout=5,
            )
            proc.communicate(input=content.encode())
            return {"success": True, "message": "Copied to clipboard"}
        except FileNotFoundError:
            try:
                proc = subprocess.Popen(
                    ["xsel", "--clipboard", "--input"],
                    stdin=subprocess.PIPE,
                    timeout=5,
                )
                proc.communicate(input=content.encode())
                return {"success": True, "message": "Copied to clipboard"}
            except FileNotFoundError:
                pass

        return {"success": False, "message": "Install xclip: sudo apt install xclip"}
