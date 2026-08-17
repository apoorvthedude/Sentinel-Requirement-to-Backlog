from pydantic import BaseModel


class UsageStats(BaseModel):
    latency_seconds: float
    total_tokens: int
    prompt_tokens: int
    completion_tokens: int
    llm_call_count: int
