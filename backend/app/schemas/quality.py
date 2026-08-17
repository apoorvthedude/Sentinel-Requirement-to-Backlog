from pydantic import BaseModel


class QualityScore(BaseModel):
    requirement_id: str
    score: float
    reasoning: str
    flagged: bool


class RefinedRequirement(BaseModel):
    requirement_id: str
    original_description: str
    refined_description: str
