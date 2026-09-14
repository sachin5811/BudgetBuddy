from datetime import date as date_type
from typing import Optional

from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    category: str = "Miscellaneous"
    amount: float
    description: Optional[str] = ""
    date: Optional[date_type] = None


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date_type] = None


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    category: str
    amount: float
    description: Optional[str] = ""
    date: date_type

    class Config:
        from_attributes = True
