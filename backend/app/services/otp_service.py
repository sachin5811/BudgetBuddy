from datetime import datetime, timedelta, timezone
import secrets

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.otp import OTPVerification
from app.services.email_service import send_otp_email


def generate_otp() -> str:
    """Generate a secure 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000}"


def create_and_send_otp(db: Session, email: str, purpose: str = "register") -> dict:
    """
    Invalidates any pending OTPs for the email & purpose,
    creates a new OTP valid for 10 minutes, and sends an email.
    """
    clean_email = email.lower().strip()

    # Invalidate old unused OTPs for this email and purpose
    db.query(OTPVerification).filter(
        OTPVerification.email == clean_email,
        OTPVerification.purpose == purpose,
        OTPVerification.is_used == False,
    ).update({"is_used": True})
    db.commit()

    otp_code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    record = OTPVerification(
        email=clean_email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    sent = send_otp_email(clean_email, otp_code, purpose=purpose)

    # In development or if SMTP is not configured, return dev_code for testing
    dev_code = otp_code if (not settings.SMTP_HOST or not settings.SMTP_USER) else None

    return {
        "success": True,
        "email": clean_email,
        "email_sent": sent,
        "dev_code": dev_code,
    }


def verify_otp(db: Session, email: str, otp_code: str, purpose: str = "register") -> bool:
    """
    Validates that the OTP matches, is unused, and has not expired.
    If valid, marks it as used and commits to DB.
    """
    clean_email = email.lower().strip()
    clean_code = otp_code.strip()

    now = datetime.now(timezone.utc)

    record = (
        db.query(OTPVerification)
        .filter(
            OTPVerification.email == clean_email,
            OTPVerification.purpose == purpose,
            OTPVerification.is_used == False,
            OTPVerification.expires_at >= now,
        )
        .order_by(OTPVerification.id.desc())
        .first()
    )

    if not record or record.otp_code != clean_code:
        return False

    record.is_used = True
    db.commit()
    return True
