from datetime import date, datetime, timezone

from sqlalchemy import Column, Date, DateTime, Float, Integer, String

from app.database.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    category = Column(String, nullable=False, default="Miscellaneous")
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True, default="")
    date = Column(Date, nullable=False, default=date.today)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
