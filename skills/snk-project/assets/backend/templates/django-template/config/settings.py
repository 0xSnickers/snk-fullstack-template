"""Django settings. All environment-specific values come from env vars (.env supported)."""

import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    return int(os.getenv(name, str(default)))


def env_list(name: str, default: str = "") -> list[str]:
    return [v.strip() for v in os.getenv(name, default).split(",") if v.strip()]


DEBUG = env_bool("DJANGO_DEBUG")
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "insecure-dev-key" if DEBUG else "")
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "*")
PORT = env_int("PORT", 9000)

# ---- auth (see docs/API_CONTRACT.md) ----
JWT_SECRET = os.getenv("JWT_SECRET", "")
ACCESS_TOKEN_TTL = env_int("ACCESS_TOKEN_TTL", 900)
REFRESH_TOKEN_TTL = env_int("REFRESH_TOKEN_TTL", 604800)
COOKIE_SECURE = env_bool("COOKIE_SECURE")
SEED_DEMO_USER = env_bool("SEED_DEMO_USER")

if not SECRET_KEY:
    raise RuntimeError("DJANGO_SECRET_KEY is required when DJANGO_DEBUG is false")
if len(JWT_SECRET) < 32:
    raise RuntimeError("JWT_SECRET must be at least 32 characters")
if SEED_DEMO_USER and not DEBUG:
    raise RuntimeError("SEED_DEMO_USER must be false when DJANGO_DEBUG is false")

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "corsheaders",
    "rest_framework",
    "apps.core",
    "apps.users",
    "apps.auth",
]

MIDDLEWARE = [
    "apps.core.middleware.RequestIdMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
APPEND_SLASH = False

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}", conn_max_age=60
    )
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
USE_TZ = True
TIME_ZONE = "UTC"

CORS_ALLOWED_ORIGINS = env_list("CORS_ORIGINS")
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": ["apps.auth.authentication.BearerAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": [],
    "UNAUTHENTICATED_USER": None,
    "EXCEPTION_HANDLER": "apps.core.exceptions.exception_handler",
}

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_FILE = os.getenv("LOG_FILE", "logs/app.log")
_handlers = {"console": {"class": "logging.StreamHandler", "formatter": "default"}}
if LOG_FILE:
    (BASE_DIR / LOG_FILE).parent.mkdir(parents=True, exist_ok=True)
    _handlers["file"] = {
        "class": "logging.handlers.RotatingFileHandler",
        "filename": str(BASE_DIR / LOG_FILE),
        "maxBytes": 10 * 1024 * 1024,
        "backupCount": 5,
        "formatter": "default",
    }
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"default": {"format": "%(asctime)s %(levelname)s %(name)s %(message)s"}},
    "handlers": _handlers,
    "root": {"handlers": list(_handlers), "level": LOG_LEVEL},
}
