import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, HTTPException, status
from app.config import get_settings

settings = get_settings()

# In-memory store: IP address -> list of request epoch timestamps
_request_timestamps: Dict[str, List[float]] = defaultdict(list)


def check_rate_limit(request: Request) -> None:
    """
    Sliding-window rate limiter dependency.
    Prevents API quota exhaustion on resource-heavy routes (uploads, Gemini analysis).
    Returns HTTP 429 Too Many Requests if the IP exceeds the configured per-minute limit.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    window_seconds = 60.0

    # Retrieve existing timestamps and prune those outside the 60-second window
    history = _request_timestamps[client_ip]
    _request_timestamps[client_ip] = [ts for ts in history if now - ts < window_seconds]

    if len(_request_timestamps[client_ip]) >= settings.rate_limit_per_minute:
        retry_after = int(window_seconds - (now - _request_timestamps[client_ip][0])) + 1
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded ({settings.rate_limit_per_minute} req/min). Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(max(1, retry_after))},
        )

    # Record current request timestamp
    _request_timestamps[client_ip].append(now)


def reset_rate_limits() -> None:
    """Helper used in test suites to clear in-memory rate limit counters."""
    _request_timestamps.clear()
