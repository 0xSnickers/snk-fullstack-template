"""Settings for pytest: zero external dependencies (in-memory sqlite)."""

import os

os.environ.update(
    DJANGO_DEBUG="true",
    DJANGO_SECRET_KEY="test-secret",
    DATABASE_URL="sqlite://:memory:",
    JWT_SECRET="test-secret-test-secret-test-secret-123",
    SEED_DEMO_USER="false",
    LOG_LEVEL="WARNING",
    LOG_FILE="",
)

from .settings import *  # noqa: E402,F403

# Fast hashing in tests only.
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
