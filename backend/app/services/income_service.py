from datetime import date

from sqlalchemy.orm import Session

from app.models.income import Income
from app.schemas.income import IncomeCreate, IncomeUpdate


def list_incomes(db: Session, user_id: int):
    return (
        db.query(Income)
        .filter(Income.user_id == user_id)
        .order_by(Income.date.desc(), Income.id.desc())
        .all()
    )


def create_income(db: Session, user_id: int, data: IncomeCreate):
    income = Income(
        user_id=user_id,
        source=data.source,
        amount=data.amount,
        description=data.description or "",
        date=data.date or date.today(),
    )
    db.add(income)
    db.commit()
    db.refresh(income)
    return income


def get_income(db: Session, user_id: int, income_id: int):
    return (
        db.query(Income)
        .filter(Income.id == income_id, Income.user_id == user_id)
        .first()
    )


def update_income(db: Session, income: Income, data: IncomeUpdate):
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(income, key, value)
    db.commit()
    db.refresh(income)
    return income


def delete_income(db: Session, income: Income):
    db.delete(income)
    db.commit()
