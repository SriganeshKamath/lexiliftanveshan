# backend/routers/exercises.py
from fastapi import APIRouter, HTTPException
from backend.schemas.exercise_schema import SessionCreate
from backend.db.mongo_connection import connect
from backend.models.base_models import prepare_session_doc
from backend.routers.ai_bridge import proxy_asr, proxy_tts  # we will not call directly but will use httpx internal
import httpx
import os
from dotenv import load_dotenv
load_dotenv()

AI_BASE = os.getenv("AI_BASE_URL", "http://localhost:8001")

router = APIRouter(prefix="/exercises", tags=["exercises"])

@router.post("/submit")
async def submit_session(payload: SessionCreate):
    """
    Accepts an exercise session result (client can pass analysis or spoken_text).
    If spoken_text is present but words analysis is missing, backend will call AI /asr/evaluate
    to get analysis. Stores session in DB and optionally requests microdrills/saarthi.
    """
    db = connect()

    # If words not provided, try to call AI /asr/evaluate (requires audio - in our API client we assume analysis provided)
    session_doc = payload.dict()
    # If the client already provided words and accuracy, just store
    if session_doc.get("words") is None:
        # We expect client to have already used ai layer to evaluate
        session_doc["words"] = []
    doc = prepare_session_doc(session_doc)
    res = await db["sessions"].insert_one(doc)
    stored = await db["sessions"].find_one({"_id": res.inserted_id})
    # Optionally: call microdrill generator
    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(f"{AI_BASE}/llm/generate_microdrills", json={"analysis": {"words": session_doc.get("words",[]), "accuracy": session_doc.get("accuracy", 0.0)}})
            microdrills = r.json().get("microdrills", [])
        except Exception:
            microdrills = []
    return {"session_id": str(res.inserted_id), "microdrills": microdrills}
