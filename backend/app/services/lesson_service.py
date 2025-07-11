from sqlalchemy.orm import Session
from app.models.lesson import Lesson
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from app.services.course_service import get_course_by_id
from fastapi import HTTPException, status

def get_lesson_by_id(db: Session, lesson_id: int) -> Lesson | None:
    return db.query(Lesson).filter(Lesson.id == lesson_id).first()

def get_lessons(db: Session) -> list[LessonResponse]:
    return [LessonResponse.from_orm(lesson) for lesson in db.query(Lesson).all()]

def create_lesson(db: Session, lesson: LessonCreate) -> LessonResponse:
    if not get_course_by_id(db, lesson.course_id):
        raise HTTPException(status_code=400, detail="Invalid course_id")
    db_lesson = Lesson(**lesson.dict())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return LessonResponse.from_orm(db_lesson)

def update_lesson(db: Session, lesson_id: int, lesson_update: LessonUpdate) -> LessonResponse:
    db_lesson = get_lesson_by_id(db, lesson_id)
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if lesson_update.course_id and not get_course_by_id(db, lesson_update.course_id):
        raise HTTPException(status_code=400, detail="Invalid course_id")
    update_data = lesson_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_lesson, key, value)
    db.commit()
    db.refresh(db_lesson)
    return LessonResponse.from_orm(db_lesson)

def delete_lesson(db: Session, lesson_id: int):
    db_lesson = get_lesson_by_id(db, lesson_id)
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(db_lesson)
    db.commit()