import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from langfuse import get_client

from app.agents.analyzer import analyze
from app.agents.input_router import route_text_input
from app.agents.srs_generator import generate_srs
from app.observability.langfuse_setup import init_langfuse

init_langfuse()

SAMPLE_TEXT = """
Users should be able to register for an account using their email address.
After registering, users must verify their email before they can log in.
Once logged in, users can view and edit their profile information.
Admins should be able to deactivate any user account from the admin dashboard.
"""


async def main():
    print("== Input Router ==")
    normalized = route_text_input(SAMPLE_TEXT.strip())
    print(f"input_id: {normalized.input_id}")

    print("\n== Analyzer ==")
    analysis = await analyze(normalized)
    for r in analysis.requirements:
        print(f"- [{r.id}] {r.title}")

    print("\n== SRS Generator ==")
    srs = await generate_srs(analysis)
    print(f"\nTitle: {srs.title}")
    print(f"Summary: {srs.summary}")
    print(f"\nRequirements ({len(srs.requirements)}):")
    for r in srs.requirements:
        print(f"  - [{r.id}] {r.title} (actor={r.actor}, screen={r.related_screen})")


if __name__ == "__main__":
    asyncio.run(main())
    get_client().flush()
