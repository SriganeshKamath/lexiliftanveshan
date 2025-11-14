from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    name: str
    age: int
    email: Optional[EmailStr] = None
    level: Optional[int] = 1

class UserInDB(UserCreate):
    id: str = Field(..., alias="_id")

class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
