import uuid

from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.auth.authentication import IsAdminForWrites
from apps.core.responses import ok, page_result

from . import services
from .serializers import (
    CreateUserSerializer,
    PageQuerySerializer,
    UpdateUserSerializer,
    UserSerializer,
)


def _parse_id(raw: str) -> uuid.UUID:
    try:
        return uuid.UUID(raw)
    except ValueError as exc:
        raise ValidationError({"id": ["Must be a valid UUID."]}) from exc


def _validated(serializer_class, data) -> dict:
    serializer = serializer_class(data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data


class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminForWrites]

    def get(self, request):
        query = _validated(PageQuerySerializer, request.query_params)
        users, total = services.list_users(query["page"], query["limit"])
        data = UserSerializer(users, many=True).data
        return ok(page_result(data, total, query["page"], query["limit"]))

    def post(self, request):
        user = services.create_user(**_validated(CreateUserSerializer, request.data))
        return ok(UserSerializer(user).data, status=201)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminForWrites]

    def get(self, request, user_id: str):
        return ok(UserSerializer(services.get_user(_parse_id(user_id))).data)

    def put(self, request, user_id: str):
        user_uuid = _parse_id(user_id)
        changes = _validated(UpdateUserSerializer, request.data)
        return ok(UserSerializer(services.update_user(user_uuid, changes)).data)

    def delete(self, request, user_id: str):
        return ok(services.delete_user(_parse_id(user_id)))
