import logging
import time
import uuid

logger = logging.getLogger("http")


class RequestIdMiddleware:
    """Propagates / generates X-Request-ID and writes one log line per request."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        start = time.perf_counter()
        response = self.get_response(request)
        response["X-Request-ID"] = request.request_id
        logger.info(
            "[%s] %s %s %s %.1fms",
            request.request_id,
            request.method,
            request.get_full_path(),
            response.status_code,
            (time.perf_counter() - start) * 1000,
        )
        return response
