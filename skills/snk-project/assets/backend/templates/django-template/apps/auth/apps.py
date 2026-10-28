from django.apps import AppConfig


class AuthConfig(AppConfig):
    name = "apps.auth"
    label = "authn"  # avoid clashing with django.contrib.auth's label
