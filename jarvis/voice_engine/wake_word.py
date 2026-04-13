"""
J.A.R.V.I.S — Wake Word Detection
Always-on lightweight listener for the "Jarvis" wake word using OpenWakeWord.
"""

import logging
import threading
import numpy as np
from typing import Callable, Optional

logger = logging.getLogger("jarvis.wake_word")


class WakeWordDetector:
    """
    Listens for the 'Jarvis' wake wnano "/home/ts/Desktop/Ai workspace/jarvis/voice_engine/wake_word using OpenWakeWord.
    Runs in a background thread, consuming minimal CPU.
    """

    def __init__(
        self,
        wake_word: str = "jarvis",
        threshold: float = 0.5,
        on_wake: Optional[Callable] = None,
    ):
        self.wake_word = wake_word
        self.threshold = threshold
        self.on_wake = on_wake
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._model = None

    def start(self):
        """Start listening for the wake word in a background thread."""
        if self._running:
            return

        self._running = True
        self._thread = threading.Thread(target=self._listen_loop, daemon=True)
        self._thread.start()
        logger.info(f"Wake word detector started (word: '{self.wake_word}', threshold: {self.threshold})")

    def stop(self):
        """Stop the wake word listener."""
        self._running = False
        if self._thread:
            self._thread.join(timeout=3)
        logger.info("Wake word detector stopped")

    def _listen_loop(self):
        """Main listening loop — runs in background thread."""
        try:
            import pyaudio
            from openwakeword.model import Model

            # Load wake word model
            self._model = Model(
    wakeword_models=["hey_jarvis"],
    inference_framework="onnx",
)

            # Initialize audio stream
            pa = pyaudio.PyAudio()
            stream = pa.open(
                format=pyaudio.paInt16,
                channels=2,
                rate=44100,
                input=True,
                frames_per_buffer=1280,  # 80ms at 16kHz
            )

            logger.info("Audio stream opened. Listening for wake word...")

            while self._running:
                # Read audio chunk
                audio_data = stream.read(1280, exception_on_overflow=False)
                audio_array = np.frombuffer(audio_data, dtype=np.int16)

                # Run prediction
                prediction = self._model.predict(audio_array)

                # Check all models for activation
                for model_name, score in prediction.items():
                    if score > self.threshold:
                        logger.info(f"Wake word detected! (score: {score:.2f})")
                        if self.on_wake:
                            self.on_wake()
                        # Reset after detection
                        self._model.reset()
                        break

            stream.stop_stream()
            stream.close()
            pa.terminate()

        except ImportError as e:
            logger.warning(f"Wake word dependencies not installed: {e}")
            logger.warning("Install with: pip install openwakeword pyaudio")
        except Exception as e:
            logger.error(f"Wake word detector error: {e}", exc_info=True)

    @property
    def is_running(self) -> bool:
        return self._running
