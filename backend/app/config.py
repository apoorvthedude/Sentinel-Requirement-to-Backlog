from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openai_api_key: str = ""
    openai_model: str = "gpt-5-nano"
    openai_fallback_model: str = "gpt-5-mini"

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "sentinel"
    postgres_password: str = "sentinel"
    postgres_db: str = "sentinel"

    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "sentinel-password"

    embedding_model: str = "BAAI/bge-small-en-v1.5"
    embedding_dim: int = 384
    dependency_similarity_threshold: float = 0.80
    quality_score_threshold: float = 0.70

    jira_base_url: str = ""
    jira_email: str = ""
    jira_api_token: str = ""
    jira_project_key: str = ""

    confluence_base_url: str = ""
    confluence_space_key: str = ""

    langfuse_public_key: str = ""
    langfuse_secret_key: str = ""
    langfuse_host: str = "https://cloud.langfuse.com"

    @property
    def postgres_dsn(self) -> str:
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def postgres_psycopg_dsn(self) -> str:
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
