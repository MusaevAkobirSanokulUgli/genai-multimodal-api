"""Tests for pipeline request validation and the transform step."""

import pytest

from app.models.schemas import PipelineRequest, PipelineStep, PipelineStepType
from app.services.pipeline_engine import PipelineEngine


# ------------------------------------------------------------------
# Schema validation
# ------------------------------------------------------------------


def test_pipeline_request_valid():
    req = PipelineRequest(
        name="test-pipeline",
        steps=[
            PipelineStep(
                step_type=PipelineStepType.TRANSFORM,
                config={"transform": "uppercase"},
            )
        ],
        initial_input={"text": "hello world"},
    )
    assert req.name == "test-pipeline"
    assert len(req.steps) == 1


def test_pipeline_request_empty_steps_raises():
    with pytest.raises(Exception):
        PipelineRequest(name="test", steps=[], initial_input={})


def test_pipeline_request_max_steps():
    steps = [
        PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "uppercase"})
        for _ in range(10)
    ]
    req = PipelineRequest(name="max", steps=steps)
    assert len(req.steps) == 10


def test_pipeline_request_too_many_steps_raises():
    steps = [
        PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "uppercase"})
        for _ in range(11)
    ]
    with pytest.raises(Exception):
        PipelineRequest(name="overflow", steps=steps)


def test_pipeline_step_defaults():
    step = PipelineStep(step_type=PipelineStepType.TRANSFORM)
    assert step.config == {}
    assert step.input_from is None


# ------------------------------------------------------------------
# Transform step (no external API calls)
# ------------------------------------------------------------------


@pytest.mark.asyncio
async def test_transform_uppercase():
    engine = PipelineEngine()
    req = PipelineRequest(
        name="uppercase-test",
        steps=[PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "uppercase"})],
        initial_input={"text": "hello"},
    )
    result = await engine.execute(req)
    assert result.status == "completed"
    assert result.final_output["text"] == "HELLO"


@pytest.mark.asyncio
async def test_transform_lowercase():
    engine = PipelineEngine()
    req = PipelineRequest(
        name="lowercase-test",
        steps=[PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "lowercase"})],
        initial_input={"text": "HELLO WORLD"},
    )
    result = await engine.execute(req)
    assert result.status == "completed"
    assert result.final_output["text"] == "hello world"


@pytest.mark.asyncio
async def test_transform_summarize_short():
    engine = PipelineEngine()
    req = PipelineRequest(
        name="summarize-short",
        steps=[PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "summarize"})],
        initial_input={"text": "Short text."},
    )
    result = await engine.execute(req)
    assert result.status == "completed"
    assert result.final_output["text"] == "Short text."


@pytest.mark.asyncio
async def test_transform_summarize_long():
    engine = PipelineEngine()
    long_text = "x " * 300  # > 500 chars
    req = PipelineRequest(
        name="summarize-long",
        steps=[PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "summarize"})],
        initial_input={"text": long_text},
    )
    result = await engine.execute(req)
    assert result.final_output["text"].endswith("...")


@pytest.mark.asyncio
async def test_transform_chained_steps():
    engine = PipelineEngine()
    req = PipelineRequest(
        name="chain-test",
        steps=[
            PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "uppercase"}),
            PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "lowercase"}),
        ],
        initial_input={"text": "Hello"},
    )
    result = await engine.execute(req)
    assert result.status == "completed"
    assert result.final_output["text"] == "hello"


@pytest.mark.asyncio
async def test_pipeline_step_results_populated():
    engine = PipelineEngine()
    req = PipelineRequest(
        name="steps-test",
        steps=[
            PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "uppercase"}),
            PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "lowercase"}),
        ],
        initial_input={"text": "hello"},
    )
    result = await engine.execute(req)
    assert len(result.steps) == 2
    assert result.steps[0].step_index == 0
    assert result.steps[1].step_index == 1


@pytest.mark.asyncio
async def test_pipeline_latency_recorded():
    engine = PipelineEngine()
    req = PipelineRequest(
        name="latency-test",
        steps=[PipelineStep(step_type=PipelineStepType.TRANSFORM, config={"transform": "title"})],
        initial_input={"text": "hello world"},
    )
    result = await engine.execute(req)
    assert result.total_latency_ms >= 0
    assert result.steps[0].latency_ms >= 0


# ------------------------------------------------------------------
# Moderation step (no external API)
# ------------------------------------------------------------------


@pytest.mark.asyncio
async def test_pipeline_moderate_safe():
    engine = PipelineEngine()
    req = PipelineRequest(
        name="moderate-safe",
        steps=[PipelineStep(step_type=PipelineStepType.MODERATE)],
        initial_input={"text": "This is a safe message."},
    )
    result = await engine.execute(req)
    assert result.status == "completed"
    assert "moderation" in result.final_output
    assert not result.final_output["moderation"]["flagged"]
