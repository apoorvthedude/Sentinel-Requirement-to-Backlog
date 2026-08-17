import uuid
from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class InputType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    DOCUMENT = "document"


class NormalizedRequirementInput(BaseModel):
    input_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    input_type: InputType
    raw_content: str
    metadata: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
