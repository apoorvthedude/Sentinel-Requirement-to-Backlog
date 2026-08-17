import uuid
from typing import Literal

from pydantic import BaseModel


class DependencyMatch(BaseModel):
    matched_requirement_id: str
    matched_input_id: uuid.UUID
    matched_title: str
    similarity_score: float
    confirmed: bool = False
    match_source: Literal["embedding", "structural"] = "embedding"


class RequirementDependencyResult(BaseModel):
    requirement_id: str
    flagged_matches: list[DependencyMatch] = []
