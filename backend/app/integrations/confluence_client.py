import httpx

from app.config import settings


def _auth():
    return (settings.jira_email, settings.jira_api_token)


async def create_page(title: str, body_html: str) -> dict:
    async with httpx.AsyncClient(timeout=25) as client:
        response = await client.post(
            f"{settings.confluence_base_url}/rest/api/content",
            auth=_auth(),
            json={
                "type": "page",
                "title": title,
                "space": {"key": settings.confluence_space_key},
                "body": {
                    "storage": {
                        "value": body_html,
                        "representation": "storage",
                    }
                },
            },
        )
        response.raise_for_status()
        return response.json()


def page_url(page_id: str) -> str:
    return f"{settings.confluence_base_url}/pages/viewpage.action?pageId={page_id}"
