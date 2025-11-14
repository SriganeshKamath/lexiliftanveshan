# backend/models/base_models.py
from typing import Dict, Any
from datetime import datetime

def prepare_user_doc(user_create: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepares a new user document for insertion into MongoDB.
    For the prototype, user_id is a simple string (no ObjectId conversion).
    """
    return {
        "name": user_create["name"],
        "age": user_create["age"],
        "email": user_create.get("email"),
        "level": user_create.get("level", 1),
        "created_at": datetime.utcnow(),
    }

def prepare_session_doc(session_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepares an exercise session document for MongoDB.
    Keeps user_id as string for prototype (no ObjectId conversion).
    """
    doc = {
        "user_id": session_data["user_id"],  # <-- FIXED: store as string
        "exercise_type": session_data.get("exercise_type"),
        "level": session_data.get("level", 1),
        "expected_text": session_data.get("expected_text"),
        "spoken_text": session_data.get("spoken_text"),
        "words": session_data.get("words", []),
        "accuracy": session_data.get("accuracy", 0.0),
        "meta": session_data.get("meta", {}),
        "created_at": datetime.utcnow(),
    }
    return doc
