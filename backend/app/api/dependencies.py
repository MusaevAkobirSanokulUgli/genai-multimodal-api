"""
FastAPI dependency providers.

Centralises access to shared app-state services so route handlers
don't reach into request.app.state directly.
"""

from fastapi import Request
from app.services.moderation import ModerationService
from app.services.context_protocol import ContextManager


def get_moderation(request: Request) -> ModerationService:
    return request.app.state.moderation


def get_context_manager(request: Request) -> ContextManager:
    return request.app.state.context_manager
