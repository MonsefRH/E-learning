# app/services/user_service.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def change_user_password(db: Session, user_id: int, new_password: str, current_password: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    if not pwd_context.verify(current_password, user.password_hash):
        return None
    user.password_hash = pwd_context.hash(new_password)
    db.commit()
    db.refresh(user)
    return user