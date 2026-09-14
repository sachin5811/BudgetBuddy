from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.services import analytics_service


router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
def summary(
    month: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return analytics_service.summary(db, current_user.id, month)


@router.get("/category-spending")
def category_spending(
    month: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return analytics_service.category_spending(db, current_user.id, month)


@router.get("/monthly-trend")
def monthly_trend(
    months: int = 6,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return analytics_service.monthly_trend(db, current_user.id, months)
