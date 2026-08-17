from langfuse import observe

from app.llm.client import LLMClient, build_default_llm_client
from app.llm.json_utils import complete_json
from app.llm.prompts.srs_generator import build_srs_prompt
from app.schemas.analysis import AnalysisResult
from app.schemas.srs import SRSDocument, SRSRequirementEntry


@observe(name="srs_generator_agent")
async def generate_srs(
    analysis: AnalysisResult,
    llm_client: LLMClient | None = None,
) -> SRSDocument:
    client = llm_client or build_default_llm_client()

    requirement_entries = [
        SRSRequirementEntry(
            id=r.id,
            title=r.title,
            description=r.description,
            actor=r.actor,
            related_screen=r.related_screen,
        )
        for r in analysis.requirements
    ]

    if not requirement_entries:
        return SRSDocument(
            input_id=analysis.input_id,
            title="Untitled SRS (no requirements extracted)",
            summary="No requirements were extracted from the source input.",
            requirements=[],
        )

    prompt = build_srs_prompt([r.title for r in requirement_entries])
    parsed = await complete_json(client, prompt, context="SRS Generator LLM")

    return SRSDocument(
        input_id=analysis.input_id,
        title=parsed["title"],
        summary=parsed["summary"],
        requirements=requirement_entries,
    )
