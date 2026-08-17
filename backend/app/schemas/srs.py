import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, Field


class SRSRequirementEntry(BaseModel):
    id: str
    title: str
    description: str
    actor: str | None = None
    related_screen: str | None = None
    dependencies: list[str] = Field(default_factory=list)


class SRSDocument(BaseModel):
    input_id: uuid.UUID
    title: str
    summary: str
    requirements: list[SRSRequirementEntry] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
