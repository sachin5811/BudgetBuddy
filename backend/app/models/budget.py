from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String

from app.database.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    month = Column(String, nullable=False)  # "YYYY-MM"
    category = Column(String, nullable=False)
    allocated = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
