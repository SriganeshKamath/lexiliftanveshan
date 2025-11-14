# backend/routers/ai_bridge.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import httpx
import os
from dotenv import load_dotenv
import traceback

load_dotenv()
AI_BASE = os.getenv("AI_BASE_URL", "http://localhost:8001")

router = APIRouter(prefix="/ai", tags=["ai"])

# Global default timeout (60s covers pyttsx3)
TIMEOUT = httpx.Timeout(60.0)

@router.post("/tts/speak")
async def proxy_tts(text: str = Form(...)):
    """
    Sends text to AI layer /tts/speak and returns the generated WAV file.
    """
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.post(f"{AI_BASE}/tts/speak", data={"text": text})
        
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=f"TTS failed: {r.text}")
        
        filename = "tts_proxy.wav"
        with open(filename, "wb") as f:
            f.write(r.content)
        print(f"TTS proxy: generated {filename}")
        return FileResponse(filename, media_type="audio/wav", filename=filename)
    
    except httpx.ReadTimeout:
        print("Timeout: AI TTS took too long to respond.")
        raise HTTPException(status_code=504, detail="AI TTS timed out (increase TIMEOUT or check AI logs).")
    except Exception as e:
        print("Error in proxy_tts:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/asr/evaluate")
async def proxy_asr(file: UploadFile = File(...), expected_text: str = Form(...)):
    """
    Sends uploaded audio + expected text to AI /asr/evaluate for pronunciation analysis.
    """
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0)) as client:
            files = {"file": (file.filename, await file.read(), file.content_type)}
            data = {"expected_text": expected_text}
            r = await client.post(f"{AI_BASE}/asr/evaluate", files=files, data=data)
        
        if r.status_code != 200:
            raise HTTPException(status_code=500, detail=f"ASR evaluation failed: {r.text}")
        
        print("ASR evaluation complete.")
        return JSONResponse(r.json())
    
    except httpx.ReadTimeout:
        print("Timeout: AI ASR took too long.")
        raise HTTPException(status_code=504, detail="AI ASR timed out.")
    except Exception as e:
        print("Error in proxy_asr:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/llm/microdrills")
async def proxy_microdrills(analysis: dict):
    """
    Sends pronunciation analysis to AI /llm/generate_microdrills and returns generated practice drills.
    """
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0)) as client:
            r = await client.post(f"{AI_BASE}/llm/generate_microdrills", json=analysis)
        
        if r.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Microdrill generation failed: {r.text}")
        
        print("LLM microdrills generated.")
        return JSONResponse(r.json())
    
    except httpx.ReadTimeout:
        print("Timeout: AI LLM took too long.")
        raise HTTPException(status_code=504, detail="AI LLM timed out.")
    except Exception as e:
        print("Error in proxy_microdrills:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
