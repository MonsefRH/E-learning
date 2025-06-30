from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class ExerciseBase(BaseModel):
    type: str
    question: str
    options: Optional[List[str]]
    correct_answer: Optional[int]
    points: int

class ExerciseCreate(ExerciseBase):
    course_id: int

class ExerciseResponse(ExerciseBase):
    id: int
    course_id: int
    model_config = ConfigDict(from_attributes=True)  # Pydantic V2 syntax
