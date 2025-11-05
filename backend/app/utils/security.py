"""
Security utilities for password hashing and JWT token management
"""

from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.config import settings


# ============================================
# PASSWORD HASHING
# ============================================

# Bcrypt context for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password

    Args:
        plain_password: Password từ user nhập vào
        hashed_password: Password đã hash trong database

    Returns:
        True nếu password đúng, False nếu sai
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt

    Args:
        password: Plain text password từ user

    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


# ============================================
# JWT TOKEN MANAGEMENT
# ============================================

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Create JWT access token

    Args:
        data: Dictionary chứa data cần encode (thường là {"sub": email})
        expires_delta: Thời gian token hết hạn (optional)

    Returns:
        JWT token string

    Example:
        token = create_access_token({"sub": "user@example.com"})
    """
    to_encode = data.copy()

    # Tính thời gian hết hạn
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Thêm expiration vào payload
    to_encode.update({"exp": expire})

    # Encode JWT với SECRET_KEY
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def decode_access_token(token: str):
    """
    Decode and verify JWT access token

    Args:
        token: JWT token string

    Returns:
        Payload dictionary nếu token valid
        None nếu token invalid hoặc expired

    Example:
        payload = decode_access_token(token)
        if payload:
            email = payload.get("sub")
    """
    try:
        # Decode và verify token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        # Token invalid, expired, hoặc signature không khớp
        return None
