import pytest_asyncio

from app.db.postgres import engine


@pytest_asyncio.fixture(autouse=True)
async def _dispose_engine_after_test():
    yield
    await engine.dispose()
    from app.db import neo4j_client

    await neo4j_client.close_driver()
