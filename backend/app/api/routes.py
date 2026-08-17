import time
import uuid

from fastapi import APIRouter, HTTPException
from langgraph.types import Command
from pydantic import BaseModel

from app.graph.checkpointer import get_checkpointer
from app.graph.workflow import build_workflow
from app.llm.usage_tracker import get_totals, start_tracking
from app.schemas.usage import UsageStats

router = APIRouter()


class IngestRequest(BaseModel):
    text: str


class IngestResponse(BaseModel):
    thread_id: str
    status: str
    original_text: str | None = None
    pending_review: dict | None = None
    srs: dict | None = None
    publish_result: dict | None = None
    rejection: dict | None = None
    usage_stats: dict | None = None


class ApprovalRequest(BaseModel):
    approved_pairs: list[str] = []
    publish_approved: bool = False


def _config_for(thread_id: str) -> dict:
    return {"configurable": {"thread_id": thread_id}}


async def _run_with_usage_tracking(app, config, invoke_coro) -> UsageStats:
    """Run a graph invocation, capturing wall-clock latency and LLM token usage
    for this specific call. Returned directly to the caller rather than always
    persisted: calling aupdate_state() on a graph paused at an interrupt() wipes
    the pending interrupt's payload (verified — LangGraph replaces the paused
    task's Interrupt list with an empty tuple), so persistence only happens once
    the run has actually reached a stopping point with no pending interrupt."""
    start_tracking()
    started_at = time.perf_counter()

    await invoke_coro

    elapsed_seconds = time.perf_counter() - started_at
    totals = get_totals()

    usage_stats = UsageStats(
        latency_seconds=round(elapsed_seconds, 3),
        total_tokens=totals.total_tokens if totals else 0,
        prompt_tokens=totals.prompt_tokens if totals else 0,
        completion_tokens=totals.completion_tokens if totals else 0,
        llm_call_count=totals.call_count if totals else 0,
    )

    state = await app.aget_state(config)
    if not state.next:
        # Safe to persist: no pending interrupt to disturb.
        await app.aupdate_state(config, {"usage_stats": usage_stats})

    return usage_stats


async def _result_from_state(
    app, config, fresh_usage_stats: UsageStats | None = None
) -> IngestResponse:
    state = await app.aget_state(config)
    thread_id = config["configurable"]["thread_id"]
    original_text = state.values.get("raw_text")

    persisted_usage_stats = state.values.get("usage_stats")
    usage_stats_dict = (
        fresh_usage_stats.model_dump(mode="json")
        if fresh_usage_stats is not None
        else persisted_usage_stats.model_dump(mode="json")
        if persisted_usage_stats
        else None
    )

    if state.next:
        interrupt_payload = None
        for task in state.tasks:
            if task.interrupts:
                interrupt_payload = task.interrupts[0].value
                break
        return IngestResponse(
            thread_id=thread_id,
            status="pending_review",
            original_text=original_text,
            pending_review=interrupt_payload,
            usage_stats=usage_stats_dict,
        )

    guardrail_result = state.values.get("guardrail_result")
    if guardrail_result is not None and not guardrail_result.passed:
        return IngestResponse(
            thread_id=thread_id,
            status="rejected",
            original_text=original_text,
            rejection=guardrail_result.model_dump(mode="json"),
            usage_stats=usage_stats_dict,
        )

    srs = state.values.get("srs")
    publish_result = state.values.get("publish_result")
    return IngestResponse(
        thread_id=thread_id,
        status="completed",
        original_text=original_text,
        srs=srs.model_dump(mode="json") if srs else None,
        publish_result=publish_result.model_dump(mode="json") if publish_result else None,
        usage_stats=usage_stats_dict,
    )


@router.post("/ingest", response_model=IngestResponse)
async def ingest(payload: IngestRequest):
    checkpointer = get_checkpointer()
    app = build_workflow(checkpointer=checkpointer)

    thread_id = str(uuid.uuid4())
    config = _config_for(thread_id)

    usage_stats = await _run_with_usage_tracking(
        app, config, app.ainvoke({"raw_text": payload.text}, config=config)
    )
    return await _result_from_state(app, config, fresh_usage_stats=usage_stats)


@router.get("/review/{thread_id}", response_model=IngestResponse)
async def get_review(thread_id: str):
    checkpointer = get_checkpointer()
    app = build_workflow(checkpointer=checkpointer)
    config = _config_for(thread_id)

    state = await app.aget_state(config)
    if not state.values:
        raise HTTPException(status_code=404, detail="Unknown thread_id")

    return await _result_from_state(app, config)


@router.post("/review/{thread_id}/approve", response_model=IngestResponse)
async def approve_review(thread_id: str, payload: ApprovalRequest):
    checkpointer = get_checkpointer()
    app = build_workflow(checkpointer=checkpointer)
    config = _config_for(thread_id)

    state = await app.aget_state(config)
    if not state.next:
        raise HTTPException(status_code=400, detail="No pending review for this thread_id")

    interrupt_payload = None
    for task in state.tasks:
        if task.interrupts:
            interrupt_payload = task.interrupts[0].value
            break

    if interrupt_payload and interrupt_payload.get("reason") == "publish_approval_required":
        resume_value = {"approved": payload.publish_approved}
    else:
        resume_value = {"approved": payload.approved_pairs}

    usage_stats = await _run_with_usage_tracking(
        app, config, app.ainvoke(Command(resume=resume_value), config=config)
    )
    return await _result_from_state(app, config, fresh_usage_stats=usage_stats)
