"""
J.A.R.V.I.S — Command Parser & Intent Engine
Parses natural language commands into structured intents and entities.
"""

import re
import logging
from typing import Optional
from difflib import get_close_matches

logger = logging.getLogger("jarvis.parser")


# ── Intent Patterns ──────────────────────────────────────────
# Each pattern: (compiled_regex, intent, entity_extractors)

INTENT_PATTERNS = [
    # ── App Control ──
    (r"(?:open|launch|start|run)\s+(?:the\s+)?(.+?)(?:\s+app(?:lication)?)?$", "open_app", {"app": 1}),
    (r"(?:close|quit|exit|kill|stop)\s+(?:the\s+)?(.+?)(?:\s+app(?:lication)?)?$", "close_app", {"app": 1}),

    # ── URLs / Websites ──
    (r"(?:open|go to|navigate to|visit)\s+(?:the\s+)?(?:website\s+)?(?:https?://\S+)", "open_url", {}),
    (r"(?:open|go to|browse)\s+(\w+\.(?:com|org|net|io|dev|ai)\S*)", "open_url", {"url": 1}),

    # ── Volume ──
    (r"(?:set|change|adjust)\s+(?:the\s+)?volume\s+(?:to\s+)?(\d+)\s*%?", "set_volume", {"level": 1}),
    (r"volume\s+(?:to\s+)?(\d+)\s*%?", "set_volume", {"level": 1}),
    (r"(?:turn|set)\s+(?:the\s+)?volume\s+(?:up|higher|louder)", "set_volume", {"level": "up"}),
    (r"(?:turn|set)\s+(?:the\s+)?volume\s+(?:down|lower|quieter)", "set_volume", {"level": "down"}),
    (r"(?:increase|raise)\s+(?:the\s+)?volume(?:\s+(?:by\s+)?(\d+))?", "set_volume", {"level": "up", "amount": 1}),
    (r"(?:decrease|lower|reduce)\s+(?:the\s+)?volume(?:\s+(?:by\s+)?(\d+))?", "set_volume", {"level": "down", "amount": 1}),
    (r"(?:mute|silence)(?:\s+(?:the\s+)?(?:audio|sound|volume))?", "mute", {}),
    (r"unmute(?:\s+(?:the\s+)?(?:audio|sound|volume))?", "unmute", {}),

    # ── Brightness ──
    (r"(?:set|change|adjust)\s+(?:the\s+)?brightness\s+(?:to\s+)?(\d+)\s*%?", "set_brightness", {"level": 1}),
    (r"brightness\s+(?:to\s+)?(\d+)\s*%?", "set_brightness", {"level": 1}),
    (r"(?:lower|dim|decrease|reduce)\s+(?:the\s+)?brightness(?:\s+(?:to\s+)?(\d+)\s*%?)?", "set_brightness", {"level": 1}),
    (r"(?:increase|raise|brighten)\s+(?:the\s+)?brightness(?:\s+(?:to\s+)?(\d+)\s*%?)?", "set_brightness", {"level": "up"}),

    # ── Wi-Fi ──
    (r"(?:turn|switch|enable)\s+(?:on\s+)?(?:the\s+)?(?:wi-?fi|wifi|wireless)", "wifi_on", {}),
    (r"(?:turn|switch|disable)\s+(?:off\s+)?(?:the\s+)?(?:wi-?fi|wifi|wireless)\s*(?:off)?", "wifi_off", {}),
    (r"(?:wi-?fi|wifi)\s+status", "wifi_status", {}),

    # ── Bluetooth ──
    (r"(?:turn|switch|enable)\s+(?:on\s+)?(?:the\s+)?bluetooth", "bluetooth_on", {}),
    (r"(?:turn|switch|disable)\s+(?:off\s+)?(?:the\s+)?bluetooth\s*(?:off)?", "bluetooth_off", {}),

    # ── System Stats ──
    (r"(?:show|get|display|what(?:'s| is))\s+(?:the\s+)?(?:system\s+)?(?:stats|status|statistics|info|information)", "system_stats", {}),
    (r"(?:how much|what(?:'s| is))\s+(?:the\s+)?(?:cpu|ram|memory|disk|battery|storage)", "system_stats", {}),
    (r"(?:cpu|ram|memory|disk|battery|storage)\s+(?:usage|status|info)", "system_stats", {}),

    # ── File Search ──
    (r"(?:search|find|look for|locate)\s+(?:(?:in|my)\s+)?(\w+)\s+(?:folder\s+)?(?:for\s+)?(.+)", "search_files", {"directory": 1, "pattern": 2}),
    (r"(?:search|find|look for|locate)\s+(?:for\s+)?(.+?)(?:\s+files?)?(?:\s+in\s+(.+))?$", "search_files", {"pattern": 1, "directory": 2}),
    (r"(?:recent|latest)\s+files?(?:\s+in\s+(.+))?", "recent_files", {"directory": 1}),

    # ── Media ──
    (r"(?:play|resume)\s+(?:the\s+)?music", "media_play", {}),
    (r"(?:pause|stop)\s+(?:the\s+)?music", "media_pause", {}),
    (r"(?:play|pause|toggle)\s*(?:the\s+)?(?:media|music|song|track)?", "media_play_pause", {}),
    (r"(?:next|skip)\s+(?:track|song)?", "media_next", {}),
    (r"(?:previous|prev|back)\s+(?:track|song)?", "media_prev", {}),
    (r"(?:what(?:'s| is))\s+(?:currently\s+)?playing", "now_playing", {}),
    (r"now\s+playing", "now_playing", {}),

    # ── Screenshot ──
    (r"(?:take|capture|grab)\s+(?:a\s+)?screenshot(?:\s+(?:of\s+)?(?:the\s+)?(window|screen|selection))?", "screenshot", {"region": 1}),

    # ── Power ──
    (r"(?:shut\s*down|power\s*off|turn\s*off)\s*(?:the\s+)?(?:system|computer|pc)?", "shutdown", {}),
    (r"(?:restart|reboot)\s*(?:the\s+)?(?:system|computer|pc)?", "restart", {}),
    (r"(?:sleep|suspend)\s*(?:the\s+)?(?:system|computer|pc)?", "sleep", {}),
    (r"(?:lock)\s*(?:the\s+)?(?:screen|system|computer|pc)?", "lock", {}),
    (r"(?:hibernate)", "hibernate", {}),

    # ── Clipboard ──
    (r"(?:what(?:'s| is))\s+(?:in\s+)?(?:the\s+)?clipboard", "get_clipboard", {}),
    (r"(?:copy|set)\s+(?:to\s+)?clipboard\s*:?\s*(.+)", "set_clipboard", {"content": 1}),

    # ── Time & Date ──
    (r"(?:what(?:'s| is))\s+(?:the\s+)?(?:current\s+)?time", "get_time", {}),
    (r"(?:what(?:'s| is))\s+(?:the\s+)?(?:current\s+)?(?:date|day)", "get_date", {}),
    (r"(?:what\s+)?(?:time|date)\s+is\s+it", "get_time", {}),

    # ── Battery (dedicated spoken response) ──
    (r"(?:what(?:'s| is))\s+(?:my\s+)?(?:the\s+)?battery(?:\s+(?:percentage|level|status))?", "battery_status", {}),
    (r"battery\s+(?:percentage|level|status)", "battery_status", {}),
    (r"how\s+much\s+battery", "battery_status", {}),

    # ── Empty Trash ──
    (r"(?:empty|clear|clean)\s+(?:the\s+)?(?:trash|recycle\s*bin|bin|rubbish)", "empty_trash", {}),

    # ── Notes ──
    (r"(?:create|make|save|take|write)\s+(?:a\s+)?note\s*(?:saying|that)?\s*:?\s*(.+)", "create_note", {"content": 1}),
    (r"(?:list|show|read)\s+(?:my\s+)?notes?", "list_notes", {}),
    (r"(?:read|open)\s+(?:the\s+)?(?:last|latest|recent)\s+note", "read_note", {}),

    # ── Reminders ──
    (r"(?:remind\s+me\s+(?:to\s+)?|set\s+(?:a\s+)?reminder\s+(?:to\s+)?)(.+)", "set_reminder", {"text": 1}),
    (r"(?:list|show|what are)\s+(?:my\s+)?reminders?", "list_reminders", {}),

    # ── Read Notifications ──
    (r"(?:read|show|what are)\s+(?:my\s+)?(?:the\s+)?notifications?", "read_notifications", {}),

    # ── Greeting ──
    (r"(?:hello|hi|hey|good\s+(?:morning|afternoon|evening)|what's up|how are you)", "greeting", {}),

    # ── Help ──
    (r"(?:help|what can you do|commands|features)", "help", {}),
]

# Pre-compile patterns
COMPILED_PATTERNS = [
    (re.compile(pattern, re.IGNORECASE), intent, entities)
    for pattern, intent, entities in INTENT_PATTERNS
]

# Directory name mapping for file search
DIRECTORY_MAP = {
    "downloads": "~/Downloads",
    "documents": "~/Documents",
    "desktop": "~/Desktop",
    "home": "~",
    "pictures": "~/Pictures",
    "videos": "~/Videos",
    "music": "~/Music",
}

# File type keywords
FILE_TYPE_MAP = {
    "pdfs": "pdf",
    "pdf": "pdf",
    "images": "png",
    "photos": "jpg",
    "videos": "mp4",
    "documents": "doc",
    "text files": "txt",
    "spreadsheets": "xlsx",
}


class CommandParser:
    """Parse natural language commands into structured intents."""

    def __init__(self):
        self.patterns = COMPILED_PATTERNS

    def parse(self, text: str) -> dict:
        """
        Parse a command string into an intent and entities.
        
        Returns:
            {
                'intent': str,
                'entities': dict,
                'raw_text': str,
                'confidence': float (0-1),
                'multi_step': bool,
                'steps': list (if multi_step)
            }
        """
        text = text.strip()
        if not text:
            return {"intent": "unknown", "entities": {}, "raw_text": "", "confidence": 0}

        # Check for multi-step commands (connected with "and", "then", "also")
        steps = self._split_multi_step(text)
        if len(steps) > 1:
            parsed_steps = [self._parse_single(step) for step in steps]
            return {
                "intent": "multi_step",
                "entities": {},
                "raw_text": text,
                "confidence": min(s["confidence"] for s in parsed_steps),
                "multi_step": True,
                "steps": parsed_steps,
            }

        result = self._parse_single(text)
        result["multi_step"] = False
        return result

    def _parse_single(self, text: str) -> dict:
        """Parse a single command."""
        # Remove wake word if present
        text = re.sub(r"^(?:hey\s+)?jarvis[,.]?\s*", "", text, flags=re.IGNORECASE).strip()

        if not text:
            return {"intent": "greeting", "entities": {}, "raw_text": text, "confidence": 0.8}

        # Try each pattern
        for regex, intent, entity_map in self.patterns:
            match = regex.search(text)
            if match:
                entities = self._extract_entities(match, entity_map, text)
                entities = self._post_process_entities(intent, entities)
                return {
                    "intent": intent,
                    "entities": entities,
                    "raw_text": text,
                    "confidence": 0.9,
                }

        # No pattern matched — try fuzzy matching for app names
        app_match = self._fuzzy_app_match(text)
        if app_match:
            return app_match

        # Complete fallback — treat it as an AI query
        return {
            "intent": "ai_query",
            "entities": {"query": text},
            "raw_text": text,
            "confidence": 0.3,
        }

    def _extract_entities(self, match: re.Match, entity_map: dict, text: str) -> dict:
        """Extract entities from regex match groups."""
        entities = {}
        for key, group_or_value in entity_map.items():
            if isinstance(group_or_value, int):
                try:
                    value = match.group(group_or_value)
                    if value:
                        entities[key] = value.strip()
                except IndexError:
                    pass
            else:
                entities[key] = group_or_value
        return entities

    def _post_process_entities(self, intent: str, entities: dict) -> dict:
        """Post-process extracted entities for specific intents."""
        # Convert numeric levels
        if "level" in entities:
            level = entities["level"]
            if isinstance(level, str):
                if level.isdigit():
                    entities["level"] = int(level)
                elif level == "up":
                    entities["level"] = "up"
                elif level == "down":
                    entities["level"] = "down"

        # Handle volume up/down with amount
        if intent == "set_volume" and entities.get("level") in ("up", "down"):
            # Will be resolved at execution time based on current volume
            pass

        # Resolve directory names
        if "directory" in entities and entities["directory"]:
            dir_name = entities["directory"].lower().strip()
            entities["directory"] = DIRECTORY_MAP.get(dir_name, f"~/{entities['directory']}")

        # Resolve file types
        if "pattern" in entities and entities["pattern"]:
            pattern_lower = entities["pattern"].lower()
            for keyword, ext in FILE_TYPE_MAP.items():
                if keyword in pattern_lower:
                    entities["file_type"] = ext
                    break

        # Map screenshot regions
        if intent == "screenshot" and "region" in entities:
            region = (entities.get("region") or "full").lower()
            if "window" in region:
                entities["region"] = "window"
            elif "select" in region or "area" in region:
                entities["region"] = "select"
            else:
                entities["region"] = "full"

        return entities

    def _split_multi_step(self, text: str) -> list:
        """Split a multi-step command into individual steps."""
        # Split on 'and', 'then', 'also', 'after that' — but not inside quotes
        parts = re.split(r'\s+(?:and\s+(?:then\s+)?|then\s+|also\s+|after\s+that\s+)', text, flags=re.IGNORECASE)
        return [p.strip() for p in parts if p.strip()]

    def _fuzzy_app_match(self, text: str) -> Optional[dict]:
        """Try to match text as an app open/close command using fuzzy matching."""
        from desktop_agent.app_control import APP_ALIASES

        words = text.lower().split()
        all_apps = list(APP_ALIASES.keys())

        for word in words:
            matches = get_close_matches(word, all_apps, n=1, cutoff=0.7)
            if matches:
                action = "open_app"
                if any(w in text.lower() for w in ["close", "quit", "exit", "kill", "stop"]):
                    action = "close_app"
                return {
                    "intent": action,
                    "entities": {"app": matches[0]},
                    "raw_text": text,
                    "confidence": 0.6,
                }

        return None


# ── Help Text ────────────────────────────────────────────────

HELP_TEXT = """Here's what I can do:

🖥️ **App Control**: "Open Spotify", "Close Chrome"
🔊 **Volume**: "Set volume to 50", "Mute", "Unmute"
🔆 **Brightness**: "Set brightness to 70", "Lower brightness"
📶 **Wi-Fi**: "Turn on Wi-Fi", "Turn off Wi-Fi"
📡 **Bluetooth**: "Enable Bluetooth", "Disable Bluetooth"
📊 **System Stats**: "Show system stats", "CPU usage"
🔋 **Battery**: "What is my battery", "Battery percentage"
🕐 **Time & Date**: "What time is it", "What's the date"
📁 **File Search**: "Search Downloads for PDFs", "Find photos in Pictures"
🎵 **Media**: "Play music", "Next track", "Now playing"
📸 **Screenshot**: "Take a screenshot", "Capture window"
⚡ **Power**: "Lock screen", "Shutdown", "Restart", "Sleep"
📋 **Clipboard**: "What's in clipboard"
🗑️ **Trash**: "Empty trash"
📝 **Notes**: "Create a note saying buy groceries", "List notes", "Read last note"
⏰ **Reminders**: "Remind me to call mom in 30 minutes", "List reminders"
🔔 **Notifications**: "Read notifications"
💬 **Multi-step**: "Open Spotify and lower brightness to 30 percent"
"""
