from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import hash_password
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordResetRequest,
    ForgotPasswordSendOTPRequest,
    ResendOTPRequest,
    SendRegisterOTPRequest,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
    VerifyRegisterOTPRequest,
)
from app.services.auth_service import (
    authenticate_user,
    create_user,
    get_user_by_email,
    issue_token,
)
from app.services.otp_service import create_and_send_otp, verify_otp


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register/send-otp")
def register_send_otp(data: SendRegisterOTPRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    existing = get_user_by_email(db, email)
    if existing and existing.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in.",
        )
    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    res = create_and_send_otp(db, email, purpose="register")
    return {
        "message": f"Verification code sent to {email}",
        "email": email,
        "dev_code": res.get("dev_code"),
    }


@router.post("/register/verify-otp", response_model=Token)
def register_verify_otp(data: VerifyRegisterOTPRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    if not verify_otp(db, email, data.otp_code, purpose="register"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please check your code or request a new one.",
        )

    existing = get_user_by_email(db, email)
    if existing:
        if existing.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This account is already registered and verified. Please log in.",
            )
        existing.name = data.name or existing.name
        existing.hashed_password = hash_password(data.password)
        existing.is_verified = True
        db.commit()
        db.refresh(existing)
        user = existing
    else:
        user = create_user(
            db,
            email=email,
            password=data.password,
            name=data.name or "Student",
            is_verified=True,
        )

    token = issue_token(user)
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/forgot-password/send-otp")
def forgot_password_send_otp(
    data: ForgotPasswordSendOTPRequest, db: Session = Depends(get_db)
):
    email = data.email.lower().strip()
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address.",
        )

    res = create_and_send_otp(db, email, purpose="forgot_password")
    return {
        "message": f"Password reset code sent to {email}",
        "email": email,
        "dev_code": res.get("dev_code"),
    }


@router.post("/forgot-password/verify-otp")
def forgot_password_verify_otp(
    data: ForgotPasswordResetRequest, db: Session = Depends(get_db)
):
    email = data.email.lower().strip()
    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long.",
        )

    if not verify_otp(db, email, data.otp_code, purpose="forgot_password"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code. Please check your code or request a new one.",
        )

    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    user.hashed_password = hash_password(data.new_password)
    user.is_verified = True
    db.commit()

    return {
        "message": "Password has been successfully reset. You can now log in with your new password."
    }


@router.post("/resend-otp")
def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    if data.purpose == "forgot_password":
        user = get_user_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email address.",
            )

    res = create_and_send_otp(db, email, purpose=data.purpose)
    return {
        "message": f"A new verification code has been sent to {email}",
        "email": email,
        "dev_code": res.get("dev_code"),
    }


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    email = user_data.email.lower().strip()
    if get_user_by_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = create_user(
        db,
        email=email,
        password=user_data.password,
        name=user_data.name or "Student",
        is_verified=True,
    )
    token = issue_token(user)
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email = credentials.email.lower().strip()
    user = authenticate_user(db, email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check email verification status
    if not getattr(user, "is_verified", True) and user.email.lower() != settings.ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your email has not been verified yet. Please complete verification to continue.",
        )

    token = issue_token(user)
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
