import pytest

from app.agents.quality_scorer import refine_requirement, score_requirement
from app.schemas.analysis import ExtractedRequirement

WELL_FORMED_REQUIREMENT = ExtractedRequirement(
    id="password-reset-link",
    title="Send password reset link",
    description=(
        "When a user submits the 'forgot password' form with a registered email address, "
        "the system shall send a password reset link to that email within 60 seconds. "
        "The link shall expire after 30 minutes. If the email is not registered, the "
        "system shall display a generic confirmation message without revealing whether "
        "the account exists. The reset link shall be single-use and invalidated after "
        "the password is successfully changed."
    ),
    actor="user",
    related_screen="forgot-password-screen",
)

VAGUE_REQUIREMENT = ExtractedRequirement(
    id="make-it-better",
    title="Improve stuff",
    description="The system should work better and be more user friendly.",
    actor=None,
    related_screen=None,
)


@pytest.mark.asyncio
async def test_well_formed_requirement_scores_meaningfully_higher_than_vague_one():
    """The scorer's absolute bar can shift between runs/models, so we assert the
    relative property that actually matters: specific requirements outscore vague ones."""
    well_formed_result = await score_requirement(WELL_FORMED_REQUIREMENT)
    vague_result = await score_requirement(VAGUE_REQUIREMENT)

    assert well_formed_result.score > vague_result.score
    assert well_formed_result.score - vague_result.score >= 0.2


@pytest.mark.asyncio
async def test_vague_requirement_scores_below_threshold_and_is_flagged():
    result = await score_requirement(VAGUE_REQUIREMENT)

    assert result.score < 0.70
    assert result.flagged is True


@pytest.mark.asyncio
async def test_refinement_produces_more_detailed_description():
    quality_score = await score_requirement(VAGUE_REQUIREMENT)
    assert quality_score.flagged is True

    refined = await refine_requirement(VAGUE_REQUIREMENT, quality_score)

    assert refined.requirement_id == "make-it-better"
    assert len(refined.refined_description) > len(refined.original_description)
