"""
Dream Analysis Service using Groq API (Llama 3.3 70B)

Phân tích giấc mơ từ text prompt bằng LLM để trích xuất:
- Cảm xúc chủ đạo
- Ý nghĩa và biểu tượng
- Gợi ý và lời khuyên
"""

from groq import Groq
from app.config import settings
import logging

logger = logging.getLogger(__name__)


async def analyze_dream(prompt: str) -> str:
    """
    Phân tích giấc mơ bằng Groq API (Llama 3.3 70B)

    Args:
        prompt: Text mô tả giấc mơ của user

    Returns:
        str: Phân tích chi tiết về giấc mơ (markdown format)

    Raises:
        Exception: Nếu API call thất bại
    """
    try:
        # Initialize Groq client
        client = Groq(api_key=settings.GROQ_API_KEY)

        # Tạo system prompt để hướng dẫn LLM phân tích giấc mơ
        system_prompt = """Bạn là một chuyên gia phân tích giấc mơ. Nhiệm vụ của bạn là phân tích ý nghĩa của giấc mơ dựa trên mô tả từ người dùng.

Hãy trả lời theo định dạng sau (bằng tiếng Việt):

**🌟 Cảm xúc chủ đạo:**
[Liệt kê 2-3 cảm xúc chính trong giấc mơ]

**✨ Ý nghĩa:**
[Phân tích ý nghĩa của giấc mơ, liên hệ với cuộc sống thực]

**💫 Biểu tượng:**
[Giải thích các biểu tượng quan trọng trong giấc mơ]

**🔮 Gợi ý:**
[Lời khuyên hoặc điều cần lưu ý dựa trên giấc mơ]

Hãy trả lời ngắn gọn, súc tích (khoảng 150-200 từ), tập trung vào nội dung có ý nghĩa."""

        # Gọi Groq API
        logger.info(f"[Dream Analysis] Analyzing dream with Groq API...")
        logger.info(f"[Dream Analysis] Prompt length: {len(prompt)} characters")

        completion = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Hãy phân tích giấc mơ sau:\n\n{prompt}"}
            ],
            temperature=0.7,  # Creativity level
            max_tokens=800,   # Giới hạn response length
            top_p=0.9,
            stream=False
        )

        # Lấy response
        analysis = completion.choices[0].message.content

        logger.info(f"[Dream Analysis] Analysis completed successfully")
        logger.info(f"[Dream Analysis] Response length: {len(analysis)} characters")

        return analysis

    except Exception as e:
        logger.error(f"[Dream Analysis] Error analyzing dream: {str(e)}")

        # Return fallback message nếu API fail
        return """**⚠️ Không thể phân tích giấc mơ**

Rất tiếc, hệ thống phân tích giấc mơ đang gặp sự cố. Vui lòng thử lại sau.

Trong lúc chờ đợi, bạn có thể:
- Lưu lại mô tả giấc mơ
- Thử phân tích lại sau ít phút
- Xem lại các giấc mơ đã phân tích trước đó"""


def get_analysis_preview(analysis: str, max_length: int = 100) -> str:
    """
    Tạo preview ngắn gọn từ full analysis

    Args:
        analysis: Full analysis text
        max_length: Độ dài tối đa của preview

    Returns:
        str: Preview text (truncated nếu quá dài)
    """
    if not analysis or len(analysis) <= max_length:
        return analysis

    # Lấy đoạn đầu tiên có ý nghĩa
    preview = analysis[:max_length].rsplit(' ', 1)[0]
    return preview + "..."
