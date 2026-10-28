import pytest

pytestmark = pytest.mark.django_db


def test_health_echoes_request_id(client):
    res = client.get("/api/health", HTTP_X_REQUEST_ID="abc")
    assert res.json() == {"code": 0, "message": "success", "data": {"status": "ok"}}
    assert res["X-Request-ID"] == "abc"


def test_ready(client):
    assert client.get("/api/ready").json()["data"] == {"status": "ready"}


def test_unknown_route(client):
    res = client.get("/api/v1/nope")
    assert res.status_code == 404
    assert res.json()["code"] == "NOT_FOUND"
    assert res.json()["data"] is None


def test_malformed_json(client):
    res = client.post("/api/v1/auth/login", "{bad", content_type="application/json")
    assert res.status_code == 400
    assert res.json()["code"] == "VALIDATION_ERROR"


def test_localized_message(client):
    zh = client.get("/api/v1/nope", HTTP_ACCEPT_LANGUAGE="zh-CN,zh;q=0.9")
    assert zh.json()["message"] == "接口不存在"
    en = client.get("/api/v1/nope", HTTP_ACCEPT_LANGUAGE="en-US")
    assert en.json()["message"] == "Resource not found"
