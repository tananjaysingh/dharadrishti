"""
J.A.R.V.I.S — System Control Agent
Controls volume, brightness, Wi-Fi, Bluetooth, and reads system stats.
"""

import subprocess
import logging
import psutil
import time
from typing import Optional

logger = logging.getLogger("jarvis.system_control")


class SystemControl:
    """Linux desktop system control using pactl, xrandr, nmcli, bluetoothctl."""

    # ── Volume ────────────────────────────────────────────

    @staticmethod
    def get_volume() -> int:
        """Get current volume level (0-100)."""
        try:
            result = subprocess.run(
                ["pactl", "get-sink-volume", "@DEFAULT_SINK@"],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0:
                # Parse "Volume: front-left: 65536 / 100% / ..."
                for part in result.stdout.split("/"):
                    part = part.strip()
                    if part.endswith("%"):
                        return int(part[:-1])
        except Exception as e:
            logger.error(f"Failed to get volume: {e}")
        return 50

    @staticmethod
    def set_volume(level: int) -> dict:
        """Set volume level (0-100)."""
        level = max(0, min(100, level))
        try:
            subprocess.run(
                ["pactl", "set-sink-volume", "@DEFAULT_SINK@", f"{level}%"],
                check=True, timeout=5,
            )
            return {"success": True, "message": f"Volume set to {level}%", "level": level}
        except Exception as e:
            logger.error(f"Failed to set volume: {e}")
            return {"success": False, "message": f"Failed to set volume: {e}"}

    @staticmethod
    def mute(mute: bool = True) -> dict:
        """Mute or unmute audio."""
        try:
            val = "1" if mute else "0"
            subprocess.run(
                ["pactl", "set-sink-mute", "@DEFAULT_SINK@", val],
                check=True, timeout=5,
            )
            action = "muted" if mute else "unmuted"
            return {"success": True, "message": f"Audio {action}"}
        except Exception as e:
            return {"success": False, "message": f"Failed to mute: {e}"}

    # ── Brightness ────────────────────────────────────────

    @staticmethod
    def get_brightness() -> int:
        """Get current brightness level (0-100)."""
        try:
            # Try brightnessctl first
            result = subprocess.run(
                ["brightnessctl", "get"],
                capture_output=True, text=True, timeout=5,
            )
            max_result = subprocess.run(
                ["brightnessctl", "max"],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0 and max_result.returncode == 0:
                current = int(result.stdout.strip())
                maximum = int(max_result.stdout.strip())
                return int((current / maximum) * 100)
        except FileNotFoundError:
            pass

        # Fallback to xrandr
        try:
            result = subprocess.run(
                ["xrandr", "--verbose"],
                capture_output=True, text=True, timeout=5,
            )
            for line in result.stdout.split("\n"):
                if "Brightness:" in line:
                    brightness = float(line.split(":")[1].strip())
                    return int(brightness * 100)
        except Exception as e:
            logger.error(f"Failed to get brightness: {e}")
        return 50

    @staticmethod
    def set_brightness(level: int) -> dict:
        """Set brightness level (0-100)."""
        level = max(5, min(100, level))  # Minimum 5% to prevent black screen
        try:
            # Try brightnessctl first
            subprocess.run(
                ["brightnessctl", "set", f"{level}%"],
                check=True, timeout=5,
            )
            return {"success": True, "message": f"Brightness set to {level}%", "level": level}
        except FileNotFoundError:
            pass

        # Fallback to xrandr
        try:
            result = subprocess.run(
                ["xrandr", "--listmonitors"],
                capture_output=True, text=True, timeout=5,
            )
            monitors = []
            for line in result.stdout.strip().split("\n")[1:]:
                parts = line.strip().split()
                if parts:
                    monitors.append(parts[-1])

            brightness_val = level / 100.0
            for monitor in monitors:
                subprocess.run(
                    ["xrandr", "--output", monitor, "--brightness", str(brightness_val)],
                    check=True, timeout=5,
                )
            return {"success": True, "message": f"Brightness set to {level}%", "level": level}
        except Exception as e:
            logger.error(f"Failed to set brightness: {e}")
            return {"success": False, "message": f"Failed to set brightness: {e}"}

    # ── Wi-Fi ─────────────────────────────────────────────

    @staticmethod
    def toggle_wifi(on: bool) -> dict:
        """Enable or disable Wi-Fi."""
        try:
            action = "on" if on else "off"
            subprocess.run(["nmcli", "radio", "wifi", action], check=True, timeout=10)
            state = "enabled" if on else "disabled"
            return {"success": True, "message": f"Wi-Fi {state}"}
        except Exception as e:
            return {"success": False, "message": f"Failed to toggle Wi-Fi: {e}"}

    @staticmethod
    def get_wifi_status() -> dict:
        """Get Wi-Fi connection status."""
        try:
            result = subprocess.run(
                ["nmcli", "-t", "-f", "WIFI", "general"],
                capture_output=True, text=True, timeout=5,
            )
            enabled = "enabled" in result.stdout.lower()

            ssid = None
            if enabled:
                conn = subprocess.run(
                    ["nmcli", "-t", "-f", "NAME,TYPE", "connection", "show", "--active"],
                    capture_output=True, text=True, timeout=5,
                )
                for line in conn.stdout.strip().split("\n"):
                    if "wireless" in line.lower() or "wifi" in line.lower():
                        ssid = line.split(":")[0]
                        break

            return {"enabled": enabled, "connected": ssid is not None, "ssid": ssid}
        except Exception as e:
            return {"enabled": False, "connected": False, "ssid": None, "error": str(e)}

    # ── Bluetooth ─────────────────────────────────────────

    @staticmethod
    def toggle_bluetooth(on: bool) -> dict:
        """Enable or disable Bluetooth."""
        try:
            action = "on" if on else "off"
            subprocess.run(["bluetoothctl", "power", action], check=True, timeout=10)
            state = "enabled" if on else "disabled"
            return {"success": True, "message": f"Bluetooth {state}"}
        except Exception as e:
            return {"success": False, "message": f"Failed to toggle Bluetooth: {e}"}

    # ── System Stats ──────────────────────────────────────

    @staticmethod
    def get_stats() -> dict:
        """Get comprehensive system statistics."""
        cpu_percent = psutil.cpu_percent(interval=0.5)

        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        battery = psutil.sensors_battery()
        battery_percent = battery.percent if battery else None
        battery_charging = battery.power_plugged if battery else None

        # CPU temperature
        cpu_temp = None
        try:
            temps = psutil.sensors_temperatures()
            if temps:
                for name, entries in temps.items():
                    if entries:
                        cpu_temp = entries[0].current
                        break
        except Exception:
            pass

        boot_time = psutil.boot_time()
        uptime = time.time() - boot_time

        # Network
        net = psutil.net_if_stats()
        network_up = any(v.isup for v in net.values() if v.isup)

        return {
            "cpu_percent": cpu_percent,
            "ram_total_gb": round(mem.total / (1024 ** 3), 1),
            "ram_used_gb": round(mem.used / (1024 ** 3), 1),
            "ram_percent": mem.percent,
            "disk_total_gb": round(disk.total / (1024 ** 3), 1),
            "disk_used_gb": round(disk.used / (1024 ** 3), 1),
            "disk_percent": round(disk.percent, 1),
            "battery_percent": battery_percent,
            "battery_charging": battery_charging,
            "cpu_temp": cpu_temp,
            "uptime_seconds": uptime,
            "network_up": network_up,
        }
