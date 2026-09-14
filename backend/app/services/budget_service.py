from sqlalchemy.orm import Session

from app.models.budget import Budget
from app.models.expense import Expense
from app.schemas.budget import (
    BudgetCategoryStatus,
    BudgetOverview,
    BudgetSet,
)


def set_budget(db: Session, user_id: int, data: BudgetSet):
    for item in data.items:
        existing = (
            db.query(Budget)
            .filter(
                Budget.user_id == user_id,
                Budget.month == data.month,
                Budget.category == item.category,
            )
            .first()
        )
        if existing:
            existing.allocated = item.allocated
        else:
            db.add(
                Budget(
                    user_id=user_id,
                    month=data.month,
                    category=item.category,
                    allocated=item.allocated,
                )
            )
    db.commit()
    return get_overview(db, user_id, data.month)


def _spent_by_category(db: Session, user_id: int, month: str):
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    spent = {}
    for e in expenses:
        if e.date and e.date.strftime("%Y-%m") == month:
            spent[e.category] = spent.get(e.category, 0.0) + e.amount
    return spent


def get_overview(db: Session, user_id: int, month: str) -> BudgetOverview:
    budgets = (
        db.query(Budget)
        .filter(Budget.user_id == user_id, Budget.month == month)
        .all()
    )
    spent_map = _spent_by_category(db, user_id, month)

    categories = []
    total_allocated = 0.0
    total_spent = 0.0

    seen = set()
    for b in budgets:
        seen.add(b.category)
        spent = spent_map.get(b.category, 0.0)
        allocated = b.allocated
        remaining = allocated - spent
        utilization = (spent / allocated * 100) if allocated > 0 else 0.0
        if utilization >= 100:
            statuslabel = "over"
        elif utilization >= 75:
            statuslabel = "warning"
        else:
            statuslabel = "ok"
        total_allocated += allocated
        total_spent += spent
        categories.append(
            BudgetCategoryStatus(
                category=b.category,
                allocated=allocated,
                spent=spent,
                remaining=remaining,
                utilization=round(utilization, 1),
                status=statuslabel,
            )
        )

    # Include categories that have spending but no budget set
    for cat, spent in spent_map.items():
        if cat not in seen:
            total_spent += spent
            categories.append(
                BudgetCategoryStatus(
                    category=cat,
                    allocated=0.0,
                    spent=spent,
                    remaining=-spent,
                    utilization=100.0,
                    status="over" if spent > 0 else "ok",
                )
            )

    return BudgetOverview(
        month=month,
        total_allocated=round(total_allocated, 2),
        total_spent=round(total_spent, 2),
        categories=categories,
    )
