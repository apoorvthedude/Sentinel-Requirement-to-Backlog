from langfuse import observe

from app.integrations.confluence_client import create_page, page_url
from app.integrations.jira_client import create_epic, create_story, issue_url
from app.schemas.publish import PublishResult, PublishedStory
from app.schemas.srs import SRSDocument


def _story_description(requirement, srs: SRSDocument) -> str:
    lines = [
        requirement.description,
        "",
        f"Traceability: source input {srs.input_id}, requirement id {requirement.id}",
    ]
    if requirement.dependencies:
        lines.append(f"Confirmed dependencies: {', '.join(requirement.dependencies)}")
    return "\n".join(lines)


def _confluence_body(srs: SRSDocument, epic_key: str, epic_url: str, stories: list[PublishedStory]) -> str:
    rows = "".join(
        f"<tr><td>{s.requirement_id}</td>"
        f'<td><a href="{s.jira_url}">{s.jira_key}</a></td></tr>'
        for s in stories
    )
    return f"""
    <p>{srs.summary}</p>
    <p><strong>Source input:</strong> {srs.input_id}</p>
    <p><strong>Epic:</strong> <a href="{epic_url}">{epic_key}</a></p>
    <table>
      <tbody>
        <tr><th>Requirement ID</th><th>Jira Story</th></tr>
        {rows}
      </tbody>
    </table>
    """


@observe(name="publisher_agent")
async def publish(srs: SRSDocument) -> PublishResult:
    epic = await create_epic(
        title=srs.title,
        description=f"{srs.summary}\n\nTraceability: source input {srs.input_id}",
    )
    epic_key = epic["key"]

    stories: list[PublishedStory] = []
    for requirement in srs.requirements:
        story = await create_story(
            title=requirement.title,
            description=_story_description(requirement, srs),
            epic_key=epic_key,
        )
        stories.append(
            PublishedStory(
                requirement_id=requirement.id,
                jira_key=story["key"],
                jira_url=issue_url(story["key"]),
            )
        )

    unique_suffix = str(srs.input_id)[:8]
    page = await create_page(
        title=f"SRS: {srs.title} ({unique_suffix})",
        body_html=_confluence_body(srs, epic_key, issue_url(epic_key), stories),
    )

    return PublishResult(
        epic_key=epic_key,
        epic_url=issue_url(epic_key),
        stories=stories,
        confluence_page_id=page["id"],
        confluence_url=page_url(page["id"]),
    )
