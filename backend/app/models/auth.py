"""
Pydantic models for authentication requests and responses.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "securepassword123"
            }
        }

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "oldpassword123",
                "new_password": "newsecurepassword456"
            }
        }

class SessionResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_at: int
    expires_in: Optional[int] = None

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: str

class AuthResponse(BaseModel):
    user: UserResponse
    session: Optional[SessionResponse] = None
    message: Optional[str] = None

class MessageResponse(BaseModel):
    message: str

class TokenPayload(BaseModel):
    user_id: str
    email: str
    role: Optional[str] = None
    exp: Optional[int] = None
