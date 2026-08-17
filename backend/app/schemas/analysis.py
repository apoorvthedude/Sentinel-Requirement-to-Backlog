import uuid

from pydantic import BaseModel, Field


class ExtractedRequirement(BaseModel):
    id: str
    title: str
    description: str
    actor: str | None = None
    related_screen: str | None = None


class AnalysisResult(BaseModel):
    input_id: uuid.UUID
    requirements: list[ExtractedRequirement] = Field(default_factory=list)
