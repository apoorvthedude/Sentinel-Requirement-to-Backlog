from neo4j import AsyncGraphDatabase

from app.config import settings

_driver = None


def get_driver():
    global _driver
    if _driver is None:
        _driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri, auth=(settings.neo4j_user, settings.neo4j_password)
        )
    return _driver


async def close_driver():
    global _driver
    if _driver is not None:
        await _driver.close()
        _driver = None


async def find_structural_matches(requirement_id: str, related_screen: str | None) -> list[dict]:
    if not related_screen:
        return []

    query = """
    MATCH (r:Requirement {id: $requirement_id})-[:ON_SCREEN]->(s:Screen {name: $screen})
    MATCH (s)-[:DEPENDS_ON]->(other_screen:Screen)<-[:ON_SCREEN]-(other:Requirement)
    WHERE other.id <> $requirement_id
    RETURN other.id AS matched_requirement_id, other.input_id AS matched_input_id,
           other.title AS matched_title
    """
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(query, requirement_id=requirement_id, screen=related_screen)
        return [record.data() async for record in result]


async def create_dependency_edge(
    from_requirement_id: str,
    from_input_id: str,
    from_title: str,
    from_screen: str | None,
    to_requirement_id: str,
    to_input_id: str,
    to_title: str,
    to_screen: str | None,
) -> None:
    query = """
    MERGE (a:Requirement {id: $from_id})
    SET a.input_id = $from_input_id, a.title = $from_title
    MERGE (b:Requirement {id: $to_id})
    SET b.input_id = $to_input_id, b.title = $to_title
    MERGE (a)-[:DEPENDS_ON]->(b)
    """
    driver = get_driver()
    async with driver.session() as session:
        await session.run(
            query,
            from_id=from_requirement_id,
            from_input_id=from_input_id,
            from_title=from_title,
            to_id=to_requirement_id,
            to_input_id=to_input_id,
            to_title=to_title,
        )

        if from_screen and to_screen and from_screen != to_screen:
            screen_query = """
            MERGE (s1:Screen {name: $from_screen})
            MERGE (s2:Screen {name: $to_screen})
            MERGE (s1)-[:DEPENDS_ON]->(s2)
            WITH s1, s2
            MATCH (a:Requirement {id: $from_id})
            MATCH (b:Requirement {id: $to_id})
            MERGE (a)-[:ON_SCREEN]->(s1)
            MERGE (b)-[:ON_SCREEN]->(s2)
            """
            await session.run(
                screen_query,
                from_screen=from_screen,
                to_screen=to_screen,
                from_id=from_requirement_id,
                to_id=to_requirement_id,
            )
