"""
Dream Service - Business logic cho Dream operations
Xử lý tất cả các thao tác liên quan đến dream sessions
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.models import Dream, GeneratedImage
from app.schemas.dream import DreamCreate, DreamUpdate


async def create_dream(
    db: AsyncSession,
    user_id: int,
    dream_data: DreamCreate
) -> Dream:
    """
    Tạo dream mới cho user

    Args:
        db: Database session
        user_id: ID của user tạo dream
        dream_data: Dữ liệu dream (title, description)

    Returns:
        Dream object vừa tạo
    """
    dream = Dream(
        user_id=user_id,
        title=dream_data.title,
        description=dream_data.description
    )

    db.add(dream)
    await db.commit()
    await db.refresh(dream)

    return dream


async def get_user_dreams(
    db: AsyncSession,
    user_id: int,
    include_archived: bool = False,
    page: int = 1,
    limit: int = 10
) -> tuple[List[Dream], int]:
    """
    Lấy dreams của user với pagination
    Sort: Pinned dreams first, sau đó theo thời gian tạo (mới nhất trước)

    Args:
        db: Database session
        user_id: ID của user
        include_archived: True nếu muốn bao gồm cả dreams đã archive
        page: Trang hiện tại (1-indexed)
        limit: Số dreams per page

    Returns:
        Tuple (List dreams, total_count)
    """
    # Build base query
    base_query = select(Dream).where(Dream.user_id == user_id)

    # Filter archived nếu cần
    if not include_archived:
        base_query = base_query.where(Dream.is_archived == False)

    # Count total dreams (trước khi pagination)
    count_query = select(func.count()).select_from(base_query.alias())
    total_result = await db.execute(count_query)
    total_count = total_result.scalar() or 0

    # Apply sorting
    query = base_query.order_by(
        Dream.is_pinned.desc(),
        Dream.created_at.desc()
    )

    # Apply pagination
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    dreams = result.scalars().all()

    # Đếm số lượng ảnh cho mỗi dream
    for dream in dreams:
        count_query = select(func.count(GeneratedImage.id)).where(
            GeneratedImage.dream_id == dream.id
        )
        count_result = await db.execute(count_query)
        dream.image_count = count_result.scalar() or 0

    return list(dreams), total_count


async def get_dream_by_id(
    db: AsyncSession,
    dream_id: int,
    user_id: int
) -> Optional[Dream]:
    """
    Lấy chi tiết 1 dream (bao gồm tất cả images)

    Args:
        db: Database session
        dream_id: ID của dream cần lấy
        user_id: ID của user (để verify ownership)

    Returns:
        Dream object hoặc None nếu không tìm thấy
    """
    query = (
        select(Dream)
        .options(selectinload(Dream.images))  # Eager load images
        .where(and_(
            Dream.id == dream_id,
            Dream.user_id == user_id
        ))
    )

    result = await db.execute(query)
    dream = result.scalar_one_or_none()

    return dream


async def update_dream(
    db: AsyncSession,
    dream_id: int,
    user_id: int,
    dream_data: DreamUpdate
) -> Optional[Dream]:
    """
    Cập nhật dream (title, description, is_pinned, is_archived)

    Args:
        db: Database session
        dream_id: ID của dream cần update
        user_id: ID của user (để verify ownership)
        dream_data: Dữ liệu cần update

    Returns:
        Dream object sau khi update, hoặc None nếu không tìm thấy
    """
    # Lấy dream hiện tại
    dream = await get_dream_by_id(db, dream_id, user_id)
    if not dream:
        return None

    # Update các fields có giá trị (exclude_unset=True)
    update_data = dream_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dream, field, value)

    await db.commit()
    await db.refresh(dream)

    # Đếm số ảnh
    count_query = select(func.count(GeneratedImage.id)).where(
        GeneratedImage.dream_id == dream.id
    )
    count_result = await db.execute(count_query)
    dream.image_count = count_result.scalar() or 0

    return dream


async def delete_dream(
    db: AsyncSession,
    dream_id: int,
    user_id: int
) -> bool:
    """
    Xóa dream (cascade xóa tất cả images liên quan)

    Args:
        db: Database session
        dream_id: ID của dream cần xóa
        user_id: ID của user (để verify ownership)

    Returns:
        True nếu xóa thành công, False nếu không tìm thấy dream
    """
    # Lấy dream
    dream = await get_dream_by_id(db, dream_id, user_id)
    if not dream:
        return False

    # Delete (cascade sẽ tự động xóa các images)
    await db.delete(dream)
    await db.commit()

    return True


async def toggle_pin(
    db: AsyncSession,
    dream_id: int,
    user_id: int
) -> Optional[Dream]:
    """
    Toggle trạng thái pin của dream

    Args:
        db: Database session
        dream_id: ID của dream
        user_id: ID của user

    Returns:
        Dream object sau khi toggle, hoặc None nếu không tìm thấy
    """
    dream = await get_dream_by_id(db, dream_id, user_id)
    if not dream:
        return None

    dream.is_pinned = not dream.is_pinned

    await db.commit()
    await db.refresh(dream)

    return dream


async def delete_all_dreams(
    db: AsyncSession,
    user_id: int
) -> dict:
    """
    Xóa TẤT CẢ dreams của user và các images liên quan

    Args:
        db: Database session
        user_id: ID của user

    Returns:
        Dict với thông tin về số lượng items đã xóa:
        - dreams_deleted: Số dreams đã xóa
        - images_deleted: Số images đã xóa (bao gồm cả images trong dreams và orphaned images)

    Flow:
        1. Query tất cả dreams của user
        2. Đếm tất cả images (trong dreams + orphaned)
        3. Xóa tất cả dreams (cascade sẽ xóa images trong dreams)
        4. Xóa tất cả orphaned images
        5. Return statistics

    Note:
        - Cascade delete sẽ tự động xóa images trong dreams
        - Orphaned images (dream_id = NULL) sẽ được xóa riêng
        - Sử dụng transaction để đảm bảo atomic operation
    """
    # 1. Query tất cả dreams của user
    dreams_query = select(Dream).where(Dream.user_id == user_id)
    dreams_result = await db.execute(dreams_query)
    dreams = dreams_result.scalars().all()
    dreams_count = len(dreams)

    # 2. Đếm tất cả images trong dreams
    images_in_dreams_query = select(func.count(GeneratedImage.id)).where(
        GeneratedImage.user_id == user_id,
        GeneratedImage.dream_id.isnot(None)
    )
    images_in_dreams_result = await db.execute(images_in_dreams_query)
    images_in_dreams_count = images_in_dreams_result.scalar() or 0

    # 3. Xóa tất cả dreams (cascade sẽ xóa images trong dreams)
    for dream in dreams:
        await db.delete(dream)

    # 4. Xóa tất cả orphaned images (không thuộc dream nào)
    orphaned_images_query = select(GeneratedImage).where(
        GeneratedImage.user_id == user_id,
        GeneratedImage.dream_id.is_(None)
    )
    orphaned_images_result = await db.execute(orphaned_images_query)
    orphaned_images = orphaned_images_result.scalars().all()
    orphaned_images_count = len(orphaned_images)

    for image in orphaned_images:
        await db.delete(image)

    # 5. Commit tất cả changes
    await db.commit()

    # Calculate total images deleted
    total_images_deleted = images_in_dreams_count + orphaned_images_count

    return {
        "dreams_deleted": dreams_count,
        "images_deleted": total_images_deleted
    }
