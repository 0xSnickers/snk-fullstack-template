FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:0.7 /uv /usr/local/bin/uv
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY . .
EXPOSE 9000
CMD ["sh", "-c", "uv run --no-dev python manage.py migrate --noinput && uv run --no-dev gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-9000} --workers 2"]
