"""
J.A.R.V.I.S — Media Control Agent
Control media playback using playerctl and media keys.
"""

import subprocess
import logging

logger = logging.getLogger("jarvis.media_control")


class MediaControl:
    """Control media playback across applications using playerctl."""

    @staticmethod
    def _run_playerctl(*args) -> dict:
        """Run a playerctl command."""
        try:
            result = subprocess.run(
                ["playerctl", *args],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0:
                return {"success": True, "output": result.stdout.strip()}
            else:
                return {"success": False, "message": result.stderr.strip() or "No active media player"}
        except FileNotFoundError:
            return {"success": False, "message": "playerctl not installed. Install with: sudo apt install playerctl"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def play_pause() -> dict:
        """Toggle play/pause on the active media player."""
        result = MediaControl._run_playerctl("play-pause")
        if result["success"]:
            result["message"] = "Toggled play/pause"
        return result

    @staticmethod
    def play() -> dict:
        result = MediaControl._run_playerctl("play")
        if result["success"]:
            result["message"] = "Playing"
        return result

    @staticmethod
    def pause() -> dict:
        result = MediaControl._run_playerctl("pause")
        if result["success"]:
            result["message"] = "Paused"
        return result

    @staticmethod
    def next_track() -> dict:
        result = MediaControl._run_playerctl("next")
        if result["success"]:
            result["message"] = "Skipped to next track"
        return result

    @staticmethod
    def prev_track() -> dict:
        result = MediaControl._run_playerctl("previous")
        if result["success"]:
            result["message"] = "Went to previous track"
        return result

    @staticmethod
    def stop() -> dict:
        result = MediaControl._run_playerctl("stop")
        if result["success"]:
            result["message"] = "Stopped playback"
        return result

    @staticmethod
    def get_now_playing() -> dict:
        """Get currently playing track info."""
        title = MediaControl._run_playerctl("metadata", "title")
        artist = MediaControl._run_playerctl("metadata", "artist")
        status = MediaControl._run_playerctl("status")

        if title["success"]:
            return {
                "success": True,
                "title": title.get("output", "Unknown"),
                "artist": artist.get("output", "Unknown"),
                "status": status.get("output", "Unknown"),
                "message": f"Now playing: {title.get('output', 'Unknown')} by {artist.get('output', 'Unknown')}",
            }
        return {"success": False, "message": "No media currently playing"}

    @staticmethod
    def set_player_volume(level: int) -> dict:
        """Set volume on the active media player (0-100)."""
        vol = max(0.0, min(1.0, level / 100.0))
        result = MediaControl._run_playerctl("volume", str(vol))
        if result["success"]:
            result["message"] = f"Player volume set to {level}%"
        return result
