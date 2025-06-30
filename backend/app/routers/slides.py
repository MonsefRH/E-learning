from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.configs.db import get_db
from app.services.slide_service import create_slide, get_slides_by_course
from app.schemas.slide import SlideCreate, SlideResponse
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/slides", tags=["slides"])

@router.post("/", response_model=SlideResponse)
def create_new_slide(slide: SlideCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Only instructors can create slides")
    return create_slide(db, slide)

@router.get("/course/{course_id}", response_model=List[SlideResponse])
def read_slides(course_id: int, db: Session = Depends(get_db)):
    return get_slides_by_course(db, course_id)