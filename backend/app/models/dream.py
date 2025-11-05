from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Dream(Base):
    """
    Dream model - Lưu trữ các session giấc mơ của user
    Mỗi dream có thể chứa nhiều generated images
    """
    __tablename__ = "dreams"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign Key to User
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)

    # Dream information
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Organization flags
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    # user = relationship("User", backref="dreams")  # Uncomment nếu User model có sẵn relationship
    images = relationship("GeneratedImage", back_populates="dream", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Dream(id={self.id}, title='{self.title}', user_id={self.user_id})>"
