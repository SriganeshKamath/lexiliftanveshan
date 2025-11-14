# backend/routers/analytics.py
from fastapi import APIRouter, HTTPException
from backend.db.mongo_connection import connect
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/user/{user_id}/recent_sessions")
async def recent_sessions(user_id: str, limit: int = 10):
    db = connect()
    docs = db["sessions"].find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(limit)
    res = []
    async for d in docs:
        d["id"] = str(d["_id"])
        d.pop("_id", None)
        # convert ObjectId user_id
        d["user_id"] = str(d["user_id"]) if isinstance(d["user_id"], ObjectId) else d["user_id"]
        res.append(d)
    return {"sessions": res}

@router.get("/user/{user_id}/summary")
async def user_summary(user_id: str):
    db = connect()
    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},
        {"$group": {"_id": "$exercise_type", "avg_accuracy": {"$avg": "$accuracy"}, "count": {"$sum": 1}}}
    ]
    agg = db["sessions"].aggregate(pipeline)
    out = []
    async for r in agg:
        out.append(r)
    return {"summary": out}
