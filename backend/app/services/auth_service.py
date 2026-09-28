from datetime import timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(
    db: Session,
    email: str,
    password: str,
    name: str = "Student",
    role: str = "student",
):
    user = User(
        name=name or "Student",
        email=email,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def issue_token(user: User) -> str:
    return create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def seed_admin(db: Session):
    admin = get_user_by_email(db, settings.ADMIN_EMAIL)
    if admin is None:
        create_user(
            db,
            email=settings.ADMIN_EMAIL,
            password=settings.ADMIN_PASSWORD,
            name="Admin",
            role="admin",
        )
    elif not verify_password(settings.ADMIN_PASSWORD, admin.hashed_password):
        admin.hashed_password = hash_password(settings.ADMIN_PASSWORD)
        db.commit()
