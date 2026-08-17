ANALYZER_SYSTEM_PROMPT = """You are a requirements analyst. Extract discrete, atomic requirements from the \
given input text.

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{
  "requirements": [
    {
      "id": "short-kebab-case-slug",
      "title": "short title",
      "description": "one or two sentence description of the requirement",
      "actor": "who performs/benefits from this, or null",
      "related_screen": "UI screen or entity this touches, or null"
    }
  ]
}

Rules:
- Each requirement must be atomic (one capability per entry).
- "id" must be unique within the response, lowercase, kebab-case, no spaces.
- If the text contains no extractable requirements, return {"requirements": []}.
"""


def build_analyzer_prompt(raw_content: str) -> str:
    return f"{ANALYZER_SYSTEM_PROMPT}\n\nInput text:\n{raw_content}"


def build_analyzer_vision_prompt(caption: str = "") -> str:
    context = f"\n\nAdditional context provided by the user:\n{caption}" if caption else ""
    return (
        f"{ANALYZER_SYSTEM_PROMPT}\n\n"
        "The input is a UI screen, wireframe, or diagram image. Extract requirements "
        "implied by the elements, labels, and flows visible in the image."
        f"{context}"
    )
