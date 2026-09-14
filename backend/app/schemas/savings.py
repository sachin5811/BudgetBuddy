from datetime import date as date_type
from typing import Optional

from pydantic import BaseModel


class SavingsGoalCreate(BaseModel):
    title: str
    target_amount: float
    saved_amount: Optional[float] = 0.0
    deadline: Optional[date_type] = None


class SavingsGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    saved_amount: Optional[float] = None
    deadline: Optional[date_type] = None


class DepositRequest(BaseModel):
    amount: float


class SavingsGoalResponse(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    saved_amount: float
    deadline: Optional[date_type] = None
    is_completed: bool
    progress: float = 0.0

    class Config:
        from_attributes = True
