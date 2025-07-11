from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from app.configs.db import Base
from datetime import datetime
from sqlalchemy.orm import relationship

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)  # Self-referential for subcategories
    parent = relationship("Category", remote_side=[id], back_populates="subcategories")
    subcategories = relationship("Category", back_populates="parent", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="category")