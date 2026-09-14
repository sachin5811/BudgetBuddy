from sqlalchemy.orm import Session

from app.models.savings_goal import SavingsGoal
from app.schemas.savings import SavingsGoalCreate, SavingsGoalUpdate


def _with_progress(goal: SavingsGoal):
    progress = 0.0
    if goal.target_amount > 0:
        progress = min(goal.saved_amount / goal.target_amount * 100, 100)
    goal.progress = round(progress, 1)
    return goal


def list_goals(db: Session, user_id: int):
    goals = (
        db.query(SavingsGoal)
        .filter(SavingsGoal.user_id == user_id)
        .order_by(SavingsGoal.id.desc())
        .all()
    )
    return [_with_progress(g) for g in goals]


def create_goal(db: Session, user_id: int, data: SavingsGoalCreate):
    goal = SavingsGoal(
        user_id=user_id,
        title=data.title,
        target_amount=data.target_amount,
        saved_amount=data.saved_amount or 0.0,
        deadline=data.deadline,
        is_completed=(data.saved_amount or 0.0) >= data.target_amount,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _with_progress(goal)


def get_goal(db: Session, user_id: int, goal_id: int):
    return (
        db.query(SavingsGoal)
        .filter(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id)
        .first()
    )


def update_goal(db: Session, goal: SavingsGoal, data: SavingsGoalUpdate):
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(goal, key, value)
    goal.is_completed = goal.saved_amount >= goal.target_amount
    db.commit()
    db.refresh(goal)
    return _with_progress(goal)


def deposit(db: Session, goal: SavingsGoal, amount: float):
    goal.saved_amount += amount
    goal.is_completed = goal.saved_amount >= goal.target_amount
    db.commit()
    db.refresh(goal)
    return _with_progress(goal)


def delete_goal(db: Session, goal: SavingsGoal):
    db.delete(goal)
    db.commit()
