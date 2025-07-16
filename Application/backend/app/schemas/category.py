from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    description: str
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    subcategories: List["CategoryResponse"] = []
    courses: List["CourseResponse"] = []

    class Config:
        from_attributes = True

from app.schemas.course import CourseResponse
CategoryResponse.update_forward_refs()