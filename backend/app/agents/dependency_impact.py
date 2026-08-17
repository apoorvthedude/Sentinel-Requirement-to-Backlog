import uuid

from langfuse import observe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.models import RequirementEmbedding
from app.db.neo4j_client import find_structural_matches
from app.llm.embeddings import embed_text
from app.schemas.analysis import AnalysisResult, ExtractedRequirement
from app.schemas.dependency import DependencyMatch, RequirementDependencyResult


async def find_similar_requirements(
    session: AsyncSession,
    requirement: ExtractedRequirement,
    exclude_input_id=None,
    threshold: float | None = None,
) -> RequirementDependencyResult:
    threshold = threshold if threshold is not None else settings.dependency_similarity_threshold
    query_text = f"{requirement.title}. {requirement.description}"
    query_vector = await embed_text(query_text)

    distance = RequirementEmbedding.embedding.cosine_distance(query_vector)
    stmt = select(RequirementEmbedding, distance.label("distance")).order_by(distance).limit(5)
    if exclude_input_id is not None:
        stmt = stmt.where(RequirementEmbedding.input_id != exclude_input_id)

    rows = (await session.execute(stmt)).all()

    matches = []
    for row, dist in rows:
        similarity = 1 - dist
        if similarity >= threshold:
            matches.append(
                DependencyMatch(
                    matched_requirement_id=row.requirement_id,
                    matched_input_id=row.input_id,
                    matched_title=row.title,
                    similarity_score=round(float(similarity), 4),
                    confirmed=False,
                )
            )

    return RequirementDependencyResult(requirement_id=requirement.id, flagged_matches=matches)


async def find_structural_dependency_matches(
    requirement: ExtractedRequirement,
) -> list[DependencyMatch]:
    rows = await find_structural_matches(requirement.id, requirement.related_screen)

    matches = []
    for row in rows:
        matches.append(
            DependencyMatch(
                matched_requirement_id=row["matched_requirement_id"],
                matched_input_id=uuid.UUID(row["matched_input_id"]),
                matched_title=row["matched_title"],
                similarity_score=1.0,
                confirmed=False,
                match_source="structural",
            )
        )
    return matches


async def store_requirement_embedding(
    session: AsyncSession,
    input_id,
    requirement: ExtractedRequirement,
) -> None:
    text_to_embed = f"{requirement.title}. {requirement.description}"
    vector = await embed_text(text_to_embed)

    row = RequirementEmbedding(
        input_id=input_id,
        requirement_id=requirement.id,
        title=requirement.title,
        description=requirement.description,
        embedding=vector,
    )
    session.add(row)
    await session.commit()


@observe(name="dependency_impact_agent")
async def detect_dependencies(
    session: AsyncSession,
    analysis: AnalysisResult,
) -> list[RequirementDependencyResult]:
    results = []
    for requirement in analysis.requirements:
        embedding_result = await find_similar_requirements(
            session, requirement, exclude_input_id=analysis.input_id
        )
        structural_matches = await find_structural_dependency_matches(requirement)

        merged_by_id = {m.matched_requirement_id: m for m in embedding_result.flagged_matches}
        for structural_match in structural_matches:
            merged_by_id[structural_match.matched_requirement_id] = structural_match

        results.append(
            RequirementDependencyResult(
                requirement_id=requirement.id,
                flagged_matches=list(merged_by_id.values()),
            )
        )
        await store_requirement_embedding(session, analysis.input_id, requirement)

    return results
