# backend/schemas/exercise_schema.py
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class WordResult(BaseModel):
    expected: str
    spoken: str
    phoneme_similarity: Optional[float] = None  # ✅ make optional
    error_type: str

class SessionCreate(BaseModel):
    user_id: str
    exercise_type: str  # "read_aloud" or "listen_write"
    level: int
    expected_text: str
    spoken_text: Optional[str] = None
    words: Optional[List[WordResult]] = None
    accuracy: Optional[float] = None
    meta: Optional[Dict[str, Any]] = None
