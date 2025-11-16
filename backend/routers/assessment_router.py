from fastapi import APIRouter
from backend.db.mongo_connection import connect
from backend.models.assessment_session import build_assessment_session_doc

router = APIRouter(prefix="/assessment", tags=["assessment"])


@router.post("/submit")
async def submit_full_assessment(payload: dict):
    """
    Frontend sends full 15-question results in one big JSON payload.
    {
      user_id: "...",
      overall_accuracy: 0.72,
      questions: [...]
    }
    """
    db = connect()

    # Extract prepared blocks
    user_id = payload["user_id"]
    questions = payload["questions"]

    final_doc = build_assessment_session_doc(
        user_id,
        questions
    )

    await db["assessment_sessions"].insert_one(final_doc)

    return {"status": "completed", "assessment": final_doc}
