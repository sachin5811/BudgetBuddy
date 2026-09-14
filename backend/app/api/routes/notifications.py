from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services import notification_service


router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return notification_service.list_notifications(db, current_user.id)


@router.post("/{notif_id}/read", response_model=NotificationResponse)
def mark_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = notification_service.get_notification(db, current_user.id, notif_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification_service.mark_read(db, notif)


@router.post("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification_service.mark_all_read(db, current_user.id)
    return {"message": "All notifications marked read"}
