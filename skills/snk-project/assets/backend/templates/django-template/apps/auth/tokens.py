import hashlib
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import jwt
from django.conf import settings
from django.utils import timezone

from .models import RefreshToken


@dataclass(frozen=True)
class AccessClaims:
    user_id: str
    role: str
    is_authenticated: bool = True  # lets DRF's IsAuthenticated treat this as request.user


def sign_access_token(user_id: str, role: str) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + timedelta(seconds=settings.ACCESS_TOKEN_TTL),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def verify_access_token(token: str) -> AccessClaims | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    sub = payload.get("sub")
    return AccessClaims(user_id=sub, role=payload.get("role", "user")) if sub else None


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def issue_refresh_token(user_id) -> str:
    token = secrets.token_urlsafe(32)
    RefreshToken.objects.create(
        user_id=user_id,
        token_hash=_sha256(token),
        expires_at=timezone.now() + timedelta(seconds=settings.REFRESH_TOKEN_TTL),
    )
    return token


def resolve_refresh_token(token: str):
    """Returns the owner's user id for a non-expired token, otherwise None."""
    row = RefreshToken.objects.filter(
        token_hash=_sha256(token), expires_at__gt=timezone.now()
    ).first()
    return row.user_id if row else None


def revoke_refresh_token(token: str) -> None:
    RefreshToken.objects.filter(token_hash=_sha256(token)).delete()
