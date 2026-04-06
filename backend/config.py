from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BASE_DIR / ".env")


def _parse_csv(value: str, *, default: list[str]) -> list[str]:
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


def _resolve_database_url(raw_value: str | None) -> str:
    value = (raw_value or "").strip() or "sqlite:///./backend/healthmate.db"

    if not value.startswith("sqlite:///"):
        return value

    sqlite_path = value.removeprefix("sqlite:///")
    sqlite_file = Path(sqlite_path)
    if sqlite_file.is_absolute():
        return f"sqlite:///{sqlite_file.as_posix()}"

    normalized = (PROJECT_ROOT / sqlite_file).resolve()
    normalized.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{normalized.as_posix()}"


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_version: str
    debug: bool
    database_url: str
    cors_allow_origins: list[str]
    jwt_secret_key: str
    jwt_algorithm: str
    jwt_expire_minutes: int
    gemini_api_key: str | None


@lru_cache
def get_settings() -> Settings:
    cors_origins = _parse_csv(
        os.getenv("CORS_ALLOW_ORIGINS", ""),
        default=["http://localhost:5173", "http://127.0.0.1:5173"],
    )

    return Settings(
        app_name=os.getenv("APP_NAME", "HealthMate API"),
        app_version=os.getenv("APP_VERSION", "1.0.0"),
        debug=os.getenv("DEBUG", "false").strip().lower() == "true",
        database_url=_resolve_database_url(os.getenv("DATABASE_URL")),
        cors_allow_origins=cors_origins or ["*"],
        jwt_secret_key=os.getenv("JWT_SECRET_KEY", "change-this-in-production"),
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        jwt_expire_minutes=int(os.getenv("JWT_EXPIRE_MINUTES", "60")),
        gemini_api_key=os.getenv("GEMINI_API_KEY"),
    )


@lru_cache
def get_gemini_api_key() -> str:
    api_key = get_settings().gemini_api_key
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set.")
    return api_key
