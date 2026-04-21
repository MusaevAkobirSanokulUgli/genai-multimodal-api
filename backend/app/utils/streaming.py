"""
Server-Sent Events (SSE) streaming utilities.

Wraps async text generators as SSE streams suitable for FastAPI
StreamingResponse with media_type="text/event-stream".
"""

import json
from collections.abc import AsyncGenerator


async def sse_stream(generator: AsyncGenerator[str, None]) -> AsyncGenerator[str, None]:
    """Wrap a token generator as SSE events.

    Each yielded string from the generator is sent as a JSON-encoded
    ``data:`` event.  A ``[DONE]`` sentinel is emitted at stream end.
    """
    async for chunk in generator:
        payload = json.dumps({"content": chunk})
        yield f"data: {payload}\n\n"
    yield "data: [DONE]\n\n"


async def sse_json_stream(
    generator: AsyncGenerator[dict, None],
) -> AsyncGenerator[str, None]:
    """Wrap a dict generator as SSE events for structured streaming."""
    async for item in generator:
        yield f"data: {json.dumps(item)}\n\n"
    yield "data: [DONE]\n\n"
