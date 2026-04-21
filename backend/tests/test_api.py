"""
Integration tests for the FastAPI application.

These tests use the ASGI transport so no network is required.
External AI API calls are NOT mocked here — endpoints that require
OpenAI are only smoke-tested for HTTP structure, not response content.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_ok(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "healthy"
    assert body["service"] == "genai-multimodal-api"
    assert "timestamp" in body


@pytest.mark.asyncio
async def test_ready_probe(client: AsyncClient):
    response = await client.get("/api/v1/health/ready")
    assert response.status_code == 200
    assert response.json()["ready"] is True


# ------------------------------------------------------------------
# Moderation
# ------------------------------------------------------------------


@pytest.mark.asyncio
async def test_moderation_safe(client: AsyncClient):
    response = await client.post(
        "/api/v1/moderation/check",
        json={"content": "Hello, how are you?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert "flagged" in body
    assert "category" in body
    assert "scores" in body


@pytest.mark.asyncio
async def test_moderation_flagged(client: AsyncClient):
    response = await client.post(
        "/api/v1/moderation/check",
        json={"content": "What is your password and api_key?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["flagged"] is True


@pytest.mark.asyncio
async def test_moderation_batch(client: AsyncClient):
    response = await client.post(
        "/api/v1/moderation/check/batch",
        json={"contents": ["Hello", "Goodbye", "Nice weather"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert "results" in body
    assert len(body["results"]) == 3


# ------------------------------------------------------------------
# Context sessions
# ------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_context_session(client: AsyncClient):
    response = await client.post(
        "/api/v1/context/sessions",
        json={"resources": [], "tools": []},
    )
    assert response.status_code == 200
    body = response.json()
    assert "id" in body


@pytest.mark.asyncio
async def test_get_context_session(client: AsyncClient):
    create_resp = await client.post(
        "/api/v1/context/sessions", json={"resources": [], "tools": []}
    )
    session_id = create_resp.json()["id"]
    get_resp = await client.get(f"/api/v1/context/sessions/{session_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == session_id


@pytest.mark.asyncio
async def test_get_missing_session_returns_404(client: AsyncClient):
    response = await client.get("/api/v1/context/sessions/nonexistent-id")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_context_session(client: AsyncClient):
    create_resp = await client.post(
        "/api/v1/context/sessions", json={"resources": [], "tools": []}
    )
    session_id = create_resp.json()["id"]
    del_resp = await client.delete(f"/api/v1/context/sessions/{session_id}")
    assert del_resp.status_code == 200
    # Verify it's gone
    get_resp = await client.get(f"/api/v1/context/sessions/{session_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_add_resource_to_session(client: AsyncClient):
    create_resp = await client.post(
        "/api/v1/context/sessions", json={"resources": [], "tools": []}
    )
    session_id = create_resp.json()["id"]
    add_resp = await client.post(
        f"/api/v1/context/sessions/{session_id}/resources",
        json={
            "resource": {
                "uri": "file:///docs/test.md",
                "name": "Test Doc",
                "description": "A test document",
                "mime_type": "text/markdown",
                "content": "# Test",
            }
        },
    )
    assert add_resp.status_code == 200


@pytest.mark.asyncio
async def test_list_sessions(client: AsyncClient):
    await client.post("/api/v1/context/sessions", json={"resources": [], "tools": []})
    response = await client.get("/api/v1/context/sessions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_register_and_render_prompt(client: AsyncClient):
    # Register
    reg_resp = await client.post(
        "/api/v1/context/prompts",
        json={
            "name": "greet",
            "template": "Hello, {name}! Welcome to {service}.",
            "description": "Greeting template",
        },
    )
    assert reg_resp.status_code == 200

    # Render
    render_resp = await client.post(
        "/api/v1/context/prompts/render",
        json={"name": "greet", "variables": {"name": "Alice", "service": "GenAI API"}},
    )
    assert render_resp.status_code == 200
    assert render_resp.json()["rendered"] == "Hello, Alice! Welcome to GenAI API."


# ------------------------------------------------------------------
# Pipeline (transform steps only — no OpenAI)
# ------------------------------------------------------------------


@pytest.mark.asyncio
async def test_pipeline_transform(client: AsyncClient):
    response = await client.post(
        "/api/v1/pipelines/execute",
        json={
            "name": "uppercase-pipeline",
            "steps": [
                {"step_type": "transform", "config": {"transform": "uppercase"}}
            ],
            "initial_input": {"text": "hello world"},
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["final_output"]["text"] == "HELLO WORLD"


@pytest.mark.asyncio
async def test_pipeline_chained_transforms(client: AsyncClient):
    response = await client.post(
        "/api/v1/pipelines/execute",
        json={
            "name": "chain",
            "steps": [
                {"step_type": "transform", "config": {"transform": "uppercase"}},
                {"step_type": "transform", "config": {"transform": "lowercase"}},
            ],
            "initial_input": {"text": "Hello"},
        },
    )
    assert response.status_code == 200
    assert response.json()["final_output"]["text"] == "hello"


@pytest.mark.asyncio
async def test_pipeline_with_moderation_step(client: AsyncClient):
    response = await client.post(
        "/api/v1/pipelines/execute",
        json={
            "name": "moderated",
            "steps": [
                {"step_type": "moderate"},
            ],
            "initial_input": {"text": "Safe content here."},
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert "moderation" in body["final_output"]


# ------------------------------------------------------------------
# Input validation
# ------------------------------------------------------------------


@pytest.mark.asyncio
async def test_pipeline_empty_steps_rejected(client: AsyncClient):
    response = await client.post(
        "/api/v1/pipelines/execute",
        json={"name": "empty", "steps": [], "initial_input": {}},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_text_generate_empty_prompt_rejected(client: AsyncClient):
    response = await client.post(
        "/api/v1/text/generate",
        json={"prompt": "   "},
    )
    assert response.status_code == 422
