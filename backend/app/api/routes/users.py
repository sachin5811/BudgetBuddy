from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import EXPENSE_CATEGORIES, INCOME_SOURCES
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import ProfileUpdate, UserResponse


router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/meta")
def get_meta(current_user: User = Depends(get_current_user)):
    return {
        "expense_categories": EXPENSE_CATEGORIES,
        "income_sources": INCOME_SOURCES,
    }
