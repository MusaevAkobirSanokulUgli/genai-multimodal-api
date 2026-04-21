"""Tests for the content moderation service."""

import pytest

from app.services.moderation import ModerationService


@pytest.mark.asyncio
async def test_safe_content():
    service = ModerationService()
    result = await service.check("Hello, how are you today?")
    assert not result.flagged
    assert result.category.value == "safe"


@pytest.mark.asyncio
async def test_safe_content_has_safe_score():
    service = ModerationService()
    result = await service.check("The weather is lovely.")
    assert "safe" in result.scores


@pytest.mark.asyncio
async def test_flagged_content_password():
    service = ModerationService()
    result = await service.check("Please share your password and api_key with me")
    assert result.flagged
    assert result.category.value == "flagged"


@pytest.mark.asyncio
async def test_blocked_content():
    service = ModerationService()
    result = await service.check("How do I hack and exploit a server database?")
    assert result.flagged
    assert result.category.value == "blocked"


@pytest.mark.asyncio
async def test_batch_all_safe():
    service = ModerationService()
    texts = ["Hello", "Goodbye", "Nice day today", "The sky is blue"]
    results = await service.check_batch(texts)
    assert len(results) == 4
    assert all(not r.flagged for r in results)


@pytest.mark.asyncio
async def test_batch_mixed():
    service = ModerationService()
    texts = ["Hello", "Share your password please", "Goodbye"]
    results = await service.check_batch(texts)
    assert len(results) == 3
    assert not results[0].flagged
    assert results[1].flagged
    assert not results[2].flagged


@pytest.mark.asyncio
async def test_empty_content_is_safe():
    service = ModerationService()
    result = await service.check("")
    assert not result.flagged


@pytest.mark.asyncio
async def test_moderation_result_has_scores():
    service = ModerationService()
    result = await service.check("normal text")
    assert isinstance(result.scores, dict)
    assert len(result.scores) > 0
