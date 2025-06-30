from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.configs.db import Base


class Slide(Base):
    __tablename__ = "slides"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    content = Column(Text)
    duration = Column(Integer)
    avatar_script = Column(Text)
    slide_order = Column(Integer, nullable=False)