from langfuse import observe

from app.llm.client import LLMClient, build_default_llm_client
from app.llm.json_utils import complete_json
from app.llm.prompts.guardrail import build_guardrail_prompt
from app.schemas.guardrail import GuardrailResult
from app.schemas.requirement import NormalizedRequirementInput


@observe(name="guardrail_agent")
async def check_input(
    normalized_input: NormalizedRequirementInput,
    llm_client: LLMClient | None = None,
) -> GuardrailResult:
    client = llm_client or build_default_llm_client()

    text_to_check = normalized_input.raw_content.strip()
    if not text_to_check:
        return GuardrailResult(
            passed=False, reason="Input text is empty.", category="quality"
        )

    prompt = build_guardrail_prompt(text_to_check)
    parsed = await complete_json(client, prompt, context="Guardrail LLM")

    return GuardrailResult.model_validate(parsed)
