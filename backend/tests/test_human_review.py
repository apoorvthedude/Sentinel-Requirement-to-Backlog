import uuid

import pytest
import pytest_asyncio
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.types import Command

from app.agents.dependency_impact import store_requirement_embedding
from app.config import settings
from app.db.postgres import get_session, init_db
from app.graph.checkpointer import build_serde
from app.graph.workflow import build_workflow
from app.schemas.analysis import ExtractedRequirement


@pytest_asyncio.fixture(autouse=True)
async def _init_db():
    await init_db()


@pytest.mark.asyncio
async def test_graph_pauses_on_flagged_dependency_and_resumes_on_approval():
    seed_input_id = uuid.uuid4()
    seed_req = ExtractedRequirement(
        id="user-login",
        title="User can enter email address for sign-in",
        description="The system accepts an email address as the username input during sign-in.",
        actor="user",
        related_screen="sign-in screen",
    )
    async with get_session() as session:
        await store_requirement_embedding(session, seed_input_id, seed_req)

    raw_text = "As a user, I want to sign in using my email address and password."

    async with AsyncPostgresSaver.from_conn_string(
        settings.postgres_psycopg_dsn, serde=build_serde()
    ) as checkpointer:
        await checkpointer.setup()
        workflow = build_workflow(checkpointer=checkpointer)

        thread_id = str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}

        await workflow.ainvoke({"raw_text": raw_text}, config=config)

        state = await workflow.aget_state(config)
        assert state.next, "graph should be paused awaiting human review"

        interrupt_payload = state.tasks[0].interrupts[0].value
        assert interrupt_payload["reason"] == "flagged_dependencies_require_review"
        dependency_results = interrupt_payload["dependency_results"]
        assert len(dependency_results) >= 1

        flagged = dependency_results[0]
        requirement_id = flagged["requirement_id"]
        match = flagged["flagged_matches"][0]
        assert match["confirmed"] is False
        approval_key = f"{requirement_id}:{match['matched_requirement_id']}"

        result = await workflow.ainvoke(
            Command(resume={"approved": [approval_key]}), config=config
        )

        assert result["srs"] is not None
        final_state = await workflow.aget_state(config)
        assert final_state.next == ("publish_approval",), (
            "graph should now be paused awaiting publish approval, not completed"
        )

        srs_entry = next(r for r in result["srs"].requirements if r.id == requirement_id)
        assert match["matched_requirement_id"] in srs_entry.dependencies
