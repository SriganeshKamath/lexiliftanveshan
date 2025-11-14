# ai/phonemizer/phoneme_colorizer.py
from phonemizer import phonemize
from typing import List, Dict

# minimal color assignment cycles for UI
COLOR_CYCLE = ["#4F46E5", "#FB923C", "#10B981", "#EF4444", "#F59E0B"]

def colorize_word(word: str) -> Dict:
    phones = phonemize(word, language="en-us", backend="espeak", strip=True, with_stress=False)
    # naive split by characters for mapping - phonemizer returns string, tokenization for UI can be custom
    graphemes = list(word)
    colors = [COLOR_CYCLE[i % len(COLOR_CYCLE)] for i in range(len(graphemes))]
    return {"word": word, "graphemes": graphemes, "colors": colors, "phonemes": phones}
