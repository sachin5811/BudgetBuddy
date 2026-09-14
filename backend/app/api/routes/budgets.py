from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.budget import BudgetOverview, BudgetSet
from app.services import budget_service


router = APIRouter(prefix="/api/budgets", tags=["Budgets"])


@router.get("", response_model=BudgetOverview)
def get_budget(
    month: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not month:
        month = date.today().strftime("%Y-%m")
    return budget_service.get_overview(db, current_user.id, month)


@router.post("", response_model=BudgetOverview)
def set_budget(
    data: BudgetSet,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return budget_service.set_budget(db, current_user.id, data)
