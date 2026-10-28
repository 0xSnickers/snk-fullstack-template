from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.core.exceptions import AppError
from apps.core.responses import ok
from apps.users import services as users
from apps.users.serializers import UserSerializer

from . import tokens
from .serializers import LoginSerializer, RegisterSerializer

COOKIE = "refresh_token"


def _session(user) -> dict:
    return {
        "user": UserSerializer(user).data,
        "accessToken": tokens.sign_access_token(user.id, user.role),
    }


def _with_cookie(user, status: int = 200):
    response = ok(_session(user), status=status)
    response.set_cookie(
        COOKIE,
        tokens.issue_refresh_token(user.id),
        max_age=settings.REFRESH_TOKEN_TTL,
        httponly=True,
        samesite="Lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return response


def _validated(serializer_class, data) -> dict:
    serializer = serializer_class(data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data


@api_view(["POST"])
@authentication_classes([])
def register(request):
    user = users.create_user(**_validated(RegisterSerializer, request.data))
    return _with_cookie(user, status=201)


@api_view(["POST"])
@authentication_classes([])
def login(request):
    data = _validated(LoginSerializer, request.data)
    user = users.verify_credentials(data["email"], data["password"])
    if user is None:
        raise AppError("INVALID_CREDENTIALS", "Invalid email or password", 401)
    return _with_cookie(user)


@api_view(["POST"])
@authentication_classes([])
def refresh(request):
    """Refresh tokens are not rotated so that the Next.js BFF /auth/session flow keeps working."""
    raw = request.COOKIES.get(COOKIE)
    user_id = tokens.resolve_refresh_token(raw) if raw else None
    if user_id is None:
        raise AppError.unauthorized("Session expired")
    return ok(_session(users.get_user(user_id)))


@api_view(["POST"])
@authentication_classes([])
def logout(request):
    raw = request.COOKIES.get(COOKIE)
    if raw:
        tokens.revoke_refresh_token(raw)
    response = ok({"success": True})
    response.delete_cookie(COOKIE, path="/", samesite="Lax")
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return ok(UserSerializer(users.get_user(request.user.user_id)).data)
