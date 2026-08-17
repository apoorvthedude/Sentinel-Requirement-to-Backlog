import os

from app.config import settings


def init_langfuse() -> None:
    if not settings.langfuse_public_key or not settings.langfuse_secret_key:
        return

    os.environ.setdefault("LANGFUSE_PUBLIC_KEY", settings.langfuse_public_key)
    os.environ.setdefault("LANGFUSE_SECRET_KEY", settings.langfuse_secret_key)
    os.environ.setdefault("LANGFUSE_HOST", settings.langfuse_host)
