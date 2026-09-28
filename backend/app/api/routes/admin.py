from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.core.config import settings
from app.database.database import get_db
from app.models.expense import Expense
from app.models.savings_goal import SavingsGoal
from app.models.user import User
from app.schemas.auth import UserResponse


router = APIRouter(prefix="/api/admin", tags=["Admin"])


class RoleUpdate(BaseModel):
    role: str


@router.get("/stats")
def stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_expenses = db.query(Expense).count()
    total_goals = db.query(SavingsGoal).count()
    total_spent = sum(e.amount for e in db.query(Expense).all())
    by_role = {}
    for u in db.query(User).all():
        by_role[u.role] = by_role.get(u.role, 0) + 1
    return {
        "total_users": total_users,
        "total_expenses": total_expenses,
        "total_goals": total_goals,
        "total_spent": round(total_spent, 2),
        "users_by_role": by_role,
    }


@router.get("/users", response_model=list[UserResponse])
def list_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(User).order_by(User.id.asc()).all()


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_role(
    user_id: int,
    data: RoleUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if data.role not in ["student", "premium", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "admin" and data.role != "admin":
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count <= 1 and user.email.lower() != settings.ADMIN_EMAIL.lower():
            raise HTTPException(
                status_code=400,
                detail="Cannot demote the last administrator. Promote another user to admin first.",
            )

    user.role = data.role
    db.commit()
    db.refresh(user)
    return user
