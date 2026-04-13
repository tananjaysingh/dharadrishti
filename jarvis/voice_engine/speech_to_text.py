"""
J.A.R.V.I.S — Speech-to-Text
Converts spoken audio to text using Faster-Whisper (offline).
"""

import io
import wave
import time
import logging
import numpy as np
from typing import Optional

logger = logging.getLogger("jarvis.stt")


class SpeechToText:
    """
    Speech recognition using Faster-Whisper.
    Loads the model once on startup and reuses it for all transcriptions.
    """

    def __init__(self, model_size: str = "small", device: str = "cpu", compute_type: str = "int8"):
        self.model_size = model_size
        self.device = device
        self.compute_type = compute_type
        self._model = None

    def _load_model(self):
        """Lazy-load the Whisper model."""
        if self._model is not None:
            return

        try:
            from faster_whisper import WhisperModel
            logger.info(f"Loading Faster-Whisper model: {self.model_size} (device: {self.device})")
            start = time.time()
            self._model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type,
            )
            elapsed = time.time() - start
            logger.info(f"Whisper model loaded in {elapsed:.1f}s")
        except ImportError:
            logger.error("faster-whisper not installed. Install with: pip install faster-whisper")
            raise

    def transcribe(self, audio_data: np.ndarray, sample_rate: int = 16000) -> dict:
        """
        Transcribe audio data to text.
        
        Args:
            audio_data: Numpy array of audio samples (int16 or float32)
            sample_rate: Sample rate (should be 16000)
        
        Returns:
            {text, language, confidence, duration_ms}
        """
        self._load_model()
        start = time.time()

        try:
            # Convert int16 to float32 if needed
            if audio_data.dtype == np.int16:
                audio_float = audio_data.astype(np.float32) / 32768.0
            else:
                audio_float = audio_data

            segments, info = self._model.transcribe(
                audio_float,
                beam_size=5,
                language="en",
                vad_filter=True,
                vad_parameters=dict(
                    min_silence_duration_ms=500,
                    speech_pad_ms=200,
                ),
            )

            # Collect all segments
            text_parts = []
            for segment in segments:
                text_parts.append(segment.text.strip())

            text = " ".join(text_parts).strip()
            elapsed_ms = int((time.time() - start) * 1000)

            logger.info(f"Transcribed: '{text}' ({elapsed_ms}ms)")

            return {
                "text": text,
                "language": info.language if info else "en",
                "confidence": info.language_probability if info else 0.0,
                "duration_ms": elapsed_ms,
            }

        except Exception as e:
            logger.error(f"Transcription error: {e}", exc_info=True)
            return {"text": "", "language": "en", "confidence": 0, "duration_ms": 0, "error": str(e)}

    def transcribe_file(self, filepath: str) -> dict:
        """Transcribe a WAV file."""
        try:
            with wave.open(filepath, "rb") as wf:
                frames = wf.readframes(wf.getnframes())
                audio = np.frombuffer(frames, dtype=np.int16)
                return self.transcribe(audio, wf.getframerate())
        except Exception as e:
            return {"text": "", "error": str(e)}

    @property
    def is_loaded(self) -> bool:
        return self._model is not None
