from django.urls import path

from . import views

urlpatterns = [
    path("register", views.register),
    path("login", views.login),
    path("refresh", views.refresh),
    path("session", views.refresh),
    path("logout", views.logout),
    path("me", views.me),
]
