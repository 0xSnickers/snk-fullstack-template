from django.db import connection
from rest_framework.decorators import api_view, authentication_classes

from .exceptions import AppError
from .responses import ok


@api_view(["GET"])
@authentication_classes([])
def health(request):
    return ok({"status": "ok"})


@api_view(["GET"])
@authentication_classes([])
def ready(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as exc:
        raise AppError("NOT_READY", "Database is not reachable", 503) from exc
    return ok({"status": "ready"})


@api_view(["GET", "POST", "PUT", "PATCH", "DELETE"])
@authentication_classes([])
def not_found(request, *args, **kwargs):
    raise AppError("NOT_FOUND", f"Route {request.method} {request.path} not found", 404)
