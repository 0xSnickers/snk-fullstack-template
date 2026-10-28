from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .tokens import verify_access_token


class BearerAuthentication(BaseAuthentication):
    """`Authorization: Bearer <accessToken>` -> request.user = AccessClaims."""

    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        if not header:
            return None
        if not header.startswith("Bearer "):
            raise AuthenticationFailed("Authentication required")
        claims = verify_access_token(header[7:])
        if claims is None:
            raise AuthenticationFailed("Authentication required")
        return claims, None

    def authenticate_header(self, request):
        return "Bearer"  # makes DRF answer 401 instead of 403 when unauthenticated


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "role", None) == "admin"


class IsAdminForWrites(BasePermission):
    """Read for any authenticated user, write for admins only."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or IsAdmin().has_permission(request, view)
