"""
J.A.R.V.I.S — Text-to-Speech
Generates speech from text using Piper TTS (offline).
"""

import io
import os
import wave
import logging
import subprocess
import threading
from typing import Optional
from pathlib import Path

logger = logging.getLogger("jarvis.tts")


class TextToSpeech:
    """
    Text-to-speech using Piper TTS.
    Falls back to espeak-ng if Piper is not available.
    """

    def __init__(
        self,
        model_name: str = "en_US-lessac-medium",
        speed: float = 1.0,
        voices_dir: str = None,
    ):
        self.model_name = model_name
        self.speed = speed
        self.voices_dir = voices_dir or str(Path(__file__).parent.parent / "config" / "voices")
        self._piper_available = None

    def speak(self, text: str, blocking: bool = True):
        """
        Speak the given text aloud.
        
        Args:
            text: Text to speak
            blocking: If True, wait for speech to finish; if False, run async
        """
        if not text.strip():
            return

        if blocking:
            self._speak_impl(text)
        else:
            thread = threading.Thread(target=self._speak_impl, args=(text,), daemon=True)
            thread.start()

    def _speak_impl(self, text: str):
        """Internal speech implementation."""
        # Try Piper TTS first
        if self._check_piper():
            try:
                self._speak_piper(text)
                return
            except Exception as e:
                logger.warning(f"Piper TTS failed: {e}")

        # Fallback to espeak-ng
        try:
            self._speak_espeak(text)
        except Exception as e:
            logger.error(f"All TTS engines failed: {e}")

    def _check_piper(self) -> bool:
        """Check if Piper TTS is available."""
        if self._piper_available is not None:
            return self._piper_available

        try:
            result = subprocess.run(
                ["piper", "--help"],
                capture_output=True, timeout=5,
            )
            self._piper_available = True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            # Try Python module
            try:
                import piper
                self._piper_available = True
            except ImportError:
                self._piper_available = False
                logger.info("Piper TTS not found, using espeak-ng fallback")

        return self._piper_available

    def _speak_piper(self, text: str):
        """Speak using Piper TTS CLI."""
        try:
            # Use piper CLI (streams to stdout as wav, pipe to aplay)
            piper_proc = subprocess.Popen(
                [
                    "piper",
                    "--model", self.model_name,
                    "--output-raw",
                    "--length-scale", str(1.0 / self.speed),
                ],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
            )

            aplay_proc = subprocess.Popen(
                ["aplay", "-r", "22050", "-f", "S16_LE", "-t", "raw", "-"],
                stdin=piper_proc.stdout,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )

            piper_proc.stdin.write(text.encode())
            piper_proc.stdin.close()
            aplay_proc.wait(timeout=30)
            piper_proc.wait(timeout=5)

        except Exception as e:
            raise RuntimeError(f"Piper TTS error: {e}")

    def _speak_espeak(self, text: str):
        """Fallback: speak using espeak-ng."""
        try:
            speed_wpm = int(175 * self.speed)
            subprocess.run(
                ["espeak-ng", "-s", str(speed_wpm), text],
                check=True,
                timeout=30,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except FileNotFoundError:
            # Last resort: espeak (older)
            subprocess.run(
                ["espeak", text],
                check=True,
                timeout=30,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )

    def save_to_file(self, text: str, filepath: str) -> bool:
        """Save speech to a WAV file."""
        try:
            subprocess.run(
                [
                    "piper",
                    "--model", self.model_name,
                    "--output_file", filepath,
                ],
                input=text.encode(),
                check=True,
                timeout=30,
            )
            return True
        except Exception as e:
            logger.error(f"Failed to save speech to file: {e}")
            return False

    @staticmethod
    def play_chime(sound_name: str = "activate"):
        """Play a short chime sound (non-blocking).
        
        Looks for WAV files in config/sounds/ relative to the project root.
        """
        from pathlib import Path
        project_root = Path(__file__).parent.parent
        chime_path = project_root / "config" / "sounds" / f"{sound_name}.wav"

        if chime_path.exists():
            try:
                subprocess.Popen(
                    ["aplay", "-q", str(chime_path)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
            except FileNotFoundError:
                # aplay not available, try paplay
                try:
                    subprocess.Popen(
                        ["paplay", str(chime_path)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                    )
                except Exception:
                    pass
        else:
            logger.debug(f"Chime not found: {chime_path}")

    @staticmethod
    def play_wav(filepath: str, blocking: bool = True):
        """Play a WAV file."""
        try:
            proc = subprocess.Popen(
                ["aplay", "-q", filepath],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            if blocking:
                proc.wait(timeout=30)
        except Exception as e:
            logger.error(f"Failed to play WAV: {e}")

