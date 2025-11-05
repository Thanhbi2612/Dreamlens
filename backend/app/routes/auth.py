"""
Authentication API Routes
Endpoints for user registration, login, and profile
"""

from fastapi import APIRouter, Depends, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from authlib.integrations.starlette_client import OAuth
from datetime import timedelta
import httpx

from app.database import get_db
from app.schemas import UserRegister, UserLogin, UserResponse, Token, DeleteAccountRequest
from app.services.auth_service import AuthService
from app.utils.dependencies import get_current_active_user
from app.utils.security import create_access_token
from app.models import User
from app.config import settings


# Router với prefix và tags
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Router cho callback (không có prefix vì redirect URI là /auth/google/callback)
callback_router = APIRouter(prefix="/auth", tags=["Authentication"])

# OAuth configuration
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)


@router.get(
    "/google/login",
    summary="Login with Google",
    description="Redirect to Google OAuth login page"
)
async def google_login(request: Request):
    """
    Khởi tạo Google OAuth flow
    Redirect user đến Google login page
    """
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@callback_router.get(
    "/google/callback",
    summary="Google OAuth callback",
    description="Handle callback from Google OAuth"
)
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Xử lý callback từ Google

    Flow:
        1. Nhận authorization code từ Google
        2. Exchange code với access token
        3. Lấy user info từ Google
        4. Tạo hoặc cập nhật user trong database
        5. Tạo JWT token
        6. Redirect về frontend với token
    """
    try:
        # Get token from Google
        token = await oauth.google.authorize_access_token(request)

        # Get user info from Google
        user_info = token.get('userinfo')

        if not user_info:
            # Fallback: manually fetch user info if not in token
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {token["access_token"]}'}
                )
                user_info = response.json()

        # Get or create user
        user = await AuthService.get_or_create_google_user(user_info, db)

        # Create JWT token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )

        # Redirect to frontend with token
        frontend_url = "http://localhost:5173"
        return RedirectResponse(
            url=f"{frontend_url}?token={access_token}&login=success"
        )

    except Exception as e:
        # Redirect to frontend with error
        frontend_url = "http://localhost:5173"
        return RedirectResponse(
            url=f"{frontend_url}?error=google_login_failed"
        )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Đăng ký tài khoản mới với email, username và password"
)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """
    Đăng ký user mới

    **Request Body:**
    - email: Email address (phải unique)
    - username: Username (phải unique, 3-100 chars)
    - password: Password (tối thiểu 6 chars)
    - full_name: Họ tên đầy đủ (optional)

    **Returns:**
    - User object (không có password)
    - Status 201 Created

    **Errors:**
    - 400: Email hoặc username đã tồn tại
    - 422: Validation error (email format sai, password quá ngắn, etc.)
    """
    user = await AuthService.register_user(user_data, db)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Login",
    description="Đăng nhập và nhận JWT access token"
)
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Đăng nhập và nhận JWT token

    **Request Body:**
    - email: Email address
    - password: Password

    **Returns:**
    - access_token: JWT token string
    - token_type: "bearer"

    **How to use token:**
    ```
    Authorization: Bearer <access_token>
    ```

    **Errors:**
    - 401: Email hoặc password sai
    - 400: User bị inactive
    - 422: Validation error
    """
    token = await AuthService.login_user(login_data, db)
    return token


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Lấy thông tin user hiện tại (yêu cầu authentication)"
)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy thông tin user hiện tại

    **Authentication Required:**
    - Cần gửi JWT token trong Authorization header
    - Format: `Authorization: Bearer <token>`

    **Returns:**
    - User object với thông tin profile

    **Errors:**
    - 401: Token invalid, expired, hoặc missing
    - 400: User bị inactive

    **Example:**
    ```bash
    curl -H "Authorization: Bearer <token>" http://localhost:8000/api/auth/me
    ```
    """
    return current_user


@router.delete(
    "/account",
    status_code=status.HTTP_200_OK,
    summary="Delete user account",
    description="Xóa tài khoản user và tất cả dữ liệu liên quan (KHÔNG THỂ HOÀN TÁC)"
)
async def delete_account(
    request: DeleteAccountRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Xóa tài khoản user vĩnh viễn

    **⚠️ CẢNH BÁO: Hành động này KHÔNG THỂ HOÀN TÁC!**

    **Authentication Required:**
    - Cần gửi JWT token trong Authorization header

    **Request Body:**
    - password: Password để xác nhận (BẮT BUỘC cho local auth users, optional cho OAuth users)

    **Hành động sẽ xóa:**
    - Tất cả dreams của user
    - Tất cả generated images của user (cả trong và ngoài dreams)
    - Thông tin tài khoản user

    **Returns:**
    - message: Thông báo thành công
    - dreams_deleted: Số dreams đã xóa
    - orphaned_images_deleted: Số images không thuộc dream nào đã xóa

    **Errors:**
    - 400: Password sai (cho local auth)
    - 400: Thiếu password (cho local auth)
    - 401: Token invalid hoặc expired

    **Security:**
    - Local auth users BẮT BUỘC phải nhập đúng password
    - OAuth users có thể xóa mà không cần password
    - Tất cả operations được thực hiện trong một transaction (atomic)

    **Example:**
    ```bash
    curl -X DELETE http://localhost:8000/api/auth/account \\
         -H "Authorization: Bearer <token>" \\
         -H "Content-Type: application/json" \\
         -d '{"password": "your_password"}'
    ```

    **Response Example:**
    ```json
    {
        "message": "Account deleted successfully",
        "dreams_deleted": 15,
        "orphaned_images_deleted": 3
    }
    ```
    """
    result = await AuthService.delete_user_account(
        user=current_user,
        password=request.password,
        db=db
    )
    return result
