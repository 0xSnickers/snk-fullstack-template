import pytest

pytestmark = pytest.mark.django_db


def auth(token: str) -> dict:
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


def test_requires_authentication(client):
    res = client.get("/api/v1/users")
    assert (res.status_code, res.json()["code"]) == (401, "UNAUTHORIZED")


def test_list_and_validation(client, member_token, admin_token):
    res = client.get("/api/v1/users", **auth(member_token))
    data = res.json()["data"]
    assert data["pagination"] == {"page": 1, "limit": 10, "total": 2, "totalPages": 1}
    assert client.get("/api/v1/users?limit=1000", **auth(member_token)).status_code == 400
    assert client.get("/api/v1/users/not-a-uuid", **auth(member_token)).status_code == 400


def test_only_admin_can_write(client, member_token, admin_token):
    body = {"name": "Carol", "email": "carol@example.com", "password": "password123"}
    forbidden = client.post("/api/v1/users", body, format="json", **auth(member_token))
    assert (forbidden.status_code, forbidden.json()["code"]) == (403, "FORBIDDEN")

    created = client.post("/api/v1/users", body, format="json", **auth(admin_token))
    assert created.status_code == 201
    url = f"/api/v1/users/{created.json()['data']['id']}"

    updated = client.put(url, {"role": "admin"}, format="json", **auth(admin_token))
    assert updated.json()["data"]["role"] == "admin"
    conflict = client.put(url, {"email": "alice@example.com"}, format="json", **auth(admin_token))
    assert conflict.json()["code"] == "EMAIL_EXISTS"

    assert client.delete(url, **auth(admin_token)).status_code == 200
    gone = client.get(url, **auth(admin_token))
    assert (gone.status_code, gone.json()["code"]) == (404, "USER_NOT_FOUND")
