from pathlib import Path

import pytest

from app.agents.input_router import route_document_input, route_image_input, route_text_input
from app.schemas.requirement import InputType

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def test_route_text_input_populates_schema():
    result = route_text_input("As a user, I want to log in with my email and password.")

    assert result.input_type == InputType.TEXT
    assert result.raw_content == "As a user, I want to log in with my email and password."
    assert result.input_id is not None
    assert result.created_at is not None
    assert result.metadata == {}


def test_route_text_input_preserves_metadata():
    result = route_text_input("Some requirement text", metadata={"source": "jira-import"})

    assert result.metadata == {"source": "jira-import"}


def test_route_image_input_populates_schema():
    result = route_image_input(
        "https://example.com/wireframe.png", caption="Login screen wireframe"
    )

    assert result.input_type == InputType.IMAGE
    assert result.raw_content == "Login screen wireframe"
    assert result.metadata["image_url"] == "https://example.com/wireframe.png"


def test_route_document_input_parses_docx():
    file_bytes = (FIXTURES_DIR / "sample.docx").read_bytes()
    result = route_document_input(file_bytes, "docx")

    assert result.input_type == InputType.DOCUMENT
    assert "reset my password" in result.raw_content
    assert result.metadata["file_type"] == "docx"


def test_route_document_input_parses_xlsx():
    file_bytes = (FIXTURES_DIR / "sample.xlsx").read_bytes()
    result = route_document_input(file_bytes, "xlsx")

    assert result.input_type == InputType.DOCUMENT
    assert "User login" in result.raw_content
    assert result.metadata["file_type"] == "xlsx"


def test_route_document_input_parses_pdf():
    file_bytes = (FIXTURES_DIR / "sample.pdf").read_bytes()
    result = route_document_input(file_bytes, "pdf")

    assert result.input_type == InputType.DOCUMENT
    assert isinstance(result.raw_content, str)
    assert result.metadata["file_type"] == "pdf"


def test_route_document_input_rejects_unsupported_type():
    with pytest.raises(ValueError):
        route_document_input(b"garbage", "txt")
