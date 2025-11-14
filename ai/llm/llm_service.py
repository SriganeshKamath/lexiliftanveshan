import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# -----------------------------------------------------------
# Gemini API Key Setup
# -----------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("❌ Missing GEMINI_API_KEY in .env file")

genai.configure(api_key=GEMINI_API_KEY)

# -----------------------------------------------------------
# Select Best Available Gemini Model
# -----------------------------------------------------------
def get_best_gemini_model():
    """Auto-selects the most stable and free Gemini model."""
    try:
        models = [m.name for m in genai.list_models()]
        for name in [
            "models/gemini-2.5-flash-lite",
            "models/gemini-2.5-flash",
            "models/gemini-flash-latest",
            "models/gemini-pro-latest",
        ]:
            if name in models:
                print(f"✅ Using Gemini model: {name}")
                return name
    except Exception as e:
        print("⚠️ Could not list Gemini models:", e)
    return "models/gemini-2.5-flash-lite"

MODEL_NAME = get_best_gemini_model()

# -----------------------------------------------------------
# 🧩 JSON Parser
# -----------------------------------------------------------
def _parse_json_output(raw: str):
    """Extract JSON array/object from raw text safely."""
    try:
        return json.loads(raw)
    except Exception:
        match = re.search(r'(\[.*\]|\{.*\})', raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
    return None

# -----------------------------------------------------------
# 🧠 Core Gemini Safe Generator
# -----------------------------------------------------------
def _generate(prompt: str, temperature: float = 0.6, max_output_tokens: int = 512):
    """Handles Gemini calls safely and retries on empty or filtered responses."""
    model = genai.GenerativeModel(MODEL_NAME)

    for attempt in range(2):
        try:
            response = model.generate_content(
                [prompt],
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": max_output_tokens,
                },
            )

            text_out = ""
            if getattr(response, "candidates", None):
                for cand in response.candidates:
                    if getattr(cand, "content", None):
                        for p in getattr(cand.content, "parts", []):
                            if getattr(p, "text", None):
                                text_out += p.text.strip() + " "
            if text_out.strip():
                return text_out.strip()

            print(f"⚠️ Empty Gemini output (attempt {attempt + 1}). Retrying...")

        except Exception as e:
            print(f"⚠️ Gemini call error (attempt {attempt + 1}): {e}")

        # Retry with simplified prompt
        if attempt == 0:
            prompt = "Return only plain JSON with no commentary.\n\n" + prompt

    print("⚠️ Gemini returned no text after retries.")
    return ""

# -----------------------------------------------------------
# 🎓 Generate Reading Exercises
# -----------------------------------------------------------
def generate_exercises(level: int, patterns: dict, count: int = 10):
    level_descriptions = {
        1: "Focus on simple, short CVC words like 'bat', 'dog', 'cup'. Include phoneme-color hints for every sound.",
        2: "Use 3–6 word sentences. Add hints only on tricky sounds.",
        3: "Use 6–10 word sentences for fluent reading. No hints needed.",
    }

    prompt = f"""
    You are a reading exercise creator.
    LEVEL: {level} — {level_descriptions.get(level, 'Basic decoding practice')}
    CONFUSION PATTERNS: {patterns}

    Create {count} exercises as a JSON array. Each object must have:
    - text: the word or sentence
    - phoneme_color_hints: list of phoneme:color (optional)
    - difficulty: easy | medium | hard

    Return valid JSON only. Example:
    [
      {{
        "text": "bat",
        "phoneme_color_hints": ["b:#4F46E5","a:#FB923C","t:#10B981"],
        "difficulty": "easy"
      }}
    ]
    """

    raw = _generate(prompt)
    data = _parse_json_output(raw)
    if not data:
        print("⚠️ Using fallback exercises (Gemini returned none).")
        data = [
            {"text": w, "phoneme_color_hints": [], "difficulty": "easy"}
            for w in ["bat", "bag", "dog", "cup", "top", "sun"][:count]
        ]
    return data

# -----------------------------------------------------------
# 🎯 Generate Microdrills (Post-ASR)
# -----------------------------------------------------------
def generate_microdrills(analysis_result: dict):
    """
    Generates 3 JSON microdrills to improve specific pronunciation or spelling errors.
    Wording avoids “child”/“dyslexia” to prevent safety blocking.
    """
    prompt = f"""
    You are a friendly reading-practice generator.
    Below is pronunciation data from a learner:
    {json.dumps(analysis_result, indent=2)}

    Create 3 JSON micro-practice activities that help improve these sounds.
    Each activity must include:
    - type: "minimal_pair", "phoneme_isolation", or "spelling_rebuild"
    - instruction: short fun line, e.g. "Tap the correct word!"
    - content: list of small word examples

    Return JSON array only, no extra text.
    """

    raw = _generate(prompt)
    drills = _parse_json_output(raw)
    if not drills:
        print("⚠️ Gemini returned empty or invalid drills. Using fallback examples.")
        drills = [
            {"type": "minimal_pair", "instruction": "Tap the word that sounds different!", "content": [["bat", "bad"], ["bag", "back"]]},
            {"type": "phoneme_isolation", "instruction": "Say the first sound in 'dog'!", "content": ["d"]},
            {"type": "spelling_rebuild", "instruction": "Drag letters to spell 'cup'", "content": ["c", "u", "p"]},
        ]
    return drills

# -----------------------------------------------------------
# 💬 Saarthi Motivational Feedback
# -----------------------------------------------------------
def generate_saarthi_feedback(accuracy: float):
    prompt = f"""
    You are a kind reading coach.
    The learner's reading accuracy was {accuracy * 100:.0f}%.
    Give one short, cheerful motivational message under 25 words.
    """
    msg = _generate(prompt, temperature=0.7, max_output_tokens=50)
    if not msg:
        msg = "You're doing great! Every word you read makes you stronger!"
    return {"message": msg}

# -----------------------------------------------------------
# 📖 Phoneme Teaching Lesson
# -----------------------------------------------------------
def generate_phoneme_lesson(phoneme: str, difficulty: int = 1):
    """
    Generates a short, friendly phoneme teaching lesson.
    """
    prompt = f"""
    You are a reading teacher creating a short lesson about the phoneme '{phoneme}' (difficulty {difficulty}).

    Include:
    1. A 2–3 line simple explanation.
    2. 3–5 example words.
    3. phoneme_color_hints: list of phoneme:color.

    Return JSON only:
    {{
      "explanation": "The /b/ sound is made by your lips. Try saying 'bat'!",
      "examples": ["bat", "ball", "bubble"],
      "phoneme_color_hints": ["b:#4F46E5","a:#FB923C","t:#10B981"]
    }}
    """

    raw = _generate(prompt, temperature=0.7)
    lesson = _parse_json_output(raw)
    if not lesson:
        print("⚠️ Using fallback phoneme lesson.")
        lesson = {
            "explanation": f"The /{phoneme}/ sound is made by your lips. Try saying 'bat'!",
            "examples": ["bat", "ball", "bubble"],
            "phoneme_color_hints": [f"{phoneme}:#4F46E5"]
        }
    return lesson
