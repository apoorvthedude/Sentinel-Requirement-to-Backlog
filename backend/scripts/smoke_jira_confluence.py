import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.integrations.confluence_client import create_page, page_url
from app.integrations.jira_client import create_epic, create_story, issue_url


async def main():
    print("== creating Jira Epic ==")
    epic = await create_epic(
        title="[Sentinel POC] Test Epic",
        description="Smoke test epic created by Sentinel Publisher Agent scaffolding.",
    )
    epic_key = epic["key"]
    print(f"Epic created: {epic_key} -> {issue_url(epic_key)}")

    print("\n== creating Jira Story under Epic ==")
    story = await create_story(
        title="[Sentinel POC] Test Story",
        description="Smoke test story linked to the epic above.",
        epic_key=epic_key,
    )
    story_key = story["key"]
    print(f"Story created: {story_key} -> {issue_url(story_key)}")

    print("\n== creating Confluence page ==")
    page = await create_page(
        title="Sentinel POC Smoke Test Page",
        body_html=f"<p>Smoke test page. Linked epic: {epic_key}, story: {story_key}.</p>",
    )
    page_id = page["id"]
    print(f"Page created: {page_id} -> {page_url(page_id)}")


if __name__ == "__main__":
    asyncio.run(main())
