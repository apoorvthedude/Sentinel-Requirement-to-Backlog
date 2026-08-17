SRS_SYSTEM_PROMPT = """You are a technical writer producing a Software Requirements Specification (SRS) \
cover section. Given a list of extracted requirements, write:
1. A short document title (5-10 words).
2. A one-paragraph summary (2-4 sentences) describing the overall scope these requirements cover.

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{"title": "...", "summary": "..."}
"""


def build_srs_prompt(requirement_titles: list[str]) -> str:
    bullet_list = "\n".join(f"- {t}" for t in requirement_titles)
    return f"{SRS_SYSTEM_PROMPT}\n\nRequirements:\n{bullet_list}"
