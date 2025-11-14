# ai/tts/tts_service.py
import os
import uuid
import time
from pathlib import Path
import pyttsx3
from ..ai_utils import ROOT
from dotenv import load_dotenv

load_dotenv()

# Directory where generated .wav files will be saved
OUT_DIR = ROOT / "tts_outputs"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def synthesize_to_wav(text: str, filename: str = None) -> str:
    """
    Converts input text to speech and saves it as a .wav file using pyttsx3.
    Creates a fresh engine each call to prevent Windows engine lock.
    Returns path to the generated .wav file.
    """
    filename = filename or f"{uuid.uuid4().hex}.wav"
    out_path = OUT_DIR / filename

    try:
        # Create a new engine for each call
        engine = pyttsx3.init()
        engine.setProperty('rate', 150)   # speech speed
        engine.setProperty('volume', 1.0) # max volume

        engine.save_to_file(text, str(out_path))
        engine.runAndWait()
        print(f"TTS generated: {out_path}")

    except Exception as e:
        print(f"TTS error: {e}")

    finally:
        # Important! Always stop and delete engine
        engine.stop()
        del engine
        time.sleep(0.2)  # brief pause to let process release

    return str(out_path)
