from rest_framework import serializers

from .models import Role, User


class LowercaseEmailField(serializers.EmailField):
    def to_internal_value(self, data):
        return super().to_internal_value(data).lower()


def name_field(**kwargs):
    return serializers.CharField(min_length=2, max_length=50, **kwargs)


def password_field():
    return serializers.CharField(min_length=8, max_length=72, trim_whitespace=False)


class PageQuerySerializer(serializers.Serializer):
    page = serializers.IntegerField(min_value=1, default=1)
    limit = serializers.IntegerField(min_value=1, max_value=100, default=10)


class CreateUserSerializer(serializers.Serializer):
    name = name_field()
    email = LowercaseEmailField(max_length=255)
    password = password_field()
    role = serializers.ChoiceField(choices=Role.choices, default=Role.USER)


class UpdateUserSerializer(serializers.Serializer):
    name = name_field(required=False)
    email = LowercaseEmailField(max_length=255, required=False)
    role = serializers.ChoiceField(choices=Role.choices, required=False)


class UserSerializer(serializers.ModelSerializer):
    """Public representation; never includes password_hash."""

    createdAt = serializers.DateTimeField(source="created_at")
    updatedAt = serializers.DateTimeField(source="updated_at")

    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "createdAt", "updatedAt"]
