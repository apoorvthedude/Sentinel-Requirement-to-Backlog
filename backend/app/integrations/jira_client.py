import httpx

from app.config import settings


def _auth():
    return (settings.jira_email, settings.jira_api_token)


def _adf_paragraph(text: str) -> dict:
    return {
        "type": "doc",
        "version": 1,
        "content": [
            {"type": "paragraph", "content": [{"type": "text", "text": text}]}
        ],
    }


async def create_epic(title: str, description: str) -> dict:
    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(
            f"{settings.jira_base_url}/rest/api/3/issue",
            auth=_auth(),
            json={
                "fields": {
                    "project": {"key": settings.jira_project_key},
                    "summary": title,
                    "description": _adf_paragraph(description),
                    "issuetype": {"name": "Epic"},
                }
            },
        )
        response.raise_for_status()
        return response.json()


async def create_story(
    title: str, description: str, epic_key: str | None = None
) -> dict:
    fields = {
        "project": {"key": settings.jira_project_key},
        "summary": title,
        "description": _adf_paragraph(description),
        "issuetype": {"name": "Story"},
    }
    if epic_key:
        fields["parent"] = {"key": epic_key}

    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(
            f"{settings.jira_base_url}/rest/api/3/issue",
            auth=_auth(),
            json={"fields": fields},
        )
        response.raise_for_status()
        return response.json()


def issue_url(issue_key: str) -> str:
    return f"{settings.jira_base_url}/browse/{issue_key}"
