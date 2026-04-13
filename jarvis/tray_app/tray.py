#!/usr/bin/env python3
"""
J.A.R.V.I.S — System Tray App
===============================
Lightweight GTK-based system tray indicator showing Jarvis status.
Reads state from /tmp/jarvis_state.json (written by jarvis_service.py).

Features:
    - Status icon (green=idle, amber=listening, blue=processing)
    - Last command display
    - Quick actions: Mute mic, Open HUD, Restart, Quit
    - Uptime and command count
"""

import os
import sys
import json
import subprocess
import signal
from pathlib import Path

STATE_FILE = "/tmp/jarvis_state.json"
PROJECT_ROOT = Path(__file__).parent.parent.resolve()

# Check for GTK/AppIndicator availability
try:
    import gi
    gi.require_version("Gtk", "3.0")
    gi.require_version("AppIndicator3", "0.1")
    from gi.repository import Gtk, GLib, AppIndicator3
    GTK_AVAILABLE = True
except (ImportError, ValueError):
    GTK_AVAILABLE = False


def read_state() -> dict:
    """Read current Jarvis state."""
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE) as f:
                return json.load(f)
    except Exception:
        pass
    return {"state": "offline", "voice_enabled": False, "command_count": 0}


def is_service_running() -> bool:
    """Check if the Jarvis service is running."""
    state = read_state()
    pid = state.get("pid")
    if pid:
        try:
            os.kill(pid, 0)
            return True
        except (OSError, ProcessLookupError):
            pass
    return False


class JarvisTray:
    """GTK AppIndicator3-based system tray."""

    def __init__(self):
        self.indicator = AppIndicator3.Indicator.new(
            "jarvis-assistant",
            "audio-input-microphone",  # Default icon
            AppIndicator3.IndicatorCategory.APPLICATION_STATUS,
        )
        self.indicator.set_status(AppIndicator3.IndicatorStatus.ACTIVE)
        self.indicator.set_title("J.A.R.V.I.S")

        # Build menu
        self.menu = Gtk.Menu()
        self._build_menu()
        self.indicator.set_menu(self.menu)

        # Status update timer — every 2 seconds
        GLib.timeout_add_seconds(2, self._update_status)

    def _build_menu(self):
        """Build the tray menu."""
        # Status header
        self.status_item = Gtk.MenuItem(label="● J.A.R.V.I.S — Checking...")
        self.status_item.set_sensitive(False)
        self.menu.append(self.status_item)

        self.menu.append(Gtk.SeparatorMenuItem())

        # Last command
        self.last_cmd_item = Gtk.MenuItem(label="Last: —")
        self.last_cmd_item.set_sensitive(False)
        self.menu.append(self.last_cmd_item)

        # Command count
        self.count_item = Gtk.MenuItem(label="Commands: 0")
        self.count_item.set_sensitive(False)
        self.menu.append(self.count_item)

        # Uptime
        self.uptime_item = Gtk.MenuItem(label="Uptime: —")
        self.uptime_item.set_sensitive(False)
        self.menu.append(self.uptime_item)

        self.menu.append(Gtk.SeparatorMenuItem())

        # ── Actions ──
        open_hud = Gtk.MenuItem(label="🖥️  Open HUD Dashboard")
        open_hud.connect("activate", self._open_hud)
        self.menu.append(open_hud)

        open_cli = Gtk.MenuItem(label="💻  Open CLI")
        open_cli.connect("activate", self._open_cli)
        self.menu.append(open_cli)

        self.menu.append(Gtk.SeparatorMenuItem())

        # Restart
        restart_item = Gtk.MenuItem(label="🔄  Restart Service")
        restart_item.connect("activate", self._restart_service)
        self.menu.append(restart_item)

        # Stop
        stop_item = Gtk.MenuItem(label="⏹️  Stop Service")
        stop_item.connect("activate", self._stop_service)
        self.menu.append(stop_item)

        self.menu.append(Gtk.SeparatorMenuItem())

        # Quit tray
        quit_item = Gtk.MenuItem(label="❌  Quit Tray")
        quit_item.connect("activate", self._quit)
        self.menu.append(quit_item)

        self.menu.show_all()

    def _update_status(self):
        """Update tray status from state file."""
        state = read_state()
        svc_state = state.get("state", "offline")

        # Update icon based on state
        if svc_state == "offline":
            self.indicator.set_icon_full("dialog-error", "Offline")
            self.status_item.set_label("● J.A.R.V.I.S — OFFLINE")
        elif svc_state == "idle":
            self.indicator.set_icon_full("audio-input-microphone", "Ready")
            self.status_item.set_label("● J.A.R.V.I.S — READY")
        elif svc_state == "listening":
            self.indicator.set_icon_full("audio-volume-high", "Listening")
            self.status_item.set_label("● J.A.R.V.I.S — LISTENING")
        elif svc_state == "processing":
            self.indicator.set_icon_full("system-run", "Processing")
            self.status_item.set_label("● J.A.R.V.I.S — PROCESSING")
        elif svc_state == "responding":
            self.indicator.set_icon_full("audio-speakers", "Speaking")
            self.status_item.set_label("● J.A.R.V.I.S — SPEAKING")
        else:
            self.indicator.set_icon_full("dialog-information", svc_state)
            self.status_item.set_label(f"● J.A.R.V.I.S — {svc_state.upper()}")

        # Update info
        last = state.get("last_command", "")
        if last:
            self.last_cmd_item.set_label(f"Last: \"{last[:40]}\"")
        else:
            self.last_cmd_item.set_label("Last: —")

        self.count_item.set_label(f"Commands: {state.get('command_count', 0)}")

        uptime = state.get("uptime_seconds", 0)
        if uptime > 0:
            hours, remainder = divmod(uptime, 3600)
            minutes, _ = divmod(remainder, 60)
            self.uptime_item.set_label(f"Uptime: {int(hours)}h {int(minutes)}m")
        else:
            self.uptime_item.set_label("Uptime: —")

        return True  # Keep the timer running

    def _open_hud(self, _):
        """Open the web HUD in browser."""
        subprocess.Popen(["xdg-open", "http://localhost:5173"], 
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def _open_cli(self, _):
        """Open a terminal with Jarvis CLI."""
        cli_path = PROJECT_ROOT / "services" / "jarvis_cli.py"
        subprocess.Popen(
            ["gnome-terminal", "--", "python3", str(cli_path), "--interactive"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )

    def _restart_service(self, _):
        """Restart the Jarvis systemd service."""
        subprocess.Popen(
            ["systemctl", "--user", "restart", "jarvis.service"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )

    def _stop_service(self, _):
        """Stop the Jarvis service."""
        state = read_state()
        pid = state.get("pid")
        if pid:
            try:
                os.kill(pid, signal.SIGTERM)
            except Exception:
                pass

    def _quit(self, _):
        """Quit the tray app."""
        Gtk.main_quit()

    def run(self):
        """Start the GTK main loop."""
        Gtk.main()


# ── Fallback for systems without AppIndicator3 ──

class JarvisTrayFallback:
    """Simple terminal-based status display as fallback."""

    def run(self):
        CYAN = "\033[96m"
        NC = "\033[0m"
        print(f"\n{CYAN}  J.A.R.V.I.S Tray (text fallback){NC}")
        print(f"  AppIndicator3 not available.")
        print(f"  Install: sudo apt install gir1.2-appindicator3-0.1")
        print(f"\n  Showing live status (Ctrl+C to stop):\n")

        import time
        try:
            while True:
                state = read_state()
                svc_state = state.get("state", "offline")
                count = state.get("command_count", 0)
                last = state.get("last_command", "—")
                uptime = state.get("uptime_seconds", 0)
                h, r = divmod(uptime, 3600)
                m, _ = divmod(r, 60)

                print(f"\r  State: {svc_state.upper():12s} | "
                      f"Commands: {count:4d} | "
                      f"Last: \"{last[:30]:30s}\" | "
                      f"Uptime: {int(h)}h{int(m)}m", end="", flush=True)
                time.sleep(2)
        except KeyboardInterrupt:
            print("\n")


if __name__ == "__main__":
    if GTK_AVAILABLE:
        signal.signal(signal.SIGINT, signal.SIG_DFL)  # Allow Ctrl+C
        tray = JarvisTray()
        tray.run()
    else:
        fallback = JarvisTrayFallback()
        fallback.run()
