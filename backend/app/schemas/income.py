from datetime import date as date_type
from typing import Optional

from pydantic import BaseModel


class IncomeCreate(BaseModel):
    source: str = "Pocket Money"
    amount: float
    description: Optional[str] = ""
    date: Optional[date_type] = None


class IncomeUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date_type] = None


class IncomeResponse(BaseModel):
    id: int
    user_id: int
    source: str
    amount: float
    description: Optional[str] = ""
    date: date_type

    class Config:
        from_attributes = True
