from langfuse import observe

from app.llm.client import LLMClient, build_default_llm_client
from app.llm.json_utils import complete_json, complete_json_vision
from app.llm.prompts.analyzer import build_analyzer_prompt, build_analyzer_vision_prompt
from app.schemas.analysis import AnalysisResult
from app.schemas.requirement import InputType, NormalizedRequirementInput


@observe(name="analyzer_agent")
async def analyze(
    normalized_input: NormalizedRequirementInput,
    llm_client: LLMClient | None = None,
) -> AnalysisResult:
    client = llm_client or build_default_llm_client()

    if normalized_input.input_type == InputType.IMAGE:
        image_url = normalized_input.metadata["image_url"]
        prompt = build_analyzer_vision_prompt(normalized_input.raw_content)
        parsed = await complete_json_vision(
            client, prompt, [image_url], context="Analyzer LLM (vision)"
        )
    else:
        prompt = build_analyzer_prompt(normalized_input.raw_content)
        parsed = await complete_json(client, prompt, context="Analyzer LLM")

    parsed["input_id"] = normalized_input.input_id
    return AnalysisResult.model_validate(parsed)
