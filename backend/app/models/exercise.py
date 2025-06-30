from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.configs.db import Base

class Exercise(Base):
    __tablename__ = "exercises"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    type = Column(String, nullable=False)
    question = Column(Text, nullable=False)
    options = Column(JSONB)
    correct_answer = Column(Integer)
    points = Column(Integer, nullable=False)