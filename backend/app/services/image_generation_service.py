"""
Image Generation Service
Business logic cho text-to-image generation với Hugging Face API
"""

from huggingface_hub import InferenceClient
import base64
import io
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models import User, GeneratedImage
from app.config import settings
from app.services import dream_analysis_service


class ImageGenerationService:
    """
    Service class để generate ảnh từ text prompt
    """

    @staticmethod
    async def generate_image(
        prompt: str,
        user: User,
        db: AsyncSession,
        dream_id: int,
        negative_prompt: str = None
    ) -> dict:
        """
        Generate ảnh từ text prompt sử dụng Hugging Face Inference API

        Args:
            prompt: Text mô tả ảnh cần generate
            user: User object đang request
            db: Database session
            dream_id: ID của dream session mà ảnh này thuộc về
            negative_prompt: Negative prompt (optional)

        Returns:
            Dict chứa thông tin ảnh đã generate

        Raises:
            HTTPException: Nếu có lỗi khi generate
        """

        try:
            print(f"\n{'='*60}")
            print(f"[Image Generation] Starting image generation...")
            print(f"[Image Generation] Dream ID: {dream_id}")
            print(f"[Image Generation] Model: {settings.STABLE_DIFFUSION_MODEL}")
            print(f"[Image Generation] Prompt: {prompt}")
            print(f"[Image Generation] Negative Prompt: {negative_prompt}")
            print(f"[Image Generation] Token (first 10 chars): {settings.HUGGINGFACE_TOKEN[:10]}...")
            print(f"[Image Generation] Token length: {len(settings.HUGGINGFACE_TOKEN)}")
            print(f"{'='*60}\n")

            # Khởi tạo InferenceClient với token
            client = InferenceClient(token=settings.HUGGINGFACE_TOKEN)
            print(f"[Image Generation] InferenceClient initialized successfully")

            # Gọi text_to_image API
            # Note: negative_prompt không được support trực tiếp trong InferenceClient
            # Nếu cần negative prompt, phải dùng parameters
            print(f"[Image Generation] Calling text_to_image API...")
            image = client.text_to_image(
                prompt=prompt,
                model=settings.STABLE_DIFFUSION_MODEL
            )

            print(f"[Image Generation] API call successful!")
            print(f"[Image Generation] Image type: {type(image)}")
            print(f"[Image Generation] Image size: {image.size if hasattr(image, 'size') else 'Unknown'}")

            # Convert PIL Image sang bytes
            print(f"[Image Generation] Converting image to bytes...")
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            image_bytes = img_byte_arr.getvalue()
            print(f"[Image Generation] Image bytes size: {len(image_bytes)} bytes")

            # Convert image sang base64 để gửi cho frontend
            print(f"[Image Generation] Converting to base64...")
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            image_data_url = f"data:image/png;base64,{image_base64}"
            print(f"[Image Generation] Base64 data URL length: {len(image_data_url)} chars")

            # Phân tích giấc mơ bằng LLM (Groq API)
            print(f"[Image Generation] Analyzing dream with Groq LLM...")
            try:
                dream_analysis = await dream_analysis_service.analyze_dream(prompt)
                print(f"[Image Generation] Dream analysis completed successfully")
            except Exception as analysis_error:
                print(f"[Image Generation] Warning: Dream analysis failed - {str(analysis_error)}")
                dream_analysis = None

            # Lưu vào database
            print(f"[Image Generation] Saving to database...")
            generated_image = GeneratedImage(
                user_id=user.id,
                dream_id=dream_id,
                prompt=prompt,
                negative_prompt=negative_prompt,
                image_url=image_data_url[:500],  # Lưu 500 ký tự đầu (truncate nếu quá dài)
                model_name=settings.STABLE_DIFFUSION_MODEL,
                analysis=dream_analysis  # Lưu phân tích giấc mơ
            )

            db.add(generated_image)
            print(f"[Image Generation] Committing to database...")
            await db.commit()
            await db.refresh(generated_image)

            print(f"[Image Generation] Successfully saved to database with ID: {generated_image.id}")
            print(f"{'='*60}\n")

            return {
                "id": generated_image.id,
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "image_url": image_data_url,
                "model": settings.STABLE_DIFFUSION_MODEL,
                "analysis": dream_analysis,  # Thêm analysis vào response
                "created_at": generated_image.created_at
            }

        except Exception as e:
            import traceback
            print(f"\n{'='*60}")
            print(f"[Image Generation] ERROR OCCURRED!")
            print(f"[Image Generation] Error type: {type(e).__name__}")
            print(f"[Image Generation] Error message: {str(e)}")
            print(f"[Image Generation] Full traceback:")
            print(traceback.format_exc())
            print(f"{'='*60}\n")

            # Check if it's a HuggingFace API error
            if hasattr(e, 'response'):
                print(f"[Image Generation] Response status: {e.response.status_code if hasattr(e.response, 'status_code') else 'N/A'}")
                print(f"[Image Generation] Response text: {e.response.text if hasattr(e.response, 'text') else 'N/A'}")

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating image: {str(e)}"
            )

    @staticmethod
    async def get_user_images(
        user: User,
        db: AsyncSession,
        limit: int = 20
    ) -> list:
        """
        Lấy danh sách ảnh đã generate của user

        Args:
            user: User object
            db: Database session
            limit: Số lượng ảnh tối đa

        Returns:
            List các ảnh đã generate
        """
        from sqlalchemy import select

        result = await db.execute(
            select(GeneratedImage)
            .where(GeneratedImage.user_id == user.id)
            .order_by(GeneratedImage.created_at.desc())
            .limit(limit)
        )

        images = result.scalars().all()
        return images
