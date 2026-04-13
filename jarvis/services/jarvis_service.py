#!/usr/bin/env python3
"""
J.A.R.V.I.S — Background Service
=================================
The core daemon that runs Jarvis as a real Linux desktop tool.
Continuously listens for the wake word, transcribes commands,
executes them locally, and speaks the response.

Runs independently of any web server or browser.

Usage:
    python3 services/jarvis_service.py              # Normal background mode
    python3 services/jarvis_service.py --no-voice   # Text-only mode (no mic)
    python3 services/jarvis_service.py --test        # Quick self-test
"""

import os
import sys
import json
import time
import signal
import logging
import argparse
import threading
from pathlib import Path
from datetime import datetime

# ── Setup project paths ──
SERVICE_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SERVICE_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.utils.helpers import load_config, load_commands_config, get_time_greeting
from backend.core.command_parser import CommandParser, HELP_TEXT
from desktop_agent.agent import DesktopAgent

# ── Constants ──
STATE_FILE = "/tmp/jarvis_state.json"
LOG_DIR = PROJECT_ROOT / "logs"
LOG_DIR.mkdir(exist_ok=True)

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / "jarvis_service.log"),
    ],
)
logger = logging.getLogger("jarvis")

# Suppress noisy loggers
logging.getLogger("faster_whisper").setLevel(logging.WARNING)
logging.getLogger("openwakeword").setLevel(logging.WARNING)


# ── Banner ──
BANNER = """
\033[96m
   ╔════════════════════════════════════════════════════════════╗
   ║                                                            ║
   ║        ██╗ █████╗ ██████╗ ██╗   ██╗██╗███████╗             ║
   ║        ██║██╔══██╗██╔══██╗██║   ██║██║██╔════╝             ║
   ║        ██║███████║██████╔╝██║   ██║██║███████╗             ║
   ║   ██   ██║██╔══██║██╔══██╗╚██╗ ██╔╝██║╚════██║             ║
   ║   ╚█████╔╝██║  ██║██║  ██║ ╚████╔╝ ██║███████║             ║
   ║    ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝             ║
   ║                                                            ║
   ║        Just A Really Very Intelligent System               ║
   ║        Background Service for Zorin OS                     ║
   ║                                                            ║
   ╚════════════════════════════════════════════════════════════╝
\033[0m"""


class JarvisService:
    """
    The main Jarvis background daemon.
    
    Lifecycle:
        1. Load config → Init parser + agent
        2. Init voice engine (wake word + STT + TTS)
        3. Loop: wake word → record → transcribe → execute → speak
        4. Write state to /tmp/jarvis_state.json for tray app
        5. Handle SIGTERM/SIGINT for graceful shutdown
    """

    def __init__(self, voice_enabled: bool = True):
        self.voice_enabled = voice_enabled
        self._running = False
        self._state = "initializing"
        self._last_command = ""
        self._last_response = ""
        self._command_count = 0
        self._start_time = time.time()

        # Load config
        self.config = load_config()
        self.commands_config = load_commands_config()

        # Init parser
        self.parser = CommandParser()

        # Init desktop agent
        agent_config = {**self.commands_config, **self.config.get("desktop", {})}
        self.agent = DesktopAgent(config=agent_config)

        # Voice engine (lazy loaded)
        self._voice_engine = None
        self._tts = None

        # Wire up the agent's speak callback for reminders
        self.agent.set_speak_callback(self._speak)

        logger.info("Core systems initialized")

    def _init_voice(self):
        """Initialize the voice engine components."""
        if not self.voice_enabled:
            logger.info("Voice disabled — text-only mode")
            return

        logger.info("Initializing voice engine...")
        try:
            from voice_engine.speech_to_text import SpeechToText
            from voice_engine.text_to_speech import TextToSpeech
            from voice_engine.wake_word import WakeWordDetector

            voice_config = self.config.get("voice", {})

            # Init STT
            self._stt = SpeechToText(
                model_size=voice_config.get("stt_model", "small"),
                device=voice_config.get("stt_device", "cpu"),
            )
            logger.info(f"  ✓ Speech-to-Text loaded ({voice_config.get('stt_model', 'small')})")

            # Init TTS
            self._tts = TextToSpeech()
            logger.info("  ✓ Text-to-Speech loaded")

            # Init wake word
            self._wake_word = WakeWordDetector(
                wake_word="jarvis",
                threshold=voice_config.get("wake_word_threshold", 0.5),
                on_wake=self._on_wake_detected,
            )
            logger.info("  ✓ Wake word detector loaded")

            self.voice_enabled = True
            logger.info("Voice engine ready — say 'Jarvis' to begin")

        except ImportError as e:
            logger.warning(f"Voice dependencies not installed: {e}")
            logger.warning("Running in text-only mode. Install voice deps: pip install pyaudio openwakeword faster-whisper piper-tts")
            self.voice_enabled = False
        except Exception as e:
            logger.error(f"Failed to initialize voice engine: {e}")
            self.voice_enabled = False

    def start(self):
        """Start the Jarvis service."""
        print(BANNER)
        self._running = True

        # Register signal handlers
        signal.signal(signal.SIGTERM, self._handle_signal)
        signal.signal(signal.SIGINT, self._handle_signal)

        # Greeting
        greeting = get_time_greeting()
        logger.info(f"  {greeting}")

        # Init voice
        self._init_voice()

        # Update state
        self._set_state("idle")
        self._write_state()

        if self.voice_enabled:
            # Play startup chime
            self._play_chime("activate")

            # Speak greeting
            self._speak(greeting)

            # Start wake word detection
            logger.info("Starting wake word listener...")
            self._wake_word.start()

            # Main loop — keep alive while wake word runs in background
            try:
                while self._running:
                    self._write_state()
                    time.sleep(1)
            except KeyboardInterrupt:
                pass
        else:
            # Text-only interactive mode
            logger.info("Text-only mode — type commands below (type 'quit' to exit)")
            self._run_interactive()

        self.stop()

    def stop(self):
        """Gracefully shut down."""
        self._running = False
        self._set_state("offline")

        if self.voice_enabled and hasattr(self, '_wake_word'):
            self._wake_word.stop()

        # Clean up state file
        try:
            if os.path.exists(STATE_FILE):
                os.remove(STATE_FILE)
        except Exception:
            pass

        logger.info("J.A.R.V.I.S offline. Goodbye, sir.")

    def _handle_signal(self, signum, frame):
        """Handle SIGTERM/SIGINT for graceful shutdown."""
        logger.info(f"Received signal {signum}, shutting down...")
        self._running = False

    # ── Voice Pipeline ──

    def _on_wake_detected(self):
        """Called when 'Jarvis' wake word is detected."""
        logger.info("")
        logger.info("═" * 50)
        logger.info("  🎤 Wake word detected!")
        logger.info("═" * 50)
        self._set_state("listening")

        # Play activation chime
        self._play_chime("activate")

        # Record until silence
        audio_data = self._record_until_silence()

        if audio_data is not None and len(audio_data) > 0:
            self._set_state("processing")

            # Transcribe
            result = self._stt.transcribe(audio_data)
            text = result.get("text", "").strip()

            if text:
                logger.info(f"  📝 Heard: \"{text}\"")
                self._process_command(text)
            else:
                logger.info("  ❌ No speech detected")
                self._speak("I didn't catch that. Could you repeat?")
        else:
            logger.info("  ❌ No audio recorded")
            self._speak("I didn't hear anything.")

        self._set_state("idle")

    def _record_until_silence(self):
        """Record audio from mic until silence is detected."""
        try:
            import pyaudio
            import numpy as np

            voice_config = self.config.get("voice", {})
            RATE = 16000
            CHUNK = 1024
            SILENCE_THRESHOLD = 500
            SILENCE_DURATION = voice_config.get("silence_duration", 1.5)
            MAX_RECORDING = voice_config.get("max_recording", 15)
            MIN_PHRASE = 0.5

            pa = pyaudio.PyAudio()
            stream = pa.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK,
            )

            frames = []
            silence_start = None
            recording_start = time.time()

            logger.info("  🔴 Recording... speak now")

            while self._running:
                elapsed = time.time() - recording_start

                if elapsed > MAX_RECORDING:
                    logger.info("  ⏱️ Max recording duration reached")
                    break

                data = stream.read(CHUNK, exception_on_overflow=False)
                frames.append(data)

                audio_chunk = np.frombuffer(data, dtype=np.int16)
                rms = np.sqrt(np.mean(audio_chunk.astype(np.float32) ** 2))

                if rms < SILENCE_THRESHOLD:
                    if silence_start is None:
                        silence_start = time.time()
                    elif (time.time() - silence_start) > SILENCE_DURATION and elapsed > MIN_PHRASE:
                        logger.info("  ⏹️ Silence detected, done recording")
                        break
                else:
                    silence_start = None

            stream.stop_stream()
            stream.close()
            pa.terminate()

            if frames:
                audio_data = np.frombuffer(b"".join(frames), dtype=np.int16)
                duration = len(audio_data) / RATE
                logger.info(f"  📼 Recorded {duration:.1f}s of audio")
                return audio_data

        except Exception as e:
            logger.error(f"Recording error: {e}", exc_info=True)

        return None

    # ── Command Processing ──

    def _process_command(self, text: str):
        """Parse, execute, and respond to a command."""
        start = time.time()

        # Parse
        parsed = self.parser.parse(text)
        intent = parsed["intent"]
        entities = parsed["entities"]

        logger.info(f"  🧠 Intent: {intent} | Entities: {entities}")

        # Handle special intents
        if intent == "help":
            # Speak a shorter version
            self._speak("I can control your apps, volume, brightness, Wi-Fi, Bluetooth, "
                        "take screenshots, search files, play media, and much more. "
                        "Just say what you need.")
            self._last_command = text
            self._last_response = "Help requested"
            self._command_count += 1
            return

        if intent == "unknown" or (intent == "ai_query" and parsed["confidence"] < 0.3):
            self._speak("I didn't understand that command. Try saying help to see what I can do.")
            return

        # Handle multi-step
        if parsed.get("multi_step") and parsed.get("steps"):
            for step in parsed["steps"]:
                s_intent = step["intent"]
                s_entities = step["entities"]

                if self.agent.is_dangerous(s_intent):
                    self._speak(f"Skipping {s_intent}, it requires confirmation.")
                    continue

                result = self.agent.execute(s_intent, s_entities)
                msg = result.get("message", "Done")
                logger.info(f"    → {s_intent}: {msg}")
                self._speak(msg)

            self._command_count += 1
            return

        # Check dangerous commands
        if self.agent.is_dangerous(intent):
            self._speak(f"Are you sure you want to {intent.replace('_', ' ')}? "
                        "Say confirm or cancel.")
            # For now, skip — confirmation via voice is complex
            # TODO: Add voice confirmation state machine
            logger.info(f"  ⚠️ Dangerous command skipped: {intent}")
            return

        # Execute
        result = self.agent.execute(intent, entities)
        elapsed_ms = int((time.time() - start) * 1000)

        success = result.get("success", False)
        message = result.get("message", "Done")

        icon = "✅" if success else "❌"
        logger.info(f"  {icon} {message} ({elapsed_ms}ms)")

        # Speak the response
        self._speak(message)

        # Update state
        self._last_command = text
        self._last_response = message
        self._command_count += 1

        # Log to file
        self._log_command(text, intent, message, elapsed_ms, success)

    def _log_command(self, text: str, intent: str, response: str, elapsed_ms: int, success: bool):
        """Append command to the JSON log file."""
        log_file = LOG_DIR / "command_history.jsonl"
        try:
            entry = {
                "timestamp": datetime.now().isoformat(),
                "command": text,
                "intent": intent,
                "response": response,
                "elapsed_ms": elapsed_ms,
                "success": success,
            }
            with open(log_file, "a") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception:
            pass

    # ── TTS ──

    def _speak(self, text: str):
        """Speak text using TTS (blocking)."""
        if not text:
            return
        self._set_state("responding")
        logger.info(f"  🔊 Jarvis: \"{text}\"")

        if self._tts:
            try:
                self._tts.speak(text, blocking=True)
            except Exception as e:
                logger.error(f"TTS error: {e}")
                # Fallback to espeak-ng
                try:
                    import subprocess
                    subprocess.run(
                        ["espeak-ng", "-v", "en-us", "-s", "160", text],
                        timeout=30, capture_output=True,
                    )
                except Exception:
                    pass
        else:
            # No TTS engine — fallback to espeak-ng directly
            try:
                import subprocess
                subprocess.run(
                    ["espeak-ng", "-v", "en-us", "-s", "160", text],
                    timeout=30, capture_output=True,
                )
            except Exception as e:
                logger.warning(f"No TTS available: {e}")

    def _play_chime(self, sound_name: str = "activate"):
        """Play a chime sound for feedback."""
        chime_path = PROJECT_ROOT / "config" / "sounds" / f"{sound_name}.wav"
        if chime_path.exists():
            try:
                import subprocess
                subprocess.Popen(
                    ["aplay", "-q", str(chime_path)],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                )
            except Exception:
                pass

    # ── Interactive Text Mode ──

    def _run_interactive(self):
        """Run in interactive text-only mode (for testing or no-mic setups)."""
        CYAN = "\033[96m"
        GREEN = "\033[92m"
        YELLOW = "\033[93m"
        NC = "\033[0m"

        print(f"\n{CYAN}  Type a command, or 'quit' to exit:{NC}\n")

        while self._running:
            try:
                user_input = input(f"{YELLOW}  You ❯ {NC}").strip()
                if not user_input:
                    continue
                if user_input.lower() in ("quit", "exit", "bye", "q"):
                    break

                self._process_command(user_input)
                print()

            except (EOFError, KeyboardInterrupt):
                break

    # ── State Management ──

    def _set_state(self, state: str):
        """Update internal state."""
        self._state = state
        self._write_state()

    def _write_state(self):
        """Write current state to a JSON file for the tray app to read."""
        try:
            state = {
                "state": self._state,
                "voice_enabled": self.voice_enabled,
                "last_command": self._last_command,
                "last_response": self._last_response,
                "command_count": self._command_count,
                "uptime_seconds": round(time.time() - self._start_time),
                "timestamp": datetime.now().isoformat(),
                "pid": os.getpid(),
            }
            with open(STATE_FILE, "w") as f:
                json.dump(state, f)
        except Exception:
            pass

    # ── Public API for CLI ──

    def process_text(self, text: str) -> str:
        """Process a text command and return the response (for CLI tool)."""
        parsed = self.parser.parse(text)
        intent = parsed["intent"]
        entities = parsed["entities"]

        if intent == "help":
            return HELP_TEXT

        if intent == "unknown":
            return "I didn't understand that. Say 'help' to see what I can do."

        if parsed.get("multi_step") and parsed.get("steps"):
            results = []
            for step in parsed["steps"]:
                result = self.agent.execute(step["intent"], step["entities"])
                results.append(result.get("message", "Done"))
            return " | ".join(results)

        result = self.agent.execute(intent, entities)
        return result.get("message", "Done")


# ── Self-Test ──

def run_test():
    """Quick self-test of core components."""
    print("\n  J.A.R.V.I.S — Self Test\n")

    svc = JarvisService(voice_enabled=False)

    tests = [
        ("what time is it", "get_time"),
        ("what is my battery", "battery_status"),
        ("show system stats", "system_stats"),
        ("hello jarvis", "greeting"),
        ("help", "help"),
        ("set volume to 50", "set_volume"),
        ("take a screenshot", "screenshot"),
        ("create a note saying test note", "create_note"),
    ]

    passed = 0
    for text, expected_intent in tests:
        parsed = svc.parser.parse(text)
        intent = parsed["intent"]
        ok = intent == expected_intent
        icon = "✅" if ok else "❌"
        print(f"  {icon} \"{text}\" → {intent} (expected: {expected_intent})")
        if ok:
            passed += 1

    print(f"\n  {passed}/{len(tests)} tests passed\n")


# ── Entry Point ──

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="J.A.R.V.I.S Background Service")
    parser.add_argument("--no-voice", action="store_true", help="Text-only mode (no microphone)")
    parser.add_argument("--test", action="store_true", help="Run self-test")
    args = parser.parse_args()

    if args.test:
        run_test()
    else:
        service = JarvisService(voice_enabled=not args.no_voice)
        service.start()
