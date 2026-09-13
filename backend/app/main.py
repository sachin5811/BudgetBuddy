from fastapi import FastAPI

from app.database.database import Base, engine
from app.models.user import User

from app.api.routes.auth import router as auth_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="BudgetBuddy API",
    description="Personal Budget Planning and Expense Management Platform",
    version="1.0.0"
)


app.include_router(auth_router)


@app.get("/")
def root():

    return {
        "message": "BudgetBuddy API is running"
    }