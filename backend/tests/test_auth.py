import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] in ["online", "healthy"]

def test_register_and_login():
    email = "testrecruiter@example.com"
    password = "Password123!"

    # Register
    reg_data = {
        "name": "Test Recruiter",
        "email": email,
        "company": "Enterprise Corp",
        "password": password
    }
    reg_res = client.post("/api/auth/register", json=reg_data)
    assert reg_res.status_code in [200, 400] # 400 if already exists from previous run

    # Login
    login_data = {
        "email": email,
        "password": password
    }
    login_res = client.post("/api/auth/login", json=login_data)
    assert login_res.status_code == 200
    json_data = login_res.json()
    assert "access_token" in json_data
    assert json_data["email"] == email
