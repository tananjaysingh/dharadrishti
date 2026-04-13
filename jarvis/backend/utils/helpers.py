"""
J.A.R.V.I.S — Helper Utilities
Configuration loading and misc helpers.
"""

import os
import yaml
from pathlib import Path
from typing import Any


def get_project_root() -> Path:
    """Get the project root directory."""
    return Path(__file__).parent.parent.parent


def load_config(config_path: str = None) -> dict:
    """Load configuration from YAML file."""
    if config_path is None:
        config_path = get_project_root() / "config" / "settings.yaml"
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def load_commands_config(config_path: str = None) -> dict:
    """Load custom commands configuration."""
    if config_path is None:
        config_path = get_project_root() / "config" / "commands.yaml"
    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def expand_path(path: str) -> str:
    """Expand ~ and environment variables in a path."""
    return os.path.expanduser(os.path.expandvars(path))


def get_time_greeting() -> str:
    """Get a time-appropriate greeting."""
    from datetime import datetime
    hour = datetime.now().hour
    if hour < 6:
        return "It's quite late, sir. How can I help?"
    elif hour < 12:
        return "Good morning, sir."
    elif hour < 17:
        return "Good afternoon, sir."
    elif hour < 21:
        return "Good evening, sir."
    else:
        return "Working late, sir. At your service."


def format_bytes(size_bytes: int) -> str:
    """Format bytes into human readable string."""
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} PB"


def format_duration(seconds: float) -> str:
    """Format seconds into human readable duration."""
    if seconds < 60:
        return f"{seconds:.0f}s"
    elif seconds < 3600:
        m, s = divmod(seconds, 60)
        return f"{int(m)}m {int(s)}s"
    elif seconds < 86400:
        h, remainder = divmod(seconds, 3600)
        m, _ = divmod(remainder, 60)
        return f"{int(h)}h {int(m)}m"
    else:
        d, remainder = divmod(seconds, 86400)
        h, _ = divmod(remainder, 3600)
        return f"{int(d)}d {int(h)}h"


def sanitize_command(text: str) -> str:
    """Basic sanitization for command text."""
    # Remove potential shell injection characters for safety
    dangerous_chars = [";", "&&", "||", "|", "`", "$(",  "$(", ">>", "<<"]
    sanitized = text
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, "")
    return sanitized.strip()
