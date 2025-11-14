from fastapi import APIRouter, HTTPException, Depends
from backend.schemas.user_schema import UserCreate, UserInDB, UserLogin
from backend.db.mongo_connection import connect
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["users"])

# Get Mongo connection
db = connect()

@router.post("/signup", response_model=UserInDB)
async def signup(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    doc = user.dict()
    result = await db.users.insert_one(doc)
    saved_user = await db.users.find_one({"_id": result.inserted_id})
    saved_user["_id"] = str(saved_user["_id"])
    return saved_user


@router.post("/login", response_model=UserInDB)
async def login(credentials: UserLogin):
    query = {}
    if credentials.email:
        query["email"] = credentials.email
    elif credentials.name:
        query["name"] = credentials.name
    else:
        raise HTTPException(status_code=400, detail="Provide name or email")

    user = await db.users.find_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["_id"] = str(user["_id"])
    return user


@router.get("/", response_model=list[UserInDB])
async def list_users():
    users = []
    async for user in db.users.find({}):
        user["_id"] = str(user["_id"])
        users.append(user)
    return users


@router.get("/{user_id}", response_model=UserInDB)
async def get_user(user_id: str):
    """Fetch one user by ID"""
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await db.users.find_one({"_id": obj_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return user
