If running venv generation script from powershell - Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

To create venv environment - .venv/Scripts/Activate

To install dependencies - pip install -r requirements.txt

To run AI server - uvicorn ai.ai_router:app --reload --port 8001

To run Backend server - uvicorn backend.main:app --reload --port 8000

Postman Endpoints Test:

AI LAYER (http://127.0.0.1:8001)

POST /asr/evaluate
    Body (Form-data)
    key	            type	value
    file	        file	upload .wav / .mp3
    expected_text	text	I love carrots


POST /tts/speak
    Body (Form-data)
    key	    type	value
    text	text	"Hello! Welcome to LexiLift!"


POST /llm/generate_exercises
    Body (Form-data)
    key	        value
    level	    1 / 2 / 3
    patterns	{} or {"confusion":"b/d"}
    count	    10


POST /llm/generate_microdrills
    Body (JSON)
    {
        "expected_text": "I love carrots",
        "spoken_text": "I love carots",
        "words": [
            {   
                "expected": "carrots", 
                "spoken": "carots", 
                "phoneme_similarity": 0.80, 
                "error_type": "substitution" 
            }
        ],
        "accuracy": 0.85
    }


POST /llm/generate_lesson
    Body (Form-data)
    key	        value
    phoneme	    "r"
    difficulty	1


POST /llm/generate_feedback
    Body (JSON)
    { 
        "accuracy": 0.70 
    }

BACKEND LAYER (http://127.0.0.1:8000)

POST /users/signup
    Body (JSON)
    {
        "name": "Riya",
        "age": 9,
        "email": "riya@lexilift.com",
        "level": 1
    }


POST /users/login
    Body (JSON)
    {
        "email": "riya@lexilift.com",
    }


GET /users/

GET /users/{user_id}
Example: http://127.0.0.1:8000/users/6914b70fb3d4e74722ba2f28


