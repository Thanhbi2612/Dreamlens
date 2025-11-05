"""
Image Generation API Routes
Endpoints để generate ảnh từ text
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas import ImageGenerationRequest, ImageGenerationResponse, GeneratedImageResponse
from app.services.image_generation_service import ImageGenerationService
from app.services import dream_service
from app.utils.dependencies import get_current_active_user
from app.models import User


router = APIRouter(prefix="/api/images", tags=["Image Generation"])


@router.get(
    "/test-connection",
    summary="Test Hugging Face API connection",
    description="Test kết nối với Hugging Face API và kiểm tra cấu hình"
)
async def test_huggingface_connection():
    """
    Test kết nối với Hugging Face API

    **Returns:**
    - Thông tin về cấu hình và trạng thái kết nối
    """
    from app.config import settings
    from huggingface_hub import InferenceClient

    try:
        # Check token
        if not settings.HUGGINGFACE_TOKEN or settings.HUGGINGFACE_TOKEN == "":
            return {
                "status": "error",
                "message": "HUGGINGFACE_TOKEN is not configured",
                "token_present": False
            }

        # Check model
        if not settings.STABLE_DIFFUSION_MODEL or settings.STABLE_DIFFUSION_MODEL == "":
            return {
                "status": "error",
                "message": "STABLE_DIFFUSION_MODEL is not configured",
                "token_present": True,
                "model_present": False
            }

        # Try to initialize client
        client = InferenceClient(token=settings.HUGGINGFACE_TOKEN)

        return {
            "status": "success",
            "message": "Hugging Face configuration looks good",
            "token_present": True,
            "token_length": len(settings.HUGGINGFACE_TOKEN),
            "token_prefix": settings.HUGGINGFACE_TOKEN[:10] + "...",
            "model": settings.STABLE_DIFFUSION_MODEL,
            "client_initialized": True
        }

    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }


@router.post(
    "/generate",
    response_model=ImageGenerationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate image from text",
    description="Generate ảnh từ text prompt sử dụng Stable Diffusion"
)
async def generate_image(
    request: ImageGenerationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate ảnh từ text prompt

    **Request Body:**
    - prompt: Text mô tả ảnh (bắt buộc)
    - dream_id: ID của dream session (bắt buộc)
    - negative_prompt: Text mô tả những gì không muốn trong ảnh (optional)

    **Returns:**
    - Thông tin ảnh đã generate kèm base64 image data

    **Authentication Required:**
    - Cần JWT token trong Authorization header

    **Raises:**
    - 404: Dream không tồn tại hoặc không thuộc về user
    """
    # Verify dream thuộc về user
    dream = await dream_service.get_dream_by_id(db, request.dream_id, current_user.id)
    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dream not found or you don't have permission to access it"
        )

    # Generate image
    result = await ImageGenerationService.generate_image(
        prompt=request.prompt,
        user=current_user,
        db=db,
        dream_id=request.dream_id,
        negative_prompt=request.negative_prompt
    )
    return result


@router.get(
    "/my-images",
    response_model=List[GeneratedImageResponse],
    summary="Get my generated images",
    description="Lấy danh sách các ảnh đã generate của user hiện tại"
)
async def get_my_images(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Lấy danh sách ảnh đã generate

    **Query Parameters:**
    - limit: Số lượng ảnh tối đa (default: 20)

    **Returns:**
    - List các ảnh đã generate, sort theo created_at desc

    **Authentication Required:**
    - Cần JWT token trong Authorization header
    """
    images = await ImageGenerationService.get_user_images(
        user=current_user,
        db=db,
        limit=limit
    )
    return images
