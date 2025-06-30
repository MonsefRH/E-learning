from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.configs.db import get_db
from app.services.exercise_service import create_exercise, get_exercises_by_course
from app.schemas.exercise import ExerciseCreate, ExerciseResponse
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/exercises", tags=["exercises"])

@router.post("/", response_model=ExerciseResponse)
def create_new_exercise(exercise: ExerciseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can create exercises")
    return create_exercise(db, exercise)

@router.get("/course/{course_id}", response_model=List[ExerciseResponse])
def read_exercises(course_id: int, db: Session = Depends(get_db)):
    return get_exercises_by_course(db, course_id)