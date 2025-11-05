"""
Image Generation Schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ImageGenerationRequest(BaseModel):
    """Schema cho request generate ảnh"""
    prompt: str = Field(..., min_length=1, max_length=1000, description="Text prompt để generate ảnh")
    dream_id: int = Field(..., description="ID của dream session mà ảnh này thuộc về")
    negative_prompt: Optional[str] = Field(None, max_length=1000, description="Negative prompt (optional)")

    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "A beautiful sunset over the ocean, vibrant colors, photorealistic",
                "dream_id": 1,
                "negative_prompt": "blurry, low quality, distorted"
            }
        }


class ImageGenerationResponse(BaseModel):
    """Schema cho response sau khi generate ảnh"""
    id: int
    prompt: str
    negative_prompt: Optional[str]
    image_url: str
    model: str
    analysis: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class GeneratedImageResponse(BaseModel):
    """Schema cho thông tin ảnh đã lưu trong database"""
    id: int
    user_id: int
    prompt: str
    negative_prompt: Optional[str]
    image_url: str
    model_name: str
    analysis: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
