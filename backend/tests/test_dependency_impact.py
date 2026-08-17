import uuid

import pytest
import pytest_asyncio

from app.agents.dependency_impact import (
    find_similar_requirements,
    find_structural_dependency_matches,
    store_requirement_embedding,
)
from app.db.neo4j_client import close_driver, create_dependency_edge
from app.db.postgres import get_session, init_db
from app.schemas.analysis import ExtractedRequirement


@pytest_asyncio.fixture(autouse=True)
async def _init_db():
    await init_db()


@pytest.mark.asyncio
async def test_similar_requirement_is_flagged_not_confirmed():
    input_id_seed = uuid.uuid4()
    input_id_new = uuid.uuid4()

    seed_req = ExtractedRequirement(
        id="user-login",
        title="User login",
        description="As a user, I want to log in with my email and password.",
        actor="user",
        related_screen="login-screen",
    )
    similar_req = ExtractedRequirement(
        id="user-signin",
        title="User sign-in",
        description="As a user, I want to sign in using my email address and password.",
        actor="user",
        related_screen="signin-screen",
    )
    unrelated_req = ExtractedRequirement(
        id="admin-export-report",
        title="Export financial report",
        description="As an admin, I want to export a quarterly financial report as PDF.",
        actor="admin",
        related_screen="admin-reports",
    )

    async with get_session() as session:
        await store_requirement_embedding(session, input_id_seed, seed_req)

        similar_result = await find_similar_requirements(
            session, similar_req, exclude_input_id=input_id_new
        )
        unrelated_result = await find_similar_requirements(
            session, unrelated_req, exclude_input_id=input_id_new
        )

    assert len(similar_result.flagged_matches) >= 1
    top_match = similar_result.flagged_matches[0]
    assert top_match.matched_requirement_id == "user-login"
    assert top_match.confirmed is False
    assert top_match.similarity_score >= 0.80

    assert unrelated_result.flagged_matches == []


@pytest.mark.asyncio
async def test_structural_match_is_distinct_from_embedding_match():
    checkout_input_id = str(uuid.uuid4())
    cart_input_id = str(uuid.uuid4())

    await create_dependency_edge(
        from_requirement_id="checkout-total-display",
        from_input_id=checkout_input_id,
        from_title="Checkout total price display",
        from_screen="checkout-screen",
        to_requirement_id="cart-item-list",
        to_input_id=cart_input_id,
        to_title="Cart item list",
        to_screen="cart-screen",
    )

    requirement = ExtractedRequirement(
        id="checkout-total-display",
        title="Checkout total price display",
        description="The checkout screen must display the total price including tax.",
        actor="user",
        related_screen="checkout-screen",
    )

    matches = await find_structural_dependency_matches(requirement)
    await close_driver()

    assert len(matches) == 1
    assert matches[0].matched_requirement_id == "cart-item-list"
    assert matches[0].match_source == "structural"
    assert matches[0].confirmed is False
