import asyncio
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from deepeval.metrics import GEval
from deepeval.models import OpenAIModel
from deepeval.test_case import LLMTestCase, LLMTestCaseParams

from app.agents.analyzer import analyze
from app.agents.input_router import route_text_input
from app.agents.srs_generator import generate_srs
from app.config import settings

CANNED_INPUTS = [
    (
        "Users should be able to register for an account using their email address. "
        "After registering, users must verify their email before they can log in. "
        "Once logged in, users can view and edit their profile information."
    ),
    (
        "As an admin, I want to view a list of all registered users so that I can "
        "manage accounts and deactivate suspicious ones."
    ),
]


def build_srs_quality_metric() -> GEval:
    model = OpenAIModel(model=settings.openai_model, api_key=settings.openai_api_key)
    return GEval(
        name="SRS Quality",
        criteria=(
            "Evaluate whether the SRS output (in 'actual_output') is a clear, complete, "
            "and well-structured Software Requirements Specification for the source "
            "requirements text (in 'input'). A good SRS has a specific, non-generic title, "
            "a summary that accurately reflects the scope of the input, and requirement "
            "entries that are traceable back to the input's intent."
        ),
        evaluation_params=[LLMTestCaseParams.INPUT, LLMTestCaseParams.ACTUAL_OUTPUT],
        model=model,
        threshold=0.6,
    )


async def run_eval():
    metric = build_srs_quality_metric()
    results = []

    for text in CANNED_INPUTS:
        normalized = route_text_input(text)
        analysis = await analyze(normalized)
        srs = await generate_srs(analysis)

        actual_output = (
            f"Title: {srs.title}\n"
            f"Summary: {srs.summary}\n"
            f"Requirements: {[r.title for r in srs.requirements]}"
        )

        test_case = LLMTestCase(input=text, actual_output=actual_output)
        score = metric.measure(test_case)
        results.append((text[:60], score, metric.reason))

    print(f"{'Input (truncated)':<62} Score  Reason")
    for text_snippet, score, reason in results:
        print(f"{text_snippet:<62} {score:.2f}  {reason}")


if __name__ == "__main__":
    asyncio.run(run_eval())
