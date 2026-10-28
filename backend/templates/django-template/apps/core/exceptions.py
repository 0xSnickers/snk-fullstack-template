import logging
from http import HTTPStatus

from rest_framework import exceptions
from rest_framework.response import Response

from .messages import localize
from .responses import error_body

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Business error with a stable machine-readable code (see docs/API_CONTRACT.md)."""

    def __init__(self, code: str, message: str, status: int = 400, details=None):
        super().__init__(message)
        self.code, self.message, self.status, self.details = code, message, status, details

    @classmethod
    def unauthorized(cls, message: str = "Authentication required") -> "AppError":
        return cls("UNAUTHORIZED", message, 401)

    @classmethod
    def not_found(cls, code: str, message: str) -> "AppError":
        return cls(code, message, 404)

    @classmethod
    def conflict(cls, code: str, message: str) -> "AppError":
        return cls(code, message, 409)


def _to_app_error(exc, request) -> AppError:
    if isinstance(exc, AppError):
        return exc
    if isinstance(exc, exceptions.ValidationError):
        return AppError("VALIDATION_ERROR", "Invalid request parameters", 400, exc.detail)
    if isinstance(exc, exceptions.ParseError):
        return AppError(
            "VALIDATION_ERROR", "Invalid request parameters", 400, {"body": ["invalid JSON"]}
        )
    if isinstance(exc, exceptions.APIException):
        # NotAuthenticated / AuthenticationFailed -> UNAUTHORIZED, PermissionDenied -> FORBIDDEN ...
        return AppError(HTTPStatus(exc.status_code).name, str(exc.detail), exc.status_code)
    logger.exception("unhandled error request_id=%s", getattr(request, "request_id", None))
    return AppError("INTERNAL_ERROR", "Internal server error", 500)


def exception_handler(exc, context):
    request = context.get("request")
    err = _to_app_error(exc, request)
    language = request.headers.get("Accept-Language") if request else None
    message = localize(err.code, language, err.message)
    response = Response(error_body(err.code, message, err.details), status=err.status)
    if err.status == 401:
        response["WWW-Authenticate"] = "Bearer"
    return response
