"""
Dream API Routes
Endpoints để quản lý dream sessions (sidebar history)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import math

from app.database import get_db
from app.schemas.dream import (
    DreamCreate, DreamUpdate, DreamResponse, DreamDetailResponse,
    DreamsPaginatedResponse, PaginationMeta
)
from app.services import dream_service
from app.utils.dependencies import get_current_active_user
from app.models import User


router = APIRouter(prefix="/api/dreams", tags=["Dreams"])


@router.post(
    "/",
    response_model=DreamResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo dream mới",
    description="Tạo một dream session mới cho user"
)
async def create_dream(
    dream_data: DreamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Tạo dream session mới

    **Request Body:**
    - **title**: Tiêu đề giấc mơ (bắt buộc, 1-255 ký tự)
    - **description**: Mô tả chi tiết (tùy chọn)

    **Returns:**
    - Dream object vừa tạo với image_count = 0
    """
    dream = await dream_service.create_dream(db, current_user.id, dream_data)

    # Thêm image_count = 0 cho dream mới
    dream.image_count = 0

    return dream


@router.get(
    "/",
    response_model=DreamsPaginatedResponse,
    summary="Lấy danh sách dreams (paginated)",
    description="Lấy dreams của user với pagination support"
)
async def get_dreams(
    include_archived: bool = Query(False, description="Bao gồm dreams đã archive"),
    page: int = Query(1, ge=1, description="Số trang (bắt đầu từ 1)"),
    limit: int = Query(10, ge=1, le=50, description="Số items per page (max 50)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách dreams của user với pagination

    **Query Parameters:**
    - **include_archived**: True để bao gồm cả dreams đã archive (default: False)
    - **page**: Số trang (1-indexed, default: 1)
    - **limit**: Số dreams per page (1-50, default: 10)

    **Returns:**
    - Paginated response với dreams và metadata
    - Dreams sort theo: pinned first, sau đó theo thời gian tạo (mới nhất trước)
    - Mỗi dream có kèm image_count
    """
    # Lấy dreams và total count từ service
    dreams, total_count = await dream_service.get_user_dreams(
        db, current_user.id, include_archived, page, limit
    )

    # Calculate pagination metadata
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 0

    pagination_meta = PaginationMeta(
        total=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1
    )

    return DreamsPaginatedResponse(
        data=dreams,
        pagination=pagination_meta
    )


@router.get(
    "/{dream_id}",
    response_model=DreamDetailResponse,
    summary="Lấy chi tiết dream",
    description="Lấy chi tiết một dream cụ thể kèm tất cả images"
)
async def get_dream_detail(
    dream_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy chi tiết dream + tất cả ảnh trong dream

    **Path Parameters:**
    - **dream_id**: ID của dream cần lấy

    **Returns:**
    - Dream object với list tất cả images

    **Raises:**
    - **404**: Dream không tồn tại hoặc không thuộc về user
    """
    dream = await dream_service.get_dream_by_id(db, dream_id, current_user.id)

    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream not found"
        )

    return dream


@router.put(
    "/{dream_id}",
    response_model=DreamResponse,
    summary="Cập nhật dream",
    description="Cập nhật thông tin dream (title, pin, archive)"
)
async def update_dream(
    dream_id: int,
    dream_data: DreamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cập nhật dream

    **Path Parameters:**
    - **dream_id**: ID của dream cần update

    **Request Body (tất cả optional):**
    - **title**: Tiêu đề mới
    - **description**: Mô tả mới
    - **is_pinned**: Ghim dream lên đầu danh sách
    - **is_archived**: Ẩn dream khỏi danh sách chính

    **Returns:**
    - Dream object sau khi update

    **Raises:**
    - **404**: Dream không tồn tại hoặc không thuộc về user
    """
    dream = await dream_service.update_dream(db, dream_id, current_user.id, dream_data)

    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream not found"
        )

    return dream


@router.delete(
    "/all",
    status_code=status.HTTP_200_OK,
    summary="Xóa tất cả dreams",
    description="Xóa TẤT CẢ dreams và images của user (KHÔNG THỂ HOÀN TÁC)"
)
async def delete_all_dreams(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Xóa tất cả dreams của user

    **⚠️ CẢNH BÁO: Hành động này KHÔNG THỂ HOÀN TÁC!**

    **Authentication Required:**
    - Cần gửi JWT token trong Authorization header

    **Hành động sẽ xóa:**
    - Tất cả dreams của user
    - Tất cả generated images (cả trong dreams và orphaned images)

    **Returns:**
    - dreams_deleted: Số dreams đã xóa
    - images_deleted: Số images đã xóa

    **Errors:**
    - 401: Token invalid hoặc expired

    **Security:**
    - Chỉ xóa dreams và images của chính user đó
    - Không ảnh hưởng đến user khác
    - Tất cả operations được thực hiện trong một transaction (atomic)

    **Example:**
    ```bash
    curl -X DELETE http://localhost:8000/api/dreams/all \\
         -H "Authorization: Bearer <token>"
    ```

    **Response Example:**
    ```json
    {
        "message": "All dreams deleted successfully",
        "dreams_deleted": 25,
        "images_deleted": 150
    }
    ```
    """
    result = await dream_service.delete_all_dreams(db, current_user.id)

    return {
        "message": "All dreams deleted successfully",
        **result
    }


@router.delete(
    "/{dream_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Xóa dream",
    description="Xóa dream và tất cả ảnh trong đó (cascade delete)"
)
async def delete_dream(
    dream_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Xóa dream (cascade xóa tất cả ảnh)

    **Path Parameters:**
    - **dream_id**: ID của dream cần xóa

    **Returns:**
    - 204 No Content nếu thành công

    **Raises:**
    - **404**: Dream không tồn tại hoặc không thuộc về user
    """
    success = await dream_service.delete_dream(db, dream_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream not found"
        )

    return None
