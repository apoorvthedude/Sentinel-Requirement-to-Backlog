import pytest

from app.agents.analyzer import analyze
from app.agents.input_router import route_image_input, route_text_input

CANNED_REQUIREMENTS = [
    "As a user, I want to log in with my email and password so that I can access my account.",
    "As an admin, I want to view a list of all registered users so that I can manage accounts.",
    "The checkout screen must display the total price including tax before the user confirms payment.",
]


@pytest.mark.asyncio
@pytest.mark.parametrize("text", CANNED_REQUIREMENTS)
async def test_analyze_extracts_requirements(text):
    normalized = route_text_input(text)
    result = await analyze(normalized)

    assert result.input_id == normalized.input_id
    assert len(result.requirements) >= 1

    first = result.requirements[0]
    assert first.title.strip() != ""
    assert first.description.strip() != ""
    assert first.id.strip() != ""


@pytest.mark.asyncio
async def test_analyze_extracts_requirements_from_image():
    image_url = (
        "https://raw.githubusercontent.com/microsoft/vscode/main/resources/win32/code_150x150.png"
    )
    normalized = route_image_input(image_url, caption="Application icon reference image")
    result = await analyze(normalized)

    assert result.input_id == normalized.input_id
    assert isinstance(result.requirements, list)
