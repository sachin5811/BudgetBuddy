from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.database import Base, SessionLocal, engine

# Import all models so tables are registered before create_all
from app.models.user import User  # noqa: F401
from app.models.income import Income  # noqa: F401
from app.models.expense import Expense  # noqa: F401
from app.models.budget import Budget  # noqa: F401
from app.models.savings_goal import SavingsGoal  # noqa: F401
from app.models.notification import Notification  # noqa: F401

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.incomes import router as incomes_router
from app.api.routes.expenses import router as expenses_router
from app.api.routes.budgets import router as budgets_router
from app.api.routes.savings import router as savings_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.reports import router as reports_router
from app.api.routes.admin import router as admin_router
from app.services.auth_service import seed_admin


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="BudgetBuddy API",
    description="Personal Budget Planning and Expense Management Platform",
    version="1.0.0",
)


origins = (
    ["*"]
    if settings.CORS_ORIGINS.strip() == "*"
    else [o.strip() for o in settings.CORS_ORIGINS.split(",")]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(incomes_router)
app.include_router(expenses_router)
app.include_router(budgets_router)
app.include_router(savings_router)
app.include_router(notifications_router)
app.include_router(analytics_router)
app.include_router(reports_router)
app.include_router(admin_router)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "BudgetBuddy API"}


@app.get("/")
def root():
    return {"message": "BudgetBuddy API is running"}
