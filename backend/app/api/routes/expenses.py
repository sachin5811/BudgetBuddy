from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services import expense_service
from app.services.budget_service import get_overview
from app.services.notification_service import create_notification


router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


def _check_budget_alert(db: Session, user_id: int, category: str, month: str):
    overview = get_overview(db, user_id, month)
    for cat in overview.categories:
        if cat.category == category and cat.allocated > 0:
            if cat.status == "over":
                create_notification(
                    db,
                    user_id,
                    "budget",
                    f"Over budget: {category}",
                    f"You've exceeded your {category} budget for {month}. "
                    f"Spent {cat.spent} of {cat.allocated}.",
                )
            elif cat.status == "warning":
                create_notification(
                    db,
                    user_id,
                    "budget",
                    f"Budget alert: {category}",
                    f"You've used {cat.utilization}% of your {category} "
                    f"budget for {month}.",
                )


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
    category: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return expense_service.list_expenses(db, current_user.id, category)


@router.post("", response_model=ExpenseResponse, status_code=201)
def create_expense(
    data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = expense_service.create_expense(db, current_user.id, data)
    _check_budget_alert(
        db, current_user.id, expense.category, expense.date.strftime("%Y-%m")
    )
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = expense_service.get_expense(db, current_user.id, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense_service.update_expense(db, expense, data)


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = expense_service.get_expense(db, current_user.id, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    expense_service.delete_expense(db, expense)
    return {"message": "Expense deleted"}
