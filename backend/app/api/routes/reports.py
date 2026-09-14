from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.services import report_service
from app.services.notification_service import create_notification


router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/pdf")
def download_pdf(
    month: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not month:
        month = date.today().strftime("%Y-%m")
    content = report_service.generate_pdf(db, current_user, month)
    create_notification(
        db,
        current_user.id,
        "report",
        "Report generated",
        f"Your PDF report for {month} was generated.",
    )
    return StreamingResponse(
        iter([content]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=budgetbuddy_{month}.pdf"
        },
    )


@router.get("/excel")
def download_excel(
    month: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not month:
        month = date.today().strftime("%Y-%m")
    content = report_service.generate_excel(db, current_user, month)
    return StreamingResponse(
        iter([content]),
        media_type=(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f"attachment; filename=budgetbuddy_{month}.xlsx"
            )
        },
    )
