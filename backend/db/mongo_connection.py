# backend/db/mongo_connection.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "")
MONGO_DB = os.getenv("MONGO_DB", "lexilift")

client: AsyncIOMotorClient = None
db = None

def connect():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[MONGO_DB]
    return db

def close():
    global client
    if client:
        client.close()
