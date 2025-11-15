from fastapi import APIRouter, HTTPException
from backend.schemas.user_schema import UserCreate, UserInDB, UserLogin
from backend.db.mongo_connection import connect
from bson import ObjectId
import bcrypt

router = APIRouter(prefix="/users", tags=["users"])

db = connect()

# -------------------------------
# SIGN UP (Hash password)
# -------------------------------
@router.post("/signup")
async def signup(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(400, "User already exists")

    # Hash password
    hashed_pw = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

    doc = user.dict()
    doc["password"] = hashed_pw.decode("utf-8")

    result = await db.users.insert_one(doc)
    saved_user = await db.users.find_one({"_id": result.inserted_id})

    # Clean before sending response
    saved_user["_id"] = str(saved_user["_id"])
    saved_user.pop("password", None)

    return saved_user


# -------------------------------
# LOGIN (Compare password)
# -------------------------------
@router.post("/login")
async def login(credentials: UserLogin):

    # Fetch user by email
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(404, "User not found")

    # Compare hashed passwords
    ok = bcrypt.checkpw(
        credentials.password.encode("utf-8"),
        user["password"].encode("utf-8")
    )

    if not ok:
        raise HTTPException(401, "Invalid password")

    # Clean before sending back
    user["_id"] = str(user["_id"])
    user.pop("password", None)

    return user


# -------------------------------
# LIST USERS
# -------------------------------
@router.get("/")
async def list_users():
    users = []
    async for u in db.users.find({}):
        u["_id"] = str(u["_id"])
        u.pop("password", None)
        users.append(u)
    return users


# -------------------------------
# GET SINGLE USER
# -------------------------------
@router.get("/{user_id}")
async def get_user(user_id: str):
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(400, "Invalid user ID")

    user = await db.users.find_one({"_id": obj_id})
    if not user:
        raise HTTPException(404, "User not found")

    user["_id"] = str(user["_id"])
    user.pop("password", None)
    return user
