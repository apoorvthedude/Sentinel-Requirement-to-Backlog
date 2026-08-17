from contextlib import asynccontextmanager

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer

from app.config import settings

_checkpointer_cm = None
_checkpointer = None

_ALLOWED_MSGPACK_MODULES = [
    ("asyncpg.pgproto.pgproto", "UUID"),
    ("app.schemas.requirement", "InputType"),
    ("app.schemas.requirement", "NormalizedRequirementInput"),
    ("app.schemas.analysis", "ExtractedRequirement"),
    ("app.schemas.analysis", "AnalysisResult"),
    ("app.schemas.dependency", "DependencyMatch"),
    ("app.schemas.dependency", "RequirementDependencyResult"),
    ("app.schemas.srs", "SRSRequirementEntry"),
    ("app.schemas.srs", "SRSDocument"),
    ("app.schemas.publish", "PublishedStory"),
    ("app.schemas.publish", "PublishResult"),
    ("app.schemas.quality", "QualityScore"),
    ("app.schemas.guardrail", "GuardrailResult"),
    ("app.schemas.usage", "UsageStats"),
]


def build_serde() -> JsonPlusSerializer:
    return JsonPlusSerializer(allowed_msgpack_modules=_ALLOWED_MSGPACK_MODULES)


async def startup_checkpointer():
    global _checkpointer_cm, _checkpointer
    _checkpointer_cm = AsyncPostgresSaver.from_conn_string(
        settings.postgres_psycopg_dsn, serde=build_serde()
    )
    _checkpointer = await _checkpointer_cm.__aenter__()
    await _checkpointer.setup()
    return _checkpointer


async def shutdown_checkpointer():
    global _checkpointer_cm, _checkpointer
    if _checkpointer_cm is not None:
        await _checkpointer_cm.__aexit__(None, None, None)
    _checkpointer_cm = None
    _checkpointer = None


def get_checkpointer():
    if _checkpointer is None:
        raise RuntimeError("Checkpointer not initialized — call startup_checkpointer() first")
    return _checkpointer
