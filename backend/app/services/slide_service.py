from sqlalchemy.orm import Session
from app.models.slide import Slide
from app.schemas.slide import SlideCreate, SlideResponse

def create_slide(db: Session, slide: SlideCreate) -> SlideResponse:
    db_slide = Slide(**slide.dict())
    db.add(db_slide)
    db.commit()
    db.refresh(db_slide)
    return SlideResponse.from_orm(db_slide)

def get_slides_by_course(db: Session, course_id: int) -> list[Slide]:
    return db.query(Slide).filter(Slide.course_id == course_id).order_by(Slide.slide_order).all()