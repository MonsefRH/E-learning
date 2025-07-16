from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.configs.db import get_db
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from app.services.lesson_service import get_lesson_by_id, get_lessons, create_lesson, update_lesson, delete_lesson
router = APIRouter(prefix="/admin/lessons", tags=["Lessons"])

@router.get("/", response_model=list[LessonResponse])
def get_all_lessons(db: Session = Depends(get_db)):
    return get_lessons(db)

@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.post("/", response_model=LessonResponse)
def create_new_lesson(lesson: LessonCreate, db: Session = Depends(get_db)):
    return create_lesson(db, lesson)

@router.put("/{lesson_id}", response_model=LessonResponse)
def update_existing_lesson(lesson_id: int, lesson_update: LessonUpdate, db: Session = Depends(get_db)):
    return update_lesson(db, lesson_id, lesson_update)

@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_lesson(lesson_id: int, db: Session = Depends(get_db)):
    delete_lesson(db, lesson_id)
    return None