from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.configs.db import Base

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    duration = Column(String)
    completed = Column(Boolean, default=False)