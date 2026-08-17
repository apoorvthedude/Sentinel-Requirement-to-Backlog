from app.parsers.docx_parser import parse_docx
from app.parsers.pdf_parser import parse_pdf
from app.parsers.xlsx_parser import parse_xlsx
from app.schemas.requirement import InputType, NormalizedRequirementInput


def route_text_input(text: str, metadata: dict | None = None) -> NormalizedRequirementInput:
    return NormalizedRequirementInput(
        input_type=InputType.TEXT,
        raw_content=text,
        metadata=metadata or {},
    )


def route_image_input(
    image_url: str, caption: str = "", metadata: dict | None = None
) -> NormalizedRequirementInput:
    merged_metadata = {"image_url": image_url, **(metadata or {})}
    return NormalizedRequirementInput(
        input_type=InputType.IMAGE,
        raw_content=caption,
        metadata=merged_metadata,
    )


_DOCUMENT_PARSERS = {
    "pdf": parse_pdf,
    "docx": parse_docx,
    "xlsx": parse_xlsx,
}


def route_document_input(
    file_bytes: bytes, file_type: str, metadata: dict | None = None
) -> NormalizedRequirementInput:
    file_type = file_type.lower().lstrip(".")
    parser = _DOCUMENT_PARSERS.get(file_type)
    if parser is None:
        raise ValueError(
            f"Unsupported document type: {file_type!r}. Supported: {list(_DOCUMENT_PARSERS)}"
        )

    text = parser(file_bytes)
    merged_metadata = {"file_type": file_type, **(metadata or {})}
    return NormalizedRequirementInput(
        input_type=InputType.DOCUMENT,
        raw_content=text,
        metadata=merged_metadata,
    )
