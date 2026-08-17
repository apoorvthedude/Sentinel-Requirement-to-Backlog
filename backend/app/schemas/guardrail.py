from typing import Literal

from pydantic import BaseModel


class GuardrailResult(BaseModel):
    passed: bool
    reason: str
    category: Literal["quality", "safety"] | None = None
