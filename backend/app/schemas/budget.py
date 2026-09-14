from typing import List, Optional

from pydantic import BaseModel


class BudgetItem(BaseModel):
    category: str
    allocated: float


class BudgetSet(BaseModel):
    month: str  # "YYYY-MM"
    items: List[BudgetItem]


class BudgetCategoryStatus(BaseModel):
    category: str
    allocated: float
    spent: float
    remaining: float
    utilization: float  # percentage
    status: str  # ok | warning | over


class BudgetOverview(BaseModel):
    month: str
    total_allocated: float
    total_spent: float
    categories: List[BudgetCategoryStatus]


class BudgetResponse(BaseModel):
    id: int
    user_id: int
    month: str
    category: str
    allocated: float

    class Config:
        from_attributes = True
