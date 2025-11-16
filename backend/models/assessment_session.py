# backend/models/assessment_session.py

from datetime import datetime

def build_assessment_session_doc(user_id: str, question_records: list):
    """
    Creates a clean Mongo-ready document for one full assessment.
    question_records = [
        {
            "index": int,
            "type": "word" | "sentence",
            "expected_text": str,
            "spoken_text": str,
            "accuracy": float,
            "words": [
                {
                    "expected": str,
                    "spoken": str,
                    "expected_phonemes": str,
                    "spoken_phonemes": str,
                    "phoneme_similarity": float,
                    "error_type": str,
                    "mistaken_phoneme": str | None,
                    "substituted_with": str | None
                }
            ]
        }
    ]
    """

    overall_accuracy = round(
        sum(q.get("accuracy", 0) for q in question_records)
        / max(1, len(question_records)),
        3,
    )

    return {
        "user_id": user_id,
        "questions": question_records,
        "overall_accuracy": overall_accuracy,
        "created_at": datetime.utcnow()
    }
