from datetime import date, datetime, timezone

from sqlalchemy import Column, Date, DateTime, Float, Integer, String

from app.database.database import Base


class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    source = Column(String, nullable=False, default="Pocket Money")
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True, default="")
    date = Column(Date, nullable=False, default=date.today)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
