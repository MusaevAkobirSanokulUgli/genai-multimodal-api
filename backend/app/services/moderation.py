"""
Content moderation service.

Implements a layered moderation pipeline:
1. Rule-based fast-path (regex pattern matching)
2. Heuristic scoring (length, density, sensitive keywords)
3. Extensible hook for OpenAI Moderation API in production

The service is intentionally async-safe and stateless so it can be shared
across concurrent requests without locks.
"""

import re
import asyncio
from app.models.schemas import ModerationResult, ContentCategory


class ModerationService:
    """Content moderation with rule-based and heuristic checking."""

    # Hard-block patterns — match indicates policy violation
    BLOCKED_PATTERNS: list[str] = [
        r"\b(hack|exploit|attack)\b.*\b(system|server|database)\b",
        r"\b(inject|bypass|override)\b.*\b(auth|security|firewall)\b",
        r"\b(malware|ransomware|trojan|rootkit)\b",
    ]

    # Soft-flag patterns — match adds to risk score
    FLAG_PATTERNS: list[tuple[str, str, float]] = [
        (r"\b(password|secret|credential|api[_\s]?key)\b", "sensitive_info", 0.6),
        (r"\b(ssn|social.?security|date.?of.?birth|credit.?card)\b", "pii", 0.65),
        (r"\b(kill|murder|harm|torture)\b", "violence", 0.55),
    ]

    def __init__(self, threshold: float = 0.5):
        self._threshold = threshold
        # Pre-compile for performance
        self._blocked = [re.compile(p, re.IGNORECASE) for p in self.BLOCKED_PATTERNS]
        self._flagged = [
            (re.compile(p, re.IGNORECASE), label, score)
            for p, label, score in self.FLAG_PATTERNS
        ]

    async def check(self, content: str) -> ModerationResult:
        """Evaluate a single piece of content and return a ModerationResult."""
        # --- Hard block ---
        for pattern in self._blocked:
            if pattern.search(content):
                return ModerationResult(
                    flagged=True,
                    category=ContentCategory.BLOCKED,
                    scores={"harmful_content": 0.97},
                    details="Content matched a blocked policy pattern.",
                )

        # --- Soft flag scoring ---
        scores: dict[str, float] = {}
        for pattern, label, score in self._flagged:
            if pattern.search(content):
                scores[label] = score

        # Heuristic: extremely long content is suspicious
        if len(content) > 50_000:
            scores["excessive_length"] = 0.4

        # Heuristic: high ratio of special characters may indicate injection
        special_ratio = sum(1 for c in content if not c.isalnum() and not c.isspace()) / max(
            len(content), 1
        )
        if special_ratio > 0.4:
            scores["high_special_char_ratio"] = round(special_ratio * 0.8, 3)

        flagged = any(v >= self._threshold for v in scores.values())

        return ModerationResult(
            flagged=flagged,
            category=ContentCategory.FLAGGED if flagged else ContentCategory.SAFE,
            scores=scores if scores else {"safe": 1.0},
        )

    async def check_batch(self, contents: list[str]) -> list[ModerationResult]:
        """Evaluate multiple contents concurrently."""
        return await asyncio.gather(*[self.check(c) for c in contents])
