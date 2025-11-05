from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Generic, TypeVar


# ============================================
# REQUEST SCHEMAS (Input từ client)
# ============================================

class DreamCreate(BaseModel):
    """Schema để tạo dream mới"""
    title: str = Field(..., min_length=1, max_length=255, description="Tiêu đề giấc mơ")
    description: Optional[str] = Field(None, description="Mô tả chi tiết (optional)")


class DreamUpdate(BaseModel):
    """Schema để update dream"""
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Tiêu đề mới")
    description: Optional[str] = Field(None, description="Mô tả mới")
    is_pinned: Optional[bool] = Field(None, description="Ghim dream lên đầu")
    is_archived: Optional[bool] = Field(None, description="Ẩn dream khỏi danh sách")


# ============================================
# RESPONSE SCHEMAS (Output trả về client)
# ============================================

class DreamResponse(BaseModel):
    """
    Schema response cơ bản cho dream
    Dùng khi trả về danh sách dreams
    """
    id: int
    user_id: int
    title: str
    description: Optional[str]
    is_pinned: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    image_count: int = Field(default=0, description="Số lượng ảnh trong dream")

    class Config:
        from_attributes = True  # Cho phép convert từ SQLAlchemy model


class ImageInDream(BaseModel):
    """Schema cho image khi nằm trong dream detail"""
    id: int
    prompt: str
    negative_prompt: Optional[str]
    image_url: str
    model_name: str
    analysis: Optional[str] = None # Analysis of the image
    created_at: datetime

    class Config:
        from_attributes = True


class DreamDetailResponse(BaseModel):
    """
    Schema response chi tiết cho dream
    Dùng khi trả về 1 dream cụ thể (bao gồm danh sách ảnh)
    """
    id: int
    user_id: int
    title: str
    description: Optional[str]
    is_pinned: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    images: List[ImageInDream] = Field(default_factory=list, description="Danh sách ảnh trong dream")

    class Config:
        from_attributes = True


# ============================================
# PAGINATION SCHEMAS
# ============================================

class PaginationMeta(BaseModel):
    """Metadata cho pagination"""
    total: int = Field(..., description="Tổng số items")
    page: int = Field(..., description="Trang hiện tại (1-indexed)")
    limit: int = Field(..., description="Số items per page")
    total_pages: int = Field(..., description="Tổng số trang")
    has_next: bool = Field(..., description="Còn trang tiếp theo?")
    has_prev: bool = Field(..., description="Có trang trước?")


T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """Generic response cho paginated data"""
    data: List[T] = Field(..., description="Danh sách items")
    pagination: PaginationMeta = Field(..., description="Thông tin pagination")


class DreamsPaginatedResponse(BaseModel):
    """Response cho paginated dreams"""
    data: List[DreamResponse] = Field(..., description="Danh sách dreams")
    pagination: PaginationMeta = Field(..., description="Thông tin pagination")
