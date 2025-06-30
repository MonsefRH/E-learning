from pydantic import BaseModel, ConfigDict

class SlideBase(BaseModel):
    
    title: str
    content: str | None
    duration: int | None
    avatar_script: str | None
    slide_order: int

class SlideCreate(SlideBase):
    course_id: int

class SlideResponse(SlideBase):
    id: int
    course_id: int
    model_config = ConfigDict(from_attributes=True)  # Pydantic V2 syntax
