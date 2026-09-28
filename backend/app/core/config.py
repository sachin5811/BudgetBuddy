import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "dev-secret-change-me")
    JWT_ALGORITHM: str = os.environ.get("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "10080")
    )
    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL", "sqlite:///./budgetbuddy.db"
    )
    ADMIN_EMAIL: str = os.environ.get("ADMIN_EMAIL", "admin@budgetbuddy.com")
    ADMIN_PASSWORD: str = os.environ.get("ADMIN_PASSWORD", "admin123")
    CORS_ORIGINS: str = os.environ.get("CORS_ORIGINS", "*")

    # Brevo (formerly Sendinblue) REST API Configuration
    BREVO_API_KEY: str = os.environ.get("BREVO_API_KEY", "")
    BREVO_SENDER_EMAIL: str = os.environ.get("BREVO_SENDER_EMAIL", "")
    BREVO_SENDER_NAME: str = os.environ.get("BREVO_SENDER_NAME", "BudgetBuddy")

    # Optional SMTP Email Configuration (as backup)
    SMTP_HOST: str = os.environ.get("SMTP_HOST", "")
    SMTP_PORT: int = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER: str = os.environ.get("SMTP_USER", "")
    SMTP_PASSWORD: str = os.environ.get("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.environ.get("SMTP_FROM_EMAIL", "")
    SMTP_FROM_NAME: str = os.environ.get("SMTP_FROM_NAME", "BudgetBuddy")
    SMTP_TLS: bool = os.environ.get("SMTP_TLS", "true").lower() in ("true", "1", "yes")
    SMTP_SSL: bool = os.environ.get("SMTP_SSL", "false").lower() in ("true", "1", "yes")


settings = Settings()

EXPENSE_CATEGORIES = [
    "Food",
    "Travel",
    "Shopping",
    "Education",
    "Entertainment",
    "Miscellaneous",
]

INCOME_SOURCES = [
    "Pocket Money",
    "Scholarship",
    "Freelance",
    "Other",
]
