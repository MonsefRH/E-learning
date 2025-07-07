from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.configs.db import get_db
from app.models.user import User
from .auth import get_current_user, verify_password, pwd_context, create_access_token

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# Modèles Pydantic pour la validation des données
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class UpdateUserRequest(BaseModel):
    username: str = None
    email: str = None

@router.put("/change-password")
async def change_password(
        request: ChangePasswordRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )

    hashed_new_password = pwd_context.hash(request.new_password)
    current_user.password_hash = hashed_new_password
    db.commit()
    db.refresh(current_user)

    # Optionnel : Générer un nouveau token d'accès après le changement de mot de passe
    access_token = create_access_token(data={"sub": current_user.username})
    response = {
        "access_token": access_token,
        "token_type": "bearer"
    }

    return response

@router.put("/update")
async def update_user(
        request: UpdateUserRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Vérifier qu'au moins un champ est fourni
    if not request.username and not request.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field (username or email) must be provided"
        )

    # Vérifier l'unicité de l'username si fourni
    if request.username:
        existing_user = db.query(User).filter(
            User.username == request.username,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists"
            )
        current_user.username = request.username

    # Vérifier l'unicité de l'email si fourni
    if request.email:
        existing_user = db.query(User).filter(
            User.email == request.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists"
            )
        current_user.email = request.email

    db.commit()
    db.refresh(current_user)

    # Optionnel : Générer un nouveau token d'accès après le changement de mot de passe
    access_token = create_access_token(data={"sub": current_user.username})


    return {
        "message": "User updated successfully",
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email
        },
        "access_token": access_token,
        "token_type": "bearer"
    }

