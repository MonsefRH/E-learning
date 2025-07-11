from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List


class CourseBase(BaseModel):
    title: str
    description: str
    category_id: int = Field(..., description="Category ID")
    teacher_id: Optional[int] = Field(None, description="Teacher ID")

    @validator('category_id', 'teacher_id', pre=True)
    def convert_to_int(cls, v):
        if v is None:
            return v
        try:
            return int(v)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid integer value: {v}")

class CourseCreate(CourseBase):
    deadline: Optional[datetime] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    teacher_id: Optional[int] = None
    deadline: Optional[datetime] = None
    is_active: Optional[bool] = None

class CourseResponse(CourseBase):
    id: int
    is_active: bool
    deadline: Optional[datetime]
    lessons: List["LessonResponse"] = []

    class Config:
        from_attributes = True

from app.schemas.lesson import LessonResponse
CourseResponse.update_forward_refs()