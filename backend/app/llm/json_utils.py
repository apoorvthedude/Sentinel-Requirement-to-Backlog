import asyncio
import json
import logging

logger = logging.getLogger(__name__)


def strip_code_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return text.strip()


def parse_llm_json(raw_response: str, context: str) -> dict:
    cleaned = strip_code_fences(raw_response)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"{context} did not return valid JSON. Raw response: {raw_response!r}"
        ) from e


async def complete_json(
    client, prompt: str, context: str, retries: int = 1, overall_timeout: float = 45.0
) -> dict:
    return await _complete_json_with_call(
        lambda: client.complete(prompt), context, retries, overall_timeout
    )


async def complete_json_vision(
    client,
    prompt: str,
    image_urls: list[str],
    context: str,
    retries: int = 1,
    overall_timeout: float = 45.0,
) -> dict:
    return await _complete_json_with_call(
        lambda: client.complete_vision(prompt, image_urls), context, retries, overall_timeout
    )


async def _complete_json_with_call(call, context: str, retries: int, overall_timeout: float) -> dict:
    async def _run() -> dict:
        last_error = None
        for attempt in range(retries + 1):
            raw_response = await call()
            try:
                return parse_llm_json(raw_response, context=context)
            except ValueError as e:
                last_error = e
                logger.warning(
                    "%s returned malformed JSON on attempt %d/%d: %s",
                    context, attempt + 1, retries + 1, e,
                )
        raise last_error

    try:
        return await asyncio.wait_for(_run(), timeout=overall_timeout)
    except asyncio.TimeoutError as e:
        raise RuntimeError(
            f"{context} did not complete within {overall_timeout}s "
            f"(across {retries + 1} attempt(s) and fallback chain)"
        ) from e
