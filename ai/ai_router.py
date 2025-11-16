from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware 
from .asr.asr_service import transcribe_file, analyze
from .tts.tts_service import synthesize_to_wav
from .llm.llm_service import (
    generate_exercises,
    generate_microdrills,
    generate_phoneme_lesson,
    generate_saarthi_feedback,  # ✅ NEW import
    generate_pronunciation_mission,
)
from .ai_utils import save_upload_file
import uvicorn
import os
import json

app = FastAPI(title="LexiLift AI (dev)")

# ⭐ ADD CORS HERE
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5173",
    "*",   # DEV ONLY (remove later for security)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1️⃣ ASR Evaluation ---
@app.post("/asr/evaluate")
async def evaluate_read_aloud(file: UploadFile = File(...), expected_text: str = Form(...)):
    path = save_upload_file(file)
    trans = transcribe_file(path)
    analysis = analyze(expected_text, trans["text"])
    return JSONResponse({"transcription": trans, "analysis": analysis})

# --- 2️⃣ TTS ---
@app.post("/tts/speak")
async def tts_speak(text: str = Form(...)):
    wav = synthesize_to_wav(text)
    return FileResponse(wav, media_type="audio/wav", filename=os.path.basename(wav))

# --- 3️⃣ Generate Exercises ---
@app.post("/llm/generate_exercises")
async def llm_generate(level: int = Form(1), patterns: str = Form("{}"), count: int = Form(10)):
    try:
        p = json.loads(patterns)
    except Exception:
        p = {}
    ex = generate_exercises(level, p, count)
    return JSONResponse({"exercises": ex})

# --- 4️⃣ Generate Microdrills ---
@app.post("/llm/generate_microdrills")
async def llm_generate_microdrills(payload: dict):
    try:
        drills = generate_microdrills(payload)
        return JSONResponse({"microdrills": drills})
    except Exception as e:
        print("Error generating microdrills:", e)
        return JSONResponse({"microdrills": []})

# --- 5️⃣ Generate Phoneme Lesson ---
@app.post("/llm/generate_lesson")
async def llm_generate_lesson(phoneme: str = Form(...), difficulty: int = Form(1)):
    lesson = generate_phoneme_lesson(phoneme, difficulty)
    return JSONResponse({"lesson": lesson})

# --- 6️⃣ Saarthi Motivational Feedback ---
@app.post("/llm/feedback")
async def llm_feedback(accuracy: float = Form(...)):
    """
    Returns a short Saarthi motivational message based on session accuracy.
    """
    feedback = generate_saarthi_feedback(accuracy)
    return JSONResponse({"feedback": feedback})


# --- 7️⃣ Generate Pronunciation Mission ---
@app.post("/llm/generate_mission")
async def llm_generate_mission(level: int = Form(1)):
    """
    Creates a pronunciation mission:
    - mission title
    - one short sentence
    - target phonemes 
    """

    mission = generate_pronunciation_mission(level)
    return JSONResponse({"mission": mission})


if __name__ == "__main__":
    uvicorn.run("ai.ai_router:app", host="0.0.0.0", port=8001, reload=True)
