import pytest

from .conftest import ALICE, login

pytestmark = pytest.mark.django_db


def test_register_normalizes_and_sets_cookie(client):
    body = {**ALICE, "name": " Alice ", "email": " ALICE@example.com "}
    res = client.post("/api/v1/auth/register", body, format="json")
    assert res.status_code == 201
    user = res.json()["data"]["user"]
    assert (user["name"], user["email"], user["role"]) == ("Alice", ALICE["email"], "user")
    assert not any("password" in key for key in user)
    cookie = res.cookies["refresh_token"]
    assert cookie["httponly"] and cookie["path"] == "/"


def test_register_conflict_and_validation(client):
    client.post("/api/v1/auth/register", ALICE, format="json")
    dup = client.post("/api/v1/auth/register", ALICE, format="json")
    assert (dup.status_code, dup.json()["code"]) == (409, "EMAIL_EXISTS")
    bad = client.post("/api/v1/auth/register", {"email": "x", "password": "1"}, format="json")
    assert bad.status_code == 400
    assert "email" in bad.json()["details"]


def test_login_me_refresh_logout(client, member_token):
    _, wrong = login(client, ALICE["email"], "wrong-password")
    assert (wrong.status_code, wrong.json()["code"]) == (401, "INVALID_CREDENTIALS")

    me = client.get("/api/v1/auth/me", HTTP_AUTHORIZATION=f"Bearer {member_token}")
    assert me.json()["data"]["email"] == ALICE["email"]

    # APIClient keeps cookies from the last login.
    assert client.post("/api/v1/auth/refresh").status_code == 200
    assert client.post("/api/v1/auth/session").status_code == 200

    old_cookie = client.cookies["refresh_token"].value
    assert client.post("/api/v1/auth/logout").json()["data"] == {"success": True}
    client.cookies["refresh_token"] = old_cookie
    again = client.post("/api/v1/auth/refresh")
    assert (again.status_code, again.json()["code"]) == (401, "UNAUTHORIZED")


def test_me_requires_valid_token(client):
    assert client.get("/api/v1/auth/me").status_code == 401
    res = client.get("/api/v1/auth/me", HTTP_AUTHORIZATION="Bearer nope")
    assert (res.status_code, res.json()["code"]) == (401, "UNAUTHORIZED")
