from rest_framework.response import Response


def ok(data=None, status: int = 200) -> Response:
    return Response({"code": 0, "message": "success", "data": data}, status=status)


def error_body(code: str, message: str, details=None) -> dict:
    body = {"code": code, "message": message, "data": None}
    if details is not None:
        body["details"] = details
    return body


def page_result(items: list, total: int, page: int, limit: int) -> dict:
    return {
        "items": items,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit,
        },
    }
