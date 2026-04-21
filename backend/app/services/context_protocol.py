"""
Model Context Protocol (MCP) inspired context management.

Implements core MCP concepts:
- Resources: Contextual data (documents, files, embeddings) the model can reference.
- Tools: Capability descriptors the model can invoke.
- Sessions: Stateful conversation context with LRU eviction.
- Prompts: Reusable, parameterisable prompt templates.

This module does NOT depend on any external AI libraries so it can be
unit-tested in isolation.
"""

from uuid import uuid4
from datetime import datetime, timezone
from collections import OrderedDict
from app.models.schemas import ContextSession, ContextResource, ContextTool

_MAX_MESSAGES_PER_SESSION = 50


class ContextManager:
    """Manages model context sessions with LRU eviction."""

    def __init__(self, max_sessions: int = 100) -> None:
        self._sessions: OrderedDict[str, ContextSession] = OrderedDict()
        self._max_sessions = max_sessions
        self._prompt_templates: dict[str, dict] = {}

    # ------------------------------------------------------------------
    # Session lifecycle
    # ------------------------------------------------------------------

    def create_session(
        self,
        resources: list[ContextResource] | None = None,
        tools: list[ContextTool] | None = None,
    ) -> ContextSession:
        """Create a new context session, evicting the oldest if at capacity."""
        session_id = str(uuid4())

        while len(self._sessions) >= self._max_sessions:
            self._sessions.popitem(last=False)

        session = ContextSession(
            id=session_id,
            resources=resources or [],
            tools=tools or [],
            messages=[],
            created_at=datetime.now(timezone.utc),
        )
        self._sessions[session_id] = session
        return session

    def get_context(self, session_id: str) -> ContextSession | None:
        """Retrieve a session and bump its recency."""
        session = self._sessions.get(session_id)
        if session:
            self._sessions.move_to_end(session_id)
        return session

    def delete_session(self, session_id: str) -> bool:
        """Remove a session by ID. Returns True if it existed."""
        return self._sessions.pop(session_id, None) is not None

    def list_sessions(self) -> list[dict]:
        """Return lightweight summaries of all active sessions."""
        return [
            {
                "id": s.id,
                "resource_count": len(s.resources),
                "tool_count": len(s.tools),
                "message_count": len(s.messages),
                "created_at": s.created_at.isoformat(),
            }
            for s in self._sessions.values()
        ]

    # ------------------------------------------------------------------
    # Resource management
    # ------------------------------------------------------------------

    def add_resource(self, session_id: str, resource: ContextResource) -> bool:
        """Attach a resource to a session. Returns False if session not found."""
        session = self._sessions.get(session_id)
        if not session:
            return False
        # Replace if URI already present (upsert semantics)
        session.resources = [r for r in session.resources if r.uri != resource.uri]
        session.resources.append(resource)
        return True

    def remove_resource(self, session_id: str, uri: str) -> bool:
        session = self._sessions.get(session_id)
        if not session:
            return False
        before = len(session.resources)
        session.resources = [r for r in session.resources if r.uri != uri]
        return len(session.resources) < before

    # ------------------------------------------------------------------
    # Tool management
    # ------------------------------------------------------------------

    def add_tool(self, session_id: str, tool: ContextTool) -> bool:
        """Register a tool capability in a session."""
        session = self._sessions.get(session_id)
        if not session:
            return False
        session.tools = [t for t in session.tools if t.name != tool.name]
        session.tools.append(tool)
        return True

    # ------------------------------------------------------------------
    # Message history
    # ------------------------------------------------------------------

    def add_message(self, session_id: str, message: dict) -> bool:
        """Append a message to the session history (ring-buffer capped)."""
        session = self._sessions.get(session_id)
        if not session:
            return False
        session.messages.append(message)
        if len(session.messages) > _MAX_MESSAGES_PER_SESSION:
            session.messages = session.messages[-_MAX_MESSAGES_PER_SESSION:]
        return True

    # ------------------------------------------------------------------
    # Prompt templates
    # ------------------------------------------------------------------

    def register_prompt_template(
        self, name: str, template: str, description: str = ""
    ) -> None:
        """Register a reusable prompt template by name."""
        self._prompt_templates[name] = {
            "name": name,
            "template": template,
            "description": description,
        }

    def render_prompt(self, template_name: str, variables: dict | None = None) -> str | None:
        """Render a registered prompt template with variable substitution."""
        tmpl = self._prompt_templates.get(template_name)
        if not tmpl:
            return None
        try:
            return tmpl["template"].format(**(variables or {}))
        except KeyError as exc:
            raise ValueError(f"Missing template variable: {exc}") from exc

    def list_prompts(self) -> list[dict]:
        return [
            {"name": t["name"], "description": t["description"]}
            for t in self._prompt_templates.values()
        ]
