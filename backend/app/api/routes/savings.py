from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.savings import (
    DepositRequest,
    SavingsGoalCreate,
    SavingsGoalResponse,
    SavingsGoalUpdate,
)
from app.services import savings_service
from app.services.notification_service import create_notification


router = APIRouter(prefix="/api/savings", tags=["Savings Goals"])


@router.get("", response_model=list[SavingsGoalResponse])
def list_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return savings_service.list_goals(db, current_user.id)


@router.post("", response_model=SavingsGoalResponse, status_code=201)
def create_goal(
    data: SavingsGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return savings_service.create_goal(db, current_user.id, data)


@router.put("/{goal_id}", response_model=SavingsGoalResponse)
def update_goal(
    goal_id: int,
    data: SavingsGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = savings_service.get_goal(db, current_user.id, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return savings_service.update_goal(db, goal, data)


@router.post("/{goal_id}/deposit", response_model=SavingsGoalResponse)
def deposit(
    goal_id: int,
    data: DepositRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = savings_service.get_goal(db, current_user.id, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    was_completed = goal.is_completed
    updated = savings_service.deposit(db, goal, data.amount)
    if updated.is_completed and not was_completed:
        create_notification(
            db,
            current_user.id,
            "milestone",
            f"Goal reached: {updated.title}",
            f"Congratulations! You reached your savings goal of "
            f"{updated.target_amount}.",
        )
    return updated


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = savings_service.get_goal(db, current_user.id, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    savings_service.delete_goal(db, goal)
    return {"message": "Goal deleted"}
