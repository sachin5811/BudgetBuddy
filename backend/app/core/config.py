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
