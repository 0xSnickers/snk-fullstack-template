import pytest
from rest_framework.test import APIClient

from apps.users.seed import DEMO_USER, seed_demo_user

ALICE = {"name": "Alice", "email": "alice@example.com", "password": "password123"}


@pytest.fixture
def client():
    return APIClient()


def login(client: APIClient, email: str, password: str):
    res = client.post("/api/v1/auth/login", {"email": email, "password": password}, format="json")
    token = res.json()["data"]["accessToken"] if res.status_code == 200 else None
    return token, res


@pytest.fixture
def member_token(client):
    client.post("/api/v1/auth/register", ALICE, format="json")
    return login(client, ALICE["email"], ALICE["password"])[0]


@pytest.fixture
def admin_token(client):
    seed_demo_user()
    return login(client, DEMO_USER["email"], DEMO_USER["password"])[0]
