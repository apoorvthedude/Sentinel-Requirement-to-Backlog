import asyncio
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.neo4j_client import close_driver, create_dependency_edge, find_structural_matches


async def main():
    input_a = str(uuid.uuid4())
    input_b = str(uuid.uuid4())

    print("== creating dependency edge: checkout-total -> cart-items ==")
    await create_dependency_edge(
        from_requirement_id="checkout-total",
        from_input_id=input_a,
        from_title="Checkout total price",
        from_screen="checkout-screen",
        to_requirement_id="cart-items",
        to_input_id=input_b,
        to_title="Cart items list",
        to_screen="cart-screen",
    )

    print("== querying structural matches for a new requirement on checkout-screen ==")
    matches = await find_structural_matches("checkout-total", "checkout-screen")
    print(f"matches: {matches}")

    await close_driver()


if __name__ == "__main__":
    asyncio.run(main())
