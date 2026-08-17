from contextvars import ContextVar
from dataclasses import dataclass, field


@dataclass
class UsageTotals:
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    call_count: int = 0


_usage_var: ContextVar[UsageTotals | None] = ContextVar("usage_totals", default=None)


def start_tracking() -> UsageTotals:
    totals = UsageTotals()
    _usage_var.set(totals)
    return totals


def record_usage(prompt_tokens: int, completion_tokens: int, total_tokens: int) -> None:
    totals = _usage_var.get()
    if totals is None:
        return
    totals.prompt_tokens += prompt_tokens
    totals.completion_tokens += completion_tokens
    totals.total_tokens += total_tokens
    totals.call_count += 1


def get_totals() -> UsageTotals | None:
    return _usage_var.get()
