QUALITY_SCORER_PROMPT = """You are a requirements quality reviewer. Score the following requirement \
for clarity and completeness on a 0.0-1.0 scale.

A high score (>= 0.7) means the requirement is specific, testable, and unambiguous.
A low score (< 0.7) means it is vague, missing key details (who/what/when), or too broad.

Requirement:
Title: {title}
Description: {description}

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{{"score": 0.0, "reasoning": "one sentence explaining the score"}}
"""

REFINEMENT_PROMPT = """You are a requirements analyst. The following requirement was flagged as \
vague or incomplete. Rewrite its description to be specific, testable, and unambiguous, \
while preserving the original intent. Do not invent unrelated functionality.

Title: {title}
Original description: {description}
Reason flagged: {reasoning}

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:
{{"refined_description": "..."}}
"""


def build_quality_scorer_prompt(title: str, description: str) -> str:
    return QUALITY_SCORER_PROMPT.format(title=title, description=description)


def build_refinement_prompt(title: str, description: str, reasoning: str) -> str:
    return REFINEMENT_PROMPT.format(title=title, description=description, reasoning=reasoning)
