from rest_framework import serializers

from apps.users.serializers import LowercaseEmailField, name_field, password_field


class RegisterSerializer(serializers.Serializer):
    name = name_field()
    email = LowercaseEmailField(max_length=255)
    password = password_field()


class LoginSerializer(serializers.Serializer):
    """Password rules are not enforced here, so a wrong password yields INVALID_CREDENTIALS."""

    email = LowercaseEmailField(max_length=255)
    password = serializers.CharField(trim_whitespace=False)
