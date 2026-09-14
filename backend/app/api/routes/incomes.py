from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.income import IncomeCreate, IncomeResponse, IncomeUpdate
from app.services import income_service


router = APIRouter(prefix="/api/incomes", tags=["Income"])


@router.get("", response_model=list[IncomeResponse])
def list_incomes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return income_service.list_incomes(db, current_user.id)


@router.post("", response_model=IncomeResponse, status_code=201)
def create_income(
    data: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return income_service.create_income(db, current_user.id, data)


@router.put("/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: int,
    data: IncomeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    income = income_service.get_income(db, current_user.id, income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    return income_service.update_income(db, income, data)


@router.delete("/{income_id}")
def delete_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    income = income_service.get_income(db, current_user.id, income_id)
    if not income:
        raise HTTPException(status_code=404, detail="Income not found")
    income_service.delete_income(db, income)
    return {"message": "Income deleted"}
