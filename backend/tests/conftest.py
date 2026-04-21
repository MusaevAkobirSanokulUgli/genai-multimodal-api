"""
Shared pytest fixtures for the GenAI Multi-Modal API test suite.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from asgi_lifespan import LifespanManager

from app.main import app


@pytest.fixture
async def client() -> AsyncClient:
    async with LifespanManager(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac
