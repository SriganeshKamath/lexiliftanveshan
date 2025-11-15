from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# ----------------------------------------------------
# USER CREATION (Signup)
# ----------------------------------------------------
class UserCreate(BaseModel):
    name: str
    age: Optional[int] = None
    email: EmailStr
    gender: Optional[str] = None
    password: str                     # parent password (will be hashed)
    level: Optional[int] = 1


# ----------------------------------------------------
# LOGIN INPUT
# ----------------------------------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str                     # plain password → bcrypt compare


# ----------------------------------------------------
# USER RETURNED FROM DATABASE
# (password Omitted for safety)
# ----------------------------------------------------
class UserInDB(BaseModel):
    id: str = Field(..., alias="_id")  # MongoDB _id → frontend "id"
    name: str
    age: Optional[int] = None
    email: EmailStr
    gender: Optional[str] = None
    level: Optional[int] = 1

    class Config:
        populate_by_name = True        # allow "_id" → "id" conversion
        from_attributes = True         # safe conversion
