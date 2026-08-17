from langfuse import observe

from app.config import settings
from app.llm.client import LLMClient, build_default_llm_client
from app.llm.json_utils import complete_json
from app.llm.prompts.quality_scorer import build_quality_scorer_prompt, build_refinement_prompt
from app.schemas.analysis import ExtractedRequirement
from app.schemas.quality import QualityScore, RefinedRequirement


@observe(name="quality_scorer_agent")
async def score_requirement(
    requirement: ExtractedRequirement,
    llm_client: LLMClient | None = None,
    threshold: float | None = None,
) -> QualityScore:
    client = llm_client or build_default_llm_client()
    threshold = threshold if threshold is not None else settings.quality_score_threshold

    prompt = build_quality_scorer_prompt(requirement.title, requirement.description)
    parsed = await complete_json(client, prompt, context="Quality Scorer LLM")

    score = float(parsed["score"])
    return QualityScore(
        requirement_id=requirement.id,
        score=score,
        reasoning=parsed["reasoning"],
        flagged=score < threshold,
    )


@observe(name="quality_refiner_agent")
async def refine_requirement(
    requirement: ExtractedRequirement,
    quality_score: QualityScore,
    llm_client: LLMClient | None = None,
) -> RefinedRequirement:
    client = llm_client or build_default_llm_client()

    prompt = build_refinement_prompt(
        requirement.title, requirement.description, quality_score.reasoning
    )
    parsed = await complete_json(client, prompt, context="Quality Refiner LLM")

    return RefinedRequirement(
        requirement_id=requirement.id,
        original_description=requirement.description,
        refined_description=parsed["refined_description"],
    )
