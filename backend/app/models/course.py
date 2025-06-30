from sqlalchemy import Column, Integer, String, Text, Float, DateTime, func
from app.configs.db import Base

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    instructor = Column(String)
    duration = Column(String)
    total_slides = Column(Integer)
    category = Column(String)
    level = Column(String)
    students = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())