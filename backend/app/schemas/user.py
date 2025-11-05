from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


# ============================================
# REQUEST SCHEMAS (Input từ client)
# ============================================

class UserRegister(BaseModel):
    """
    Schema cho đăng ký user mới
    Validate input từ client
    """
    email: EmailStr = Field(..., description="Email address của user")
    username: str = Field(..., min_length=3, max_length=100, description="Username để hiển thị")
    password: str = Field(..., min_length=6, max_length=100, description="Password (tối thiểu 6 ký tự)")
    full_name: Optional[str] = Field(None, max_length=255, description="Họ tên đầy đủ (optional)")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "password": "password123",
                "full_name": "John Doe"
            }
        }


class UserLogin(BaseModel):
    """
    Schema cho đăng nhập
    User có thể đăng nhập bằng email HOẶC username
    """
    identifier: str = Field(..., description="Email hoặc username")
    password: str = Field(..., description="Password")

    class Config:
        json_schema_extra = {
            "example": {
                "identifier": "user@example.com",
                "password": "password123"
            }
        }


class DeleteAccountRequest(BaseModel):
    """
    Schema cho xóa tài khoản
    Yêu cầu confirm password (cho local auth users)
    OAuth users có thể để trống password
    """
    password: Optional[str] = Field(None, description="Password để xác nhận (bắt buộc cho local auth)")

    class Config:
        json_schema_extra = {
            "example": {
                "password": "password123"
            }
        }


# ============================================
# RESPONSE SCHEMAS (Output cho client)
# ============================================

class UserResponse(BaseModel):
    """
    Schema trả về thông tin user
    KHÔNG bao gồm password!
    """
    id: int
    email: str
    username: str
    full_name: Optional[str]
    auth_provider: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Cho phép convert từ SQLAlchemy model
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "username": "johndoe",
                "full_name": "John Doe",
                "auth_provider": "local",
                "is_active": True,
                "is_verified": False,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class Token(BaseModel):
    """
    Schema cho JWT token response
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }


# ============================================
# INTERNAL SCHEMAS (Sử dụng trong code)
# ============================================

class TokenData(BaseModel):
    """
    Schema cho data bên trong JWT token
    """
    email: Optional[str] = None
