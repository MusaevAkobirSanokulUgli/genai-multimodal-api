"""
MCP-inspired context session management routes.

Provides CRUD for context sessions, resources, tools, and prompt templates.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_context_manager
from app.models.schemas import (
    AddResourceRequest,
    AddToolRequest,
    ContextSession,
    CreateSessionRequest,
    RegisterPromptRequest,
    RenderPromptRequest,
)
from app.services.context_protocol import ContextManager

router = APIRouter(prefix="/context", tags=["context"])


@router.post("/sessions", response_model=ContextSession, summary="Create a context session")
async def create_session(
    request: CreateSessionRequest,
    manager: ContextManager = Depends(get_context_manager),
) -> ContextSession:
    return manager.create_session(resources=request.resources, tools=request.tools)


@router.get("/sessions", summary="List all active context sessions")
async def list_sessions(
    manager: ContextManager = Depends(get_context_manager),
) -> list[dict]:
    return manager.list_sessions()


@router.get(
    "/sessions/{session_id}",
    response_model=ContextSession,
    summary="Retrieve a context session",
)
async def get_session(
    session_id: str,
    manager: ContextManager = Depends(get_context_manager),
) -> ContextSession:
    session = manager.get_context(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/sessions/{session_id}", summary="Delete a context session")
async def delete_session(
    session_id: str,
    manager: ContextManager = Depends(get_context_manager),
) -> dict:
    if not manager.delete_session(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    return {"deleted": session_id}


@router.post(
    "/sessions/{session_id}/resources",
    summary="Add a resource to a session",
)
async def add_resource(
    session_id: str,
    request: AddResourceRequest,
    manager: ContextManager = Depends(get_context_manager),
) -> dict:
    if not manager.add_resource(session_id, request.resource):
        raise HTTPException(status_code=404, detail="Session not found")
    return {"added": request.resource.uri}


@router.post("/sessions/{session_id}/tools", summary="Add a tool to a session")
async def add_tool(
    session_id: str,
    request: AddToolRequest,
    manager: ContextManager = Depends(get_context_manager),
) -> dict:
    if not manager.add_tool(session_id, request.tool):
        raise HTTPException(status_code=404, detail="Session not found")
    return {"added": request.tool.name}


@router.post("/prompts", summary="Register a prompt template")
async def register_prompt(
    request: RegisterPromptRequest,
    manager: ContextManager = Depends(get_context_manager),
) -> dict:
    manager.register_prompt_template(
        request.name, request.template, request.description
    )
    return {"registered": request.name}


@router.get("/prompts", summary="List registered prompt templates")
async def list_prompts(
    manager: ContextManager = Depends(get_context_manager),
) -> list[dict]:
    return manager.list_prompts()


@router.post("/prompts/render", summary="Render a prompt template with variables")
async def render_prompt(
    request: RenderPromptRequest,
    manager: ContextManager = Depends(get_context_manager),
) -> dict:
    result = manager.render_prompt(request.name, request.variables)
    if result is None:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    return {"rendered": result}
