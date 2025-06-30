from sqlalchemy.orm import Session
from app.models.lesson import Lesson
from app.schemas.lesson import LessonCreate, LessonResponse

def create_lesson(db: Session, lesson: LessonCreate) -> LessonResponse:
    db_lesson = Lesson(**lesson.dict())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return LessonResponse.from_orm(db_lesson)

def get_lessons_by_course(db: Session, course_id: int) -> list[Lesson]:
    return db.query(Lesson).filter(Lesson.course_id == course_id).all()