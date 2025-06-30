from sqlalchemy.orm import Session
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseResponse

def create_exercise(db: Session, exercise: ExerciseCreate) -> ExerciseResponse:
    db_exercise = Exercise(**exercise.dict())
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return ExerciseResponse.from_orm(db_exercise)

def get_exercises_by_course(db: Session, course_id: int) -> list[Exercise]:
    return db.query(Exercise).filter(Exercise.course_id == course_id).all()