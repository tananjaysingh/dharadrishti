"""
J.A.R.V.I.S — Voice Engine Orchestrator
Ties together wake word detection, speech-to-text, and text-to-speech
into a complete voice interaction pipeline.
"""

import os
import time
import logging
import threading
import numpy as np
from typing import Optional, Callable

logger = logging.getLogger("jarvis.voice_engine")


class VoiceEngine:
    """
    Full voice pipeline:
    1. Listen for wake word ("Jarvis")
    2. Record speech after wake word
    3. Transcribe with Faster-Whisper
    4. Send text to command handler
    5. Speak response with Piper TTS
    """

    def __init__(self, config: dict = None):
        config = config or {}
        voice_config = config.get("voice", {})

        self.stt_model_size = voice_config.get("stt_model", "small")
        self.stt_device = voice_config.get("stt_device", "cpu")
        self.wake_threshold = voice_config.get("wake_word_threshold", 0.5)
        self.silence_duration = voice_config.get("silence_duration", 1.5)
        self.max_recording = voice_config.get("max_recording", 15)
        self.activation_sound = voice_config.get("activation_sound", True)

        self._on_command: Optional[Callable] = None
        self._on_state_change: Optional[Callable] = None
        self._running = False
        self._state = "idle"

        # Components (lazy-loaded)
        self._wake_word = None
        self._stt = None
        self._tts = None

    def set_command_handler(self, handler: Callable):
        """Set the callback for when a command is transcribed."""
        self._on_command = handler

    def set_state_handler(self, handler: Callable):
        """Set the callback for state changes (idle/listening/processing/responding)."""
        self._on_state_change = handler

    def start(self):
        """Start the voice engine."""
        if self._running:
            return

        logger.info("Starting voice engine...")
        self._running = True

        # Initialize components
        try:
            from .wake_word import WakeWordDetector
            from .speech_to_text import SpeechToText
            from .text_to_speech import TextToSpeech

            self._stt = SpeechToText(
                model_size=self.stt_model_size,
                device=self.stt_device,
            )

            self._tts = TextToSpeech()

            self._wake_word = WakeWordDetector(
                wake_word="jarvis",
                threshold=self.wake_threshold,
                on_wake=self._on_wake_detected,
            )
            self._wake_word.start()

            self._set_state("idle")
            logger.info("Voice engine started successfully")

        except Exception as e:
            logger.error(f"Failed to start voice engine: {e}")
            self._running = False

    def stop(self):
        """Stop the voice engine."""
        self._running = False
        if self._wake_word:
            self._wake_word.stop()
        self._set_state("idle")
        logger.info("Voice engine stopped")

    def speak(self, text: str, blocking: bool = False):
        """Speak a response via TTS."""
        if self._tts:
            self._set_state("responding")
            self._tts.speak(text, blocking=blocking)
            self._set_state("idle")
        else:
            logger.warning("TTS not initialized")

    def _on_wake_detected(self):
        """Called when the wake word is detected."""
        logger.info("🎤 Wake word detected! Starting recording...")
        self._set_state("listening")

        # Play activation chime
        if self.activation_sound and self._tts:
            from .text_to_speech import TextToSpeech
            TextToSpeech.play_chime("activate")
            import time
            time.sleep(0.3)  # Brief pause for chime to start

        # Record audio until silence
        audio_data = self._record_until_silence()

        if audio_data is not None and len(audio_data) > 0:
            self._set_state("processing")

            # Transcribe
            result = self._stt.transcribe(audio_data)
            text = result.get("text", "").strip()

            if text:
                logger.info(f"Transcribed: '{text}'")
                if self._on_command:
                    self._on_command(text)
            else:
                logger.info("No speech detected")
                self.speak("I didn't catch that. Could you repeat?")

        self._set_state("idle")

    def process_text_command(self, text: str):
        """Process a text command through the pipeline (no mic needed).
        
        Used by the CLI tool and service for injecting text commands
        without the voice pipeline. Calls the same command handler
        that the voice pipeline uses.
        
        Args:
            text: The command text to process
        """
        if self._on_command:
            self._on_command(text)
        else:
            logger.warning("No command handler set — cannot process text command")

    def _record_until_silence(self) -> Optional[np.ndarray]:
        """Record audio until silence is detected or max duration reached."""
        try:
            import pyaudio

            RATE = 16000
            CHUNK = 1024
            SILENCE_THRESHOLD = 500  # RMS amplitude threshold
            MIN_PHRASE_LENGTH = 0.5  # Minimum phrase length in seconds

            pa = pyaudio.PyAudio()
            stream = pa.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK,
            )

            # Adaptive noise floor — sample 0.3s of ambient noise
            noise_samples = []
            for _ in range(int(RATE * 0.3 / CHUNK)):
                data = stream.read(CHUNK, exception_on_overflow=False)
                chunk = np.frombuffer(data, dtype=np.int16)
                noise_samples.append(np.sqrt(np.mean(chunk.astype(np.float32) ** 2)))
            
            ambient_rms = np.mean(noise_samples) if noise_samples else 200
            adaptive_threshold = max(SILENCE_THRESHOLD, ambient_rms * 2.5)
            logger.debug(f"Ambient RMS: {ambient_rms:.0f}, Silence threshold: {adaptive_threshold:.0f}")

            frames = []
            silence_start = None
            recording_start = time.time()

            logger.info("Recording... (speak now)")

            while self._running:
                elapsed = time.time() - recording_start

                # Max recording duration
                if elapsed > self.max_recording:
                    logger.info("Max recording duration reached")
                    break

                data = stream.read(CHUNK, exception_on_overflow=False)
                frames.append(data)

                # Calculate RMS for silence detection
                audio_chunk = np.frombuffer(data, dtype=np.int16)
                rms = np.sqrt(np.mean(audio_chunk.astype(np.float32) ** 2))

                if rms < adaptive_threshold:
                    if silence_start is None:
                        silence_start = time.time()
                    elif (time.time() - silence_start) > self.silence_duration and elapsed > MIN_PHRASE_LENGTH:
                        logger.info("Silence detected, stopping recording")
                        break
                else:
                    silence_start = None

            stream.stop_stream()
            stream.close()
            pa.terminate()

            if frames:
                audio_data = np.frombuffer(b"".join(frames), dtype=np.int16)
                duration = len(audio_data) / RATE
                logger.info(f"Recorded {duration:.1f}s of audio")
                return audio_data

        except Exception as e:
            logger.error(f"Recording error: {e}", exc_info=True)

        return None

    def _set_state(self, state: str):
        """Update the engine state and notify handler."""
        self._state = state
        if self._on_state_change:
            self._on_state_change(state)

    @property
    def state(self) -> str:
        return self._state

    @property
    def is_running(self) -> bool:
        return self._running

