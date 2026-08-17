from pydantic import BaseModel


class PublishedStory(BaseModel):
    requirement_id: str
    jira_key: str
    jira_url: str


class PublishResult(BaseModel):
    epic_key: str
    epic_url: str
    stories: list[PublishedStory]
    confluence_page_id: str
    confluence_url: str
