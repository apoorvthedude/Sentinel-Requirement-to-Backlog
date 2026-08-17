import uuid

import pytest
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.types import Command

from app.agents.publisher import publish
from app.config import settings
from app.graph.checkpointer import build_serde
from app.graph.workflow import build_workflow
from app.schemas.srs import SRSDocument, SRSRequirementEntry

REJECT_TEST_TEXT = (
    "As a user, I want to reset my forgotten password by requesting a reset link "
    "sent to my registered email address."
)
APPROVE_TEST_TEXT = (
    "As an admin, I want to configure the maximum number of login attempts allowed "
    "before an account is temporarily locked."
)


async def _run_until_publish_approval(workflow, config):
    """Advance past any incidental dependency-review interrupt (from unrelated stored
    embeddings) so these publish-focused tests aren't coupled to global pgvector state."""
    state = await workflow.aget_state(config)
    if state.next == ("human_review",):
        await workflow.ainvoke(Command(resume={"approved": []}), config=config)
        state = await workflow.aget_state(config)
    return state


@pytest.mark.asyncio
async def test_publish_creates_epic_story_and_confluence_page():
    srs = SRSDocument(
        input_id=uuid.uuid4(),
        title="Password Reset SRS",
        summary="Covers the password reset flow via email link.",
        requirements=[
            SRSRequirementEntry(
                id="request-password-reset",
                title="Request password reset",
                description="User requests a password reset link via their registered email.",
                actor="user",
                related_screen="forgot-password-screen",
                dependencies=[],
            ),
        ],
    )

    result = await publish(srs)

    assert result.epic_key.startswith(settings.jira_project_key)
    assert result.epic_url.startswith(settings.jira_base_url)
    assert len(result.stories) == 1
    assert result.stories[0].requirement_id == "request-password-reset"
    assert result.stories[0].jira_key.startswith(settings.jira_project_key)
    assert result.confluence_page_id
    assert result.confluence_url.startswith(settings.confluence_base_url)


@pytest.mark.asyncio
async def test_graph_rejects_publish_when_not_approved():
    async with AsyncPostgresSaver.from_conn_string(
        settings.postgres_psycopg_dsn, serde=build_serde()
    ) as checkpointer:
        await checkpointer.setup()
        workflow = build_workflow(checkpointer=checkpointer)

        thread_id = str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}

        await workflow.ainvoke({"raw_text": REJECT_TEST_TEXT}, config=config)

        state = await _run_until_publish_approval(workflow, config)
        assert state.next == ("publish_approval",)
        assert state.tasks[0].interrupts[0].value["reason"] == "publish_approval_required"

        result = await workflow.ainvoke(Command(resume={"approved": False}), config=config)

        assert result.get("publish_result") is None
        final_state = await workflow.aget_state(config)
        assert not final_state.next, "graph should complete without publishing"


@pytest.mark.asyncio
async def test_graph_publishes_when_approved():
    async with AsyncPostgresSaver.from_conn_string(
        settings.postgres_psycopg_dsn, serde=build_serde()
    ) as checkpointer:
        await checkpointer.setup()
        workflow = build_workflow(checkpointer=checkpointer)

        thread_id = str(uuid.uuid4())
        config = {"configurable": {"thread_id": thread_id}}

        await workflow.ainvoke({"raw_text": APPROVE_TEST_TEXT}, config=config)
        await _run_until_publish_approval(workflow, config)
        result = await workflow.ainvoke(Command(resume={"approved": True}), config=config)

        assert result["publish_result"] is not None
        assert result["publish_result"].epic_key.startswith(settings.jira_project_key)

        final_state = await workflow.aget_state(config)
        assert not final_state.next, "graph should complete after publishing"
