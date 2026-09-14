from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.income import Income
from app.models.savings_goal import SavingsGoal


def _month_str(d: date) -> str:
    return d.strftime("%Y-%m")


def summary(db: Session, user_id: int, month: str | None = None):
    if not month:
        month = _month_str(date.today())

    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    incomes = db.query(Income).filter(Income.user_id == user_id).all()
    goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == user_id).all()

    month_expense = sum(
        e.amount for e in expenses if e.date and _month_str(e.date) == month
    )
    month_income = sum(
        i.amount for i in incomes if i.date and _month_str(i.date) == month
    )
    total_saved = sum(g.saved_amount for g in goals)

    return {
        "month": month,
        "total_income": round(month_income, 2),
        "total_expense": round(month_expense, 2),
        "balance": round(month_income - month_expense, 2),
        "total_saved": round(total_saved, 2),
        "active_goals": len([g for g in goals if not g.is_completed]),
        "expense_count": len(
            [e for e in expenses if e.date and _month_str(e.date) == month]
        ),
    }


def category_spending(db: Session, user_id: int, month: str | None = None):
    if not month:
        month = _month_str(date.today())
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    data = {}
    for e in expenses:
        if e.date and _month_str(e.date) == month:
            data[e.category] = data.get(e.category, 0.0) + e.amount
    return [
        {"category": k, "amount": round(v, 2)} for k, v in data.items()
    ]


def monthly_trend(db: Session, user_id: int, months: int = 6):
    today = date.today()
    result = []
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    incomes = db.query(Income).filter(Income.user_id == user_id).all()

    # Build list of last N month strings
    year = today.year
    month = today.month
    month_keys = []
    for _ in range(months):
        month_keys.append(f"{year:04d}-{month:02d}")
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    month_keys.reverse()

    for mk in month_keys:
        exp = sum(e.amount for e in expenses if e.date and _month_str(e.date) == mk)
        inc = sum(i.amount for i in incomes if i.date and _month_str(i.date) == mk)
        result.append(
            {
                "month": mk,
                "income": round(inc, 2),
                "expense": round(exp, 2),
            }
        )
    return result
