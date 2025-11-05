"""
Authentication Service Layer
Business logic for user registration and login
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from datetime import timedelta

from app.models import User
from app.schemas import UserRegister, UserLogin, Token
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.config import settings


class AuthService:
    """
    Service class chứa business logic cho authentication
    Tách riêng logic khỏi routes để dễ test và maintain
    """

    @staticmethod
    async def register_user(user_data: UserRegister, db: AsyncSession) -> User:
        """
        Đăng ký user mới

        Args:
            user_data: UserRegister schema với email, username, password
            db: Database session

        Returns:
            User object đã được tạo

        Raises:
            HTTPException 400: Nếu email hoặc username đã tồn tại

        Flow:
            1. Check email đã tồn tại chưa
            2. Check username đã tồn tại chưa
            3. Hash password
            4. Tạo User mới
            5. Save vào database
            6. Return user
        """
        # Check email đã tồn tại chưa
        result = await db.execute(
            select(User).where(User.email == user_data.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check username đã tồn tại chưa
        result = await db.execute(
            select(User).where(User.username == user_data.username)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        # Hash password
        hashed_password = get_password_hash(user_data.password)

        # Tạo User object mới
        new_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            full_name=user_data.full_name
        )

        # Save vào database
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return new_user

    @staticmethod
    async def login_user(login_data: UserLogin, db: AsyncSession) -> Token:
        """
        Đăng nhập user và tạo JWT token

        Args:
            login_data: UserLogin schema với identifier (email hoặc username) và password
            db: Database session

        Returns:
            Token object với access_token

        Raises:
            HTTPException 401: Nếu email/username hoặc password sai
            HTTPException 400: Nếu user bị inactive

        Flow:
            1. Tìm user by email HOẶC username
            2. Verify password
            3. Check user is_active
            4. Tạo JWT token
            5. Return token

        Security Note:
            Error message KHÔNG nên tiết lộ email/username hay password sai
            để tránh enumerate users
        """
        # Tìm user by email HOẶC username
        result = await db.execute(
            select(User).where(
                (User.email == login_data.identifier) |
                (User.username == login_data.identifier)
            )
        )
        user = result.scalar_one_or_none()

        # Nếu user không tồn tại hoặc password sai
        # → return same error để không tiết lộ thông tin
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email/username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Check user có active không
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )

        # Tạo JWT access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )

        # Return token
        return Token(access_token=access_token, token_type="bearer")

    @staticmethod
    async def get_or_create_google_user(google_user_info: dict, db: AsyncSession) -> User:
        """
        Lấy hoặc tạo user từ Google OAuth

        Args:
            google_user_info: Dict chứa thông tin user từ Google
            db: Database session

        Returns:
            User object

        Flow:
            1. Tìm user by google_id
            2. Nếu tồn tại -> return user
            3. Nếu không -> tạo user mới với thông tin từ Google
        """
        google_id = google_user_info.get("sub")
        email = google_user_info.get("email")
        name = google_user_info.get("name", "")
        picture = google_user_info.get("picture")

        # Tìm user by google_id
        result = await db.execute(
            select(User).where(User.google_id == google_id)
        )
        user = result.scalar_one_or_none()

        if user:
            # User đã tồn tại, cập nhật thông tin nếu cần
            if user.avatar_url != picture:
                user.avatar_url = picture
                await db.commit()
                await db.refresh(user)
            return user

        # Check email đã được dùng chưa (bởi local account)
        result = await db.execute(
            select(User).where(User.email == email)
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            # Link Google account với existing user
            existing_user.google_id = google_id
            existing_user.auth_provider = "google"
            existing_user.avatar_url = picture
            existing_user.is_verified = True  # Google emails are verified
            await db.commit()
            await db.refresh(existing_user)
            return existing_user

        # Tạo username từ email
        username = email.split("@")[0]
        # Check xem username đã tồn tại chưa, nếu có thì thêm số
        base_username = username
        counter = 1
        while True:
            result = await db.execute(
                select(User).where(User.username == username)
            )
            if not result.scalar_one_or_none():
                break
            username = f"{base_username}{counter}"
            counter += 1

        # Tạo user mới
        new_user = User(
            email=email,
            username=username,
            google_id=google_id,
            auth_provider="google",
            full_name=name,
            avatar_url=picture,
            is_verified=True,  # Google emails are verified
            hashed_password=None  # No password for OAuth users
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return new_user

    @staticmethod
    async def delete_user_account(
        user: User,
        password: str,
        db: AsyncSession
    ) -> dict:
        """
        Xóa tài khoản user và tất cả dữ liệu liên quan

        Args:
            user: User object hiện tại
            password: Password để xác nhận (có thể None cho OAuth users)
            db: Database session

        Returns:
            Dict với thông tin về số lượng items đã xóa

        Raises:
            HTTPException 400: Password sai (cho local auth)
            HTTPException 400: Yêu cầu password nhưng không cung cấp

        Flow:
            1. Verify password nếu là local auth
            2. Xóa tất cả dreams (cascade sẽ xóa images)
            3. Xóa tất cả generated images không thuộc dream nào
            4. Xóa user
            5. Commit transaction

        Security:
            - Local auth users BẮT BUỘC phải nhập password
            - OAuth users có thể bỏ qua password
            - Sử dụng transaction để đảm bảo atomic operation
        """
        from app.models import Dream, GeneratedImage

        # 1. Verify password nếu là local auth
        if user.auth_provider == "local":
            if not password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password is required for local account deletion"
                )

            # Check password
            if not user.hashed_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No password set for this account"
                )

            if not verify_password(password, user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid password"
                )

        # 2. Đếm và xóa tất cả dreams (cascade sẽ xóa images trong dream)
        dreams_result = await db.execute(
            select(Dream).where(Dream.user_id == user.id)
        )
        dreams = dreams_result.scalars().all()
        dreams_count = len(dreams)

        for dream in dreams:
            await db.delete(dream)

        # 3. Xóa tất cả generated images không thuộc dream nào (orphaned images)
        orphaned_images_result = await db.execute(
            select(GeneratedImage).where(
                GeneratedImage.user_id == user.id,
                GeneratedImage.dream_id == None
            )
        )
        orphaned_images = orphaned_images_result.scalars().all()
        orphaned_images_count = len(orphaned_images)

        for image in orphaned_images:
            await db.delete(image)

        # 4. Xóa user
        await db.delete(user)

        # 5. Commit tất cả changes (atomic transaction)
        await db.commit()

        return {
            "message": "Account deleted successfully",
            "dreams_deleted": dreams_count,
            "orphaned_images_deleted": orphaned_images_count
        }
