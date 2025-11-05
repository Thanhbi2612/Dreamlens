"""
FastAPI dependencies for authentication
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User
from app.utils.security import decode_access_token


# ============================================
# OAuth2 SCHEME
# ============================================

# OAuth2 scheme để extract token từ Authorization header
# tokenUrl: endpoint để get token (cho Swagger UI)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ============================================
# AUTHENTICATION DEPENDENCIES
# ============================================

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency để get current authenticated user từ JWT token

    Args:
        token: JWT token từ Authorization header (tự động extract bởi oauth2_scheme)
        db: Database session

    Returns:
        User object nếu token valid

    Raises:
        HTTPException 401: Nếu token invalid hoặc user không tồn tại

    Usage trong route:
        @app.get("/protected")
        async def protected_route(current_user: User = Depends(get_current_user)):
            return {"user": current_user.email}
    """
    # Exception để raise khi authentication fail
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode JWT token
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    # Extract email từ token payload
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    # Query database tìm user by email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    # Nếu user không tồn tại → token không valid
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Dependency để get current active user
    Check thêm is_active flag

    Args:
        current_user: User từ get_current_user dependency

    Returns:
        User object nếu user is_active

    Raises:
        HTTPException 400: Nếu user bị inactive

    Usage trong route:
        @app.get("/protected")
        async def protected_route(user: User = Depends(get_current_active_user)):
            # User đã được verify là active
            return {"user": user.email}
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return current_user
