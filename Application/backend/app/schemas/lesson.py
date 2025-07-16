from pydantic import BaseModel
from typing import Optional

class LessonBase(BaseModel):
    title: str
    description: str
    course_id: int

class LessonCreate(LessonBase):
    pass

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[int] = None

class LessonResponse(LessonBase):
    id: int

    class Config:
        from_attributes = True