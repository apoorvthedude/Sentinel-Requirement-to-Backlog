import uuid

import pytest

from app.agents.srs_generator import generate_srs
from app.schemas.analysis import AnalysisResult, ExtractedRequirement


@pytest.mark.asyncio
async def test_generate_srs_from_requirements():
    analysis = AnalysisResult(
        input_id=uuid.uuid4(),
        requirements=[
            ExtractedRequirement(
                id="user-login",
                title="User login",
                description="As a user, I want to log in with email and password.",
                actor="user",
                related_screen="login-screen",
            ),
            ExtractedRequirement(
                id="admin-user-list",
                title="Admin user list",
                description="As an admin, I want to view all registered users.",
                actor="admin",
                related_screen="admin-dashboard",
            ),
        ],
    )

    srs = await generate_srs(analysis)

    assert srs.input_id == analysis.input_id
    assert srs.title.strip() != ""
    assert srs.summary.strip() != ""
    assert len(srs.requirements) == 2
    assert {r.id for r in srs.requirements} == {"user-login", "admin-user-list"}


@pytest.mark.asyncio
async def test_generate_srs_with_no_requirements():
    analysis = AnalysisResult(input_id=uuid.uuid4(), requirements=[])

    srs = await generate_srs(analysis)

    assert srs.requirements == []
    assert srs.summary.strip() != ""
