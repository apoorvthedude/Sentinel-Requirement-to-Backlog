import uuid

import pytest
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.types import Command

from app.config import settings
from app.graph.checkpointer import build_serde
from app.graph.workflow import build_workflow

SAMPLE_TEXT = (
    "Users should be able to reset their password via an email link. "
    "The password reset screen must enforce a minimum password length of 8 characters."
)


@pytest.mark.asyncio
async def test_graph_runs_end_to_end_and_checkpoints():
    async with AsyncPostgresSaver.from_conn_string(
        settings.postgres_psycopg_dsn, serde=build_serde()
    ) as checkpointer:
        await checkpointer.setup()

        workflow = build_workflow(checkpointer=checkpointer)
        thread_id = str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}

        await workflow.ainvoke({"raw_text": SAMPLE_TEXT}, config=config)

        # The graph may pause for human review (flagged dependency or low-quality
        # requirement) and always pauses once more for publish approval. Advance
        # through any pending interrupts so this test verifies orchestration and
        # checkpointing end-to-end regardless of what gets flagged for this input.
        state = await workflow.aget_state(config)
        while state.next:
            reason = state.tasks[0].interrupts[0].value.get("reason")
            if reason == "publish_approval_required":
                resume_value = {"approved": False}
            else:
                resume_value = {"approved": []}
            result = await workflow.ainvoke(Command(resume=resume_value), config=config)
            state = await workflow.aget_state(config)

        assert result["srs"] is not None
        assert result["srs"].title.strip() != ""
        assert len(result["srs"].requirements) >= 1

        checkpoint_tuple = await checkpointer.aget_tuple(config)
        assert checkpoint_tuple is not None
