from django.urls import include, path, re_path

from apps.core.views import not_found

urlpatterns = [
    path("api/", include("apps.core.urls")),
    path("api/v1/auth/", include("apps.auth.urls")),
    path("api/v1/users", include("apps.users.urls")),
    re_path(r"^.*$", not_found),  # JSON 404 for everything else
]
