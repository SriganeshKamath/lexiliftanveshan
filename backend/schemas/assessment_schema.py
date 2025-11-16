from pydantic import BaseModel
from typing import List, Optional

class WordAnalysis(BaseModel):
    expected: str
    spoken: str
    expected_phonemes: str
    spoken_phonemes: str
    phoneme_similarity: float
    error_type: str
    mistaken_phoneme: Optional[str] = None
    substituted_with: Optional[str] = None

class QuestionRecord(BaseModel):
    index: int
    type: str  # "word" or "sentence"
    expected_text: str
    spoken_text: str
    accuracy: float
    words: List[WordAnalysis]

class AssessmentCreate(BaseModel):
    user_id: str
    questions: List[QuestionRecord]
    overall_accuracy: float
