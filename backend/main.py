from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import ai_bridge, exercises, users, analytics
from backend.routers import assessment_router
import uvicorn

app = FastAPI(title="LexiLift Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(exercises.router)
app.include_router(ai_bridge.router)
app.include_router(analytics.router)
app.include_router(assessment_router.router)

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)