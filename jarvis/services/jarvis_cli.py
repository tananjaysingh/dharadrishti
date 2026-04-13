#!/usr/bin/env python3
"""
J.A.R.V.I.S — CLI Tool
========================
Send commands to Jarvis from the terminal without voice.

Usage:
    python3 services/jarvis_cli.py "open Spotify"
    python3 services/jarvis_cli.py "what time is it"
    python3 services/jarvis_cli.py "show system stats"
    python3 services/jarvis_cli.py --status
    python3 services/jarvis_cli.py --history
    python3 services/jarvis_cli.py --interactive
"""

import os
import sys
import json
import argparse
from pathlib import Path

# Setup paths
SERVICE_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SERVICE_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Colors
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
DIM = "\033[2m"
BOLD = "\033[1m"
NC = "\033[0m"

STATE_FILE = "/tmp/jarvis_state.json"


def print_banner():
    print(f"""
{CYAN}  ┌─────────────────────────────────────┐
  │  J.A.R.V.I.S — Command Line Tool    │
  └─────────────────────────────────────┘{NC}
""")


def get_status():
    """Read the service state from /tmp/jarvis_state.json."""
    if not os.path.exists(STATE_FILE):
        print(f"  {RED}● J.A.R.V.I.S service is not running{NC}")
        print(f"  {DIM}Start with: python3 services/jarvis_service.py{NC}")
        return

    try:
        with open(STATE_FILE) as f:
            state = json.load(f)

        # Check if PID is still alive
        pid = state.get("pid")
        if pid and not _is_process_alive(pid):
            print(f"  {RED}● J.A.R.V.I.S service is not running (stale state){NC}")
            return

        status_color = GREEN if state["state"] == "idle" else YELLOW
        print(f"  {status_color}● State: {state['state'].upper()}{NC}")
        print(f"  {CYAN}  PID: {state.get('pid', '?')}{NC}")
        print(f"  {CYAN}  Voice: {'Enabled' if state.get('voice_enabled') else 'Disabled'}{NC}")
        print(f"  {CYAN}  Commands executed: {state.get('command_count', 0)}{NC}")

        uptime = state.get("uptime_seconds", 0)
        hours, remainder = divmod(uptime, 3600)
        minutes, seconds = divmod(remainder, 60)
        print(f"  {CYAN}  Uptime: {int(hours)}h {int(minutes)}m {int(seconds)}s{NC}")

        if state.get("last_command"):
            print(f"  {DIM}  Last command: \"{state['last_command']}\"{NC}")
            print(f"  {DIM}  Last response: \"{state['last_response']}\"{NC}")

    except Exception as e:
        print(f"  {RED}Error reading state: {e}{NC}")


def get_history(count: int = 20):
    """Display recent command history from JSONL log."""
    log_file = PROJECT_ROOT / "logs" / "command_history.jsonl"
    if not log_file.exists():
        print(f"  {DIM}No command history yet.{NC}")
        return

    try:
        with open(log_file) as f:
            lines = f.readlines()

        entries = [json.loads(line) for line in lines[-count:]]

        if not entries:
            print(f"  {DIM}No command history yet.{NC}")
            return

        print(f"  {CYAN}Recent Commands ({len(entries)}):{NC}\n")
        for entry in entries:
            ts = entry.get("timestamp", "?")[:19].replace("T", " ")
            cmd = entry.get("command", "?")
            intent = entry.get("intent", "?")
            response = entry.get("response", "")[:60]
            elapsed = entry.get("elapsed_ms", 0)
            ok = entry.get("success", False)

            icon = f"{GREEN}✓{NC}" if ok else f"{RED}✗{NC}"
            print(f"  {icon} {DIM}{ts}{NC}  {YELLOW}\"{cmd}\"{NC}")
            print(f"    {CYAN}→ {intent}{NC}  {DIM}{response}  ({elapsed}ms){NC}")
            print()

    except Exception as e:
        print(f"  {RED}Error reading history: {e}{NC}")


def execute_command(text: str, speak: bool = False):
    """Execute a single command."""
    # Suppress logging for CLI
    import logging
    logging.disable(logging.WARNING)

    from services.jarvis_service import JarvisService
    svc = JarvisService(voice_enabled=False)

    response = svc.process_text(text)

    print(f"  {YELLOW}You:{NC} \"{text}\"")
    print(f"  {CYAN}Jarvis:{NC} {response}")

    # Optionally speak the response
    if speak:
        try:
            import subprocess
            subprocess.run(
                ["espeak-ng", "-v", "en-us", "-s", "160", response],
                timeout=30, capture_output=True,
            )
        except Exception:
            pass


def run_interactive():
    """Run an interactive REPL."""
    import logging
    logging.disable(logging.WARNING)

    from services.jarvis_service import JarvisService
    svc = JarvisService(voice_enabled=False)

    print_banner()
    print(f"  {DIM}Type commands, or 'quit' to exit{NC}\n")

    while True:
        try:
            text = input(f"  {YELLOW}You ❯ {NC}").strip()
            if not text:
                continue
            if text.lower() in ("quit", "exit", "bye", "q"):
                print(f"\n  {CYAN}Goodbye, sir.{NC}\n")
                break

            response = svc.process_text(text)
            print(f"  {CYAN}Jarvis:{NC} {response}\n")

        except (EOFError, KeyboardInterrupt):
            print(f"\n  {CYAN}Goodbye, sir.{NC}\n")
            break


def _is_process_alive(pid: int) -> bool:
    """Check if a process is still running."""
    try:
        os.kill(pid, 0)
        return True
    except (OSError, ProcessLookupError):
        return False


# ── Entry Point ──

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="J.A.R.V.I.S CLI — Send commands from the terminal",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s "open Spotify"
  %(prog)s "what time is it"
  %(prog)s "show system stats"
  %(prog)s --status
  %(prog)s --history
  %(prog)s --interactive
""",
    )
    parser.add_argument("command", nargs="?", help="Command to execute")
    parser.add_argument("--status", action="store_true", help="Show service status")
    parser.add_argument("--history", action="store_true", help="Show command history")
    parser.add_argument("--interactive", "-i", action="store_true", help="Interactive REPL mode")
    parser.add_argument("--speak", "-s", action="store_true", help="Speak the response (requires espeak-ng)")
    parser.add_argument("--count", "-n", type=int, default=20, help="Number of history entries")

    args = parser.parse_args()

    if args.status:
        print_banner()
        get_status()
    elif args.history:
        print_banner()
        get_history(args.count)
    elif args.interactive:
        run_interactive()
    elif args.command:
        execute_command(args.command, speak=args.speak)
    else:
        parser.print_help()
