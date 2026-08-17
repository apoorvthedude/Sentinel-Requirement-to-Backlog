from typing import TypedDict

from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from app.agents.analyzer import analyze
from app.agents.dependency_impact import detect_dependencies
from app.agents.guardrail import check_input
from app.agents.input_router import route_text_input
from app.agents.publisher import publish
from app.agents.quality_scorer import score_requirement
from app.agents.srs_generator import generate_srs
from app.db.neo4j_client import create_dependency_edge
from app.db.postgres import get_session
from app.schemas.analysis import AnalysisResult
from app.schemas.dependency import RequirementDependencyResult
from app.schemas.guardrail import GuardrailResult
from app.schemas.publish import PublishResult
from app.schemas.quality import QualityScore
from app.schemas.requirement import NormalizedRequirementInput
from app.schemas.srs import SRSDocument
from app.schemas.usage import UsageStats


class PipelineState(TypedDict, total=False):
    raw_text: str
    normalized_input: NormalizedRequirementInput
    guardrail_result: GuardrailResult
    analysis: AnalysisResult
    dependency_results: list[RequirementDependencyResult]
    quality_scores: list[QualityScore]
    srs: SRSDocument
    publish_approved: bool
    publish_result: PublishResult | None
    usage_stats: UsageStats | None


async def input_router_node(state: PipelineState) -> dict:
    normalized = route_text_input(state["raw_text"])
    return {"normalized_input": normalized}


async def guardrail_check_node(state: PipelineState) -> dict:
    result = await check_input(state["normalized_input"])
    return {"guardrail_result": result}


def _route_after_guardrail(state: PipelineState) -> str:
    return "analyzer" if state["guardrail_result"].passed else "end"


async def analyzer_node(state: PipelineState) -> dict:
    analysis = await analyze(state["normalized_input"])
    return {"analysis": analysis}


async def dependency_check_node(state: PipelineState) -> dict:
    async with get_session() as session:
        results = await detect_dependencies(session, state["analysis"])
    return {"dependency_results": results}


async def quality_check_node(state: PipelineState) -> dict:
    scores = [
        await score_requirement(requirement)
        for requirement in state["analysis"].requirements
    ]
    return {"quality_scores": scores}


def _has_flagged_matches(dependency_results: list[RequirementDependencyResult]) -> bool:
    return any(r.flagged_matches for r in dependency_results)


def _has_flagged_quality(quality_scores: list[QualityScore]) -> bool:
    return any(q.flagged for q in quality_scores)


async def human_review_node(state: PipelineState) -> dict:
    dependency_results = state["dependency_results"]
    quality_scores = state.get("quality_scores", [])

    if not _has_flagged_matches(dependency_results) and not _has_flagged_quality(quality_scores):
        return {}

    decisions = interrupt(
        {
            "reason": "flagged_dependencies_require_review",
            "dependency_results": [r.model_dump(mode="json") for r in dependency_results],
            "quality_scores": [q.model_dump(mode="json") for q in quality_scores],
        }
    )

    approved_pairs = set(decisions.get("approved", []))
    requirements_by_id = {r.id: r for r in state["analysis"].requirements}
    input_id = str(state["analysis"].input_id)

    updated_results = []
    for result in dependency_results:
        source_req = requirements_by_id.get(result.requirement_id)
        updated_matches = []
        for match in result.flagged_matches:
            key = f"{result.requirement_id}:{match.matched_requirement_id}"
            if key in approved_pairs:
                match = match.model_copy(update={"confirmed": True})
                if source_req is not None:
                    await create_dependency_edge(
                        from_requirement_id=source_req.id,
                        from_input_id=input_id,
                        from_title=source_req.title,
                        from_screen=source_req.related_screen,
                        to_requirement_id=match.matched_requirement_id,
                        to_input_id=str(match.matched_input_id),
                        to_title=match.matched_title,
                        to_screen=None,
                    )
            updated_matches.append(match)
        updated_results.append(
            result.model_copy(update={"flagged_matches": updated_matches})
        )

    return {"dependency_results": updated_results}


async def srs_generator_node(state: PipelineState) -> dict:
    srs = await generate_srs(state["analysis"])

    confirmed_by_requirement: dict[str, list[str]] = {}
    for result in state.get("dependency_results", []):
        confirmed_ids = [
            m.matched_requirement_id for m in result.flagged_matches if m.confirmed
        ]
        if confirmed_ids:
            confirmed_by_requirement[result.requirement_id] = confirmed_ids

    if confirmed_by_requirement:
        for entry in srs.requirements:
            if entry.id in confirmed_by_requirement:
                entry.dependencies = confirmed_by_requirement[entry.id]

    return {"srs": srs}


async def publish_approval_node(state: PipelineState) -> dict:
    decision = interrupt(
        {
            "reason": "publish_approval_required",
            "srs": state["srs"].model_dump(mode="json"),
        }
    )
    return {"publish_approved": bool(decision.get("approved"))}


async def publisher_node(state: PipelineState) -> dict:
    result = await publish(state["srs"])
    return {"publish_result": result}


def _route_after_approval(state: PipelineState) -> str:
    return "publisher" if state.get("publish_approved") else "end"


def build_workflow(checkpointer=None):
    graph = StateGraph(PipelineState)

    graph.add_node("input_router", input_router_node)
    # TEMP: guardrail / dependency-check / quality-check / human-review nodes
    # disabled to test the raw Analyzer -> SRS Generator path in isolation.
    # graph.add_node("guardrail_check", guardrail_check_node)
    graph.add_node("analyzer", analyzer_node)
    # graph.add_node("dependency_check", dependency_check_node)
    # graph.add_node("quality_check", quality_check_node)
    # graph.add_node("human_review", human_review_node)
    graph.add_node("srs_generator", srs_generator_node)
    graph.add_node("publish_approval", publish_approval_node)
    graph.add_node("publisher", publisher_node)

    graph.add_edge(START, "input_router")
    # graph.add_edge("input_router", "guardrail_check")
    # graph.add_conditional_edges(
    #     "guardrail_check",
    #     _route_after_guardrail,
    #     {"analyzer": "analyzer", "end": END},
    # )
    graph.add_edge("input_router", "analyzer")
    # graph.add_edge("analyzer", "dependency_check")
    # graph.add_edge("analyzer", "quality_check")
    # graph.add_edge("dependency_check", "human_review")
    # graph.add_edge("quality_check", "human_review")
    # graph.add_edge("human_review", "srs_generator")
    graph.add_edge("analyzer", "srs_generator")
    graph.add_edge("srs_generator", "publish_approval")
    graph.add_conditional_edges(
        "publish_approval",
        _route_after_approval,
        {"publisher": "publisher", "end": END},
    )
    graph.add_edge("publisher", END)

    return graph.compile(checkpointer=checkpointer)
