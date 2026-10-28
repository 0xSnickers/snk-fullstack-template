from django.contrib.auth.hashers import check_password, make_password

from apps.core.exceptions import AppError

from .models import Role, User


def list_users(page: int, limit: int) -> tuple[list[User], int]:
    qs = User.objects.all()
    offset = (page - 1) * limit
    return list(qs[offset : offset + limit]), qs.count()


def get_user(user_id) -> User:
    user = User.objects.filter(pk=user_id).first()
    if user is None:
        raise AppError.not_found("USER_NOT_FOUND", "User not found")
    return user


def _ensure_email_free(email: str, exclude_id=None) -> None:
    qs = User.objects.filter(email=email)
    if exclude_id is not None:
        qs = qs.exclude(pk=exclude_id)
    if qs.exists():
        raise AppError.conflict("EMAIL_EXISTS", "Email already in use")


def create_user(*, name: str, email: str, password: str, role: str = Role.USER) -> User:
    _ensure_email_free(email)
    return User.objects.create(
        name=name, email=email, role=role, password_hash=make_password(password)
    )


def update_user(user_id, changes: dict) -> User:
    user = get_user(user_id)
    if "email" in changes:
        _ensure_email_free(changes["email"], exclude_id=user.pk)
    for field, value in changes.items():
        setattr(user, field, value)
    user.save()
    return user


def delete_user(user_id) -> dict:
    get_user(user_id).delete()
    return {"id": str(user_id)}


def verify_credentials(email: str, password: str) -> User | None:
    user = User.objects.filter(email=email).first()
    return user if user and check_password(password, user.password_hash) else None
