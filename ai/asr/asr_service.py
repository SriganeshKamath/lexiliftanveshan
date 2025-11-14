# ai/asr/asr_service.py
from faster_whisper import WhisperModel
from phonemizer import phonemize
from difflib import SequenceMatcher
import os
from pathlib import Path
from ..ai_utils import ROOT
import numpy as np

# Initialize model once per process
ASR_MODEL_NAME = os.environ.get("ASR_MODEL", "tiny")  # tiny, small, medium
_whisper_model = WhisperModel(ASR_MODEL_NAME, device="cpu", compute_type="int8")

def transcribe_file(path, language="en"):
    # faster-whisper returns segments, we join them
    segments, info = _whisper_model.transcribe(str(path), language=language)
    text = " ".join([seg.text.strip() for seg in segments]).strip()
    return {"text": text, "duration_s": info.duration if hasattr(info, "duration") else None}

def _phonemes_of(word):
    # simple phonemizer, returns ipa-like string per word
    try:
        phones = phonemize(word, language="en-us", backend="espeak", strip=True, with_stress=False)
    except Exception:
        phones = word
    return phones

def phoneme_similarity(a, b):
    # Compare phoneme strings with SequenceMatcher (0..1)
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()

def analyze(expected_text, spoken_text):
    expected_words = expected_text.strip().lower().split()
    spoken_words = spoken_text.strip().lower().split()

    results = []
    for i, exp in enumerate(expected_words):
        spoken = spoken_words[i] if i < len(spoken_words) else ""
        exp_ph = _phonemes_of(exp)
        sp_ph = _phonemes_of(spoken)
        sim = phoneme_similarity(exp_ph, sp_ph)
        # classify error simply
        if exp == spoken:
            err_type = "correct"
        elif sim > 0.6:
            err_type = "substitution_similar"  # likely b->d etc
        elif spoken == "":
            err_type = "omission"
        else:
            err_type = "substitution"
        results.append({
            "expected": exp,
            "spoken": spoken,
            "expected_phonemes": exp_ph,
            "spoken_phonemes": sp_ph,
            "phoneme_similarity": round(sim, 3),
            "error_type": err_type
        })

    overall = {
        "words": results,
        "accuracy": round(sum(1 for r in results if r["error_type"] == "correct") / max(1, len(results)), 3),
        "expected_text": expected_text,
        "spoken_text": spoken_text
    }
    return overall
