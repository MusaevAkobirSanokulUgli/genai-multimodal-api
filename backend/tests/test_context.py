"""Tests for the MCP-inspired context management system."""

import pytest

from app.models.schemas import ContextResource, ContextTool
from app.services.context_protocol import ContextManager


def make_resource(uri: str = "file:///docs/readme.md") -> ContextResource:
    return ContextResource(
        uri=uri,
        name="README",
        description="Project readme",
        mime_type="text/markdown",
        content="# Hello World\nThis is a test resource.",
    )


def make_tool(name: str = "search") -> ContextTool:
    return ContextTool(
        name=name,
        description="Search the knowledge base",
        parameters={"query": {"type": "string"}},
    )


# ------------------------------------------------------------------
# Session lifecycle
# ------------------------------------------------------------------


def test_create_session_has_id():
    manager = ContextManager()
    session = manager.create_session()
    assert session.id
    assert len(session.id) > 0


def test_create_session_empty_defaults():
    manager = ContextManager()
    session = manager.create_session()
    assert session.resources == []
    assert session.tools == []
    assert session.messages == []


def test_create_session_with_resources():
    manager = ContextManager()
    resource = make_resource()
    session = manager.create_session(resources=[resource])
    assert len(session.resources) == 1
    assert session.resources[0].uri == resource.uri


def test_get_context_returns_session():
    manager = ContextManager()
    session = manager.create_session()
    retrieved = manager.get_context(session.id)
    assert retrieved is not None
    assert retrieved.id == session.id


def test_get_context_missing_returns_none():
    manager = ContextManager()
    assert manager.get_context("nonexistent-id") is None


def test_delete_session():
    manager = ContextManager()
    session = manager.create_session()
    assert manager.delete_session(session.id)
    assert manager.get_context(session.id) is None


def test_delete_missing_session_returns_false():
    manager = ContextManager()
    assert not manager.delete_session("ghost")


# ------------------------------------------------------------------
# LRU eviction
# ------------------------------------------------------------------


def test_session_eviction_removes_oldest():
    manager = ContextManager(max_sessions=2)
    s1 = manager.create_session()
    s2 = manager.create_session()
    s3 = manager.create_session()  # should evict s1
    assert manager.get_context(s1.id) is None
    assert manager.get_context(s2.id) is not None
    assert manager.get_context(s3.id) is not None


def test_access_refreshes_lru():
    """Accessing s1 before s3 is created prevents s1 from being evicted."""
    manager = ContextManager(max_sessions=2)
    s1 = manager.create_session()
    s2 = manager.create_session()
    # Refresh s1 so s2 becomes oldest
    manager.get_context(s1.id)
    s3 = manager.create_session()  # evicts s2
    assert manager.get_context(s1.id) is not None
    assert manager.get_context(s2.id) is None
    assert manager.get_context(s3.id) is not None


# ------------------------------------------------------------------
# Resources
# ------------------------------------------------------------------


def test_add_resource():
    manager = ContextManager()
    session = manager.create_session()
    resource = make_resource()
    assert manager.add_resource(session.id, resource)
    ctx = manager.get_context(session.id)
    assert len(ctx.resources) == 1


def test_add_resource_upserts_same_uri():
    manager = ContextManager()
    session = manager.create_session()
    r1 = make_resource("file:///docs/a.md")
    r2 = ContextResource(
        uri="file:///docs/a.md",
        name="Updated",
        description="Updated",
        mime_type="text/markdown",
        content="New content",
    )
    manager.add_resource(session.id, r1)
    manager.add_resource(session.id, r2)
    ctx = manager.get_context(session.id)
    assert len(ctx.resources) == 1
    assert ctx.resources[0].name == "Updated"


def test_add_resource_missing_session():
    manager = ContextManager()
    assert not manager.add_resource("ghost", make_resource())


# ------------------------------------------------------------------
# Tools
# ------------------------------------------------------------------


def test_add_tool():
    manager = ContextManager()
    session = manager.create_session()
    tool = make_tool()
    assert manager.add_tool(session.id, tool)
    ctx = manager.get_context(session.id)
    assert len(ctx.tools) == 1


# ------------------------------------------------------------------
# Messages
# ------------------------------------------------------------------


def test_add_message():
    manager = ContextManager()
    session = manager.create_session()
    manager.add_message(session.id, {"role": "user", "content": "hi"})
    ctx = manager.get_context(session.id)
    assert len(ctx.messages) == 1


def test_message_ring_buffer():
    manager = ContextManager()
    session = manager.create_session()
    for i in range(60):
        manager.add_message(session.id, {"role": "user", "content": str(i)})
    ctx = manager.get_context(session.id)
    assert len(ctx.messages) == 50


# ------------------------------------------------------------------
# Prompt templates
# ------------------------------------------------------------------


def test_register_and_render_prompt():
    manager = ContextManager()
    manager.register_prompt_template("greet", "Hello, {name}!", "Greeting")
    result = manager.render_prompt("greet", {"name": "World"})
    assert result == "Hello, World!"


def test_render_missing_prompt_returns_none():
    manager = ContextManager()
    assert manager.render_prompt("ghost") is None


def test_render_prompt_missing_variable_raises():
    manager = ContextManager()
    manager.register_prompt_template("tmpl", "Hello, {name}!")
    with pytest.raises(ValueError):
        manager.render_prompt("tmpl", {})


def test_list_prompts():
    manager = ContextManager()
    manager.register_prompt_template("p1", "...", "desc1")
    manager.register_prompt_template("p2", "...", "desc2")
    prompts = manager.list_prompts()
    names = [p["name"] for p in prompts]
    assert "p1" in names
    assert "p2" in names


# ------------------------------------------------------------------
# Session listing
# ------------------------------------------------------------------


def test_list_sessions():
    manager = ContextManager()
    manager.create_session()
    manager.create_session()
    sessions = manager.list_sessions()
    assert len(sessions) == 2
    for s in sessions:
        assert "id" in s
        assert "resource_count" in s
