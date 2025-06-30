from pydantic import BaseModel , ConfigDict
from datetime import datetime

class CourseBase(BaseModel):
    title: str
    description: str | None
    instructor: str | None
    duration: str | None
    total_slides: int | None
    category: str | None
    level: str | None
    students: int = 0
    rating: float = 0.0

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)  # Pydantic V2 syntax
