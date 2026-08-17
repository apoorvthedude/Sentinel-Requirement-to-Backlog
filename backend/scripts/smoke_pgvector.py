import asyncio
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.postgres import get_session, init_db
from app.schemas.analysis import ExtractedRequirement
from app.agents.dependency_impact import find_similar_requirements, store_requirement_embedding


async def main():
    print("== init_db (create extension + tables) ==")
    await init_db()

    input_id_a = uuid.uuid4()
    input_id_b = uuid.uuid4()

    req_a = ExtractedRequirement(
        id="user-login",
        title="User login",
        description="As a user, I want to log in with my email and password.",
        actor="user",
        related_screen="login-screen",
    )
    req_b = ExtractedRequirement(
        id="user-signin",
        title="User sign-in",
        description="As a user, I want to sign in using my email address and password.",
        actor="user",
        related_screen="signin-screen",
    )

    async with get_session() as session:
        print("== storing req_a ==")
        await store_requirement_embedding(session, input_id_a, req_a)

        print("== querying similarity for req_b (should match req_a, high similarity) ==")
        result = await find_similar_requirements(session, req_b, exclude_input_id=input_id_b)
        print(f"flagged_matches: {result.flagged_matches}")


if __name__ == "__main__":
    asyncio.run(main())
