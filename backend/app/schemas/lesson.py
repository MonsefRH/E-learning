from pydantic import BaseModel, ConfigDict

class LessonBase(BaseModel):
    title: str
    duration: str | None
    completed: bool = False

class LessonCreate(LessonBase):
    course_id: int

class LessonResponse(LessonBase):
    id: int
    course_id: int
    model_config = ConfigDict(from_attributes=True)  # Pydantic V2 syntax
