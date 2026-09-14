from datetime import date

from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def list_expenses(db: Session, user_id: int, category: str | None = None):
    query = db.query(Expense).filter(Expense.user_id == user_id)
    if category:
        query = query.filter(Expense.category == category)
    return query.order_by(Expense.date.desc(), Expense.id.desc()).all()


def create_expense(db: Session, user_id: int, data: ExpenseCreate):
    expense = Expense(
        user_id=user_id,
        category=data.category,
        amount=data.amount,
        description=data.description or "",
        date=data.date or date.today(),
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def get_expense(db: Session, user_id: int, expense_id: int):
    return (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == user_id)
        .first()
    )


def update_expense(db: Session, expense: Expense, data: ExpenseUpdate):
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense: Expense):
    db.delete(expense)
    db.commit()
