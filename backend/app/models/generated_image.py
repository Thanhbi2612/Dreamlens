from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class GeneratedImage(Base):
    """
    Model để lưu lịch sử generate ảnh của user
    Mỗi ảnh thuộc về một dream session
    """
    __tablename__ = "generated_images"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Key to User
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)

    # Foreign Key to Dream (nullable để backward compatible với ảnh cũ)
    dream_id = Column(Integer, ForeignKey('dreams.id', ondelete='CASCADE'), nullable=True, index=True)

    # Generation details
    prompt = Column(Text, nullable=False)  # Text prompt user nhập
    negative_prompt = Column(Text, nullable=True)  # Negative prompt (optional)
    image_url = Column(String(500), nullable=False)  # URL hoặc path của ảnh
    model_name = Column(String(100), nullable=False)  # Model đã dùng
    analysis = Column(Text, nullable=True)  # AI-generated dream analysis from Groq LLM

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship với Dream
    dream = relationship("Dream", back_populates="images")

    def __repr__(self):
        return f"<GeneratedImage(id={self.id}, user_id={self.user_id}, dream_id={self.dream_id}, prompt='{self.prompt[:30]}...')>"
