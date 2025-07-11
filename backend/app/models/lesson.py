from sqlalchemy import Column, String, Text, ForeignKey, Integer
from app.configs.db import Base
from sqlalchemy.orm import relationship

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    course = relationship("Course", back_populates="lessons")