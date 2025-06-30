from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.configs.db import get_db
from app.services.lesson_service import create_lesson, get_lessons_by_course
from app.schemas.lesson import LessonCreate, LessonResponse
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/lessons", tags=["lessons"])

@router.post("/", response_model=LessonResponse)
def create_new_lesson(lesson: LessonCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can create lessons")
    return create_lesson(db, lesson)

@router.get("/course/{course_id}", response_model=List[LessonResponse])
def read_lessons(course_id: int, db: Session = Depends(get_db)):
    return get_lessons_by_course(db, course_id)