import asyncio
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.agents.dependency_impact import find_similar_requirements, store_requirement_embedding
from app.db.postgres import get_session, init_db
from app.schemas.analysis import ExtractedRequirement


@dataclass
class LabeledCase:
    seed: ExtractedRequirement
    query: ExtractedRequirement
    should_match: bool
    label: str


LABELED_CASES = [
    LabeledCase(
        seed=ExtractedRequirement(
            id="user-login", title="User login",
            description="As a user, I want to log in with my email and password.",
            actor="user", related_screen="login-screen",
        ),
        query=ExtractedRequirement(
            id="user-signin", title="User sign-in",
            description="As a user, I want to sign in using my email address and password.",
            actor="user", related_screen="signin-screen",
        ),
        should_match=True,
        label="paraphrased duplicate (login vs sign-in)",
    ),
    LabeledCase(
        seed=ExtractedRequirement(
            id="cart-item-list", title="Cart item list",
            description="Display all items currently in the shopping cart with quantity and price.",
            actor="user", related_screen="cart-screen",
        ),
        query=ExtractedRequirement(
            id="checkout-total-display", title="Checkout total price display",
            description="The checkout screen must display the total price including tax.",
            actor="user", related_screen="checkout-screen",
        ),
        should_match=False,
        label="related but distinct (cart list vs checkout total)",
    ),
    LabeledCase(
        seed=ExtractedRequirement(
            id="admin-export-report", title="Export financial report",
            description="As an admin, I want to export a quarterly financial report as PDF.",
            actor="admin", related_screen="admin-reports",
        ),
        query=ExtractedRequirement(
            id="user-view-profile", title="View user profile",
            description="As a user, I want to view my profile information.",
            actor="user", related_screen="profile-screen",
        ),
        should_match=False,
        label="unrelated requirements",
    ),
    LabeledCase(
        seed=ExtractedRequirement(
            id="password-reset-request", title="Request password reset",
            description="As a user, I want to request a password reset link via email.",
            actor="user", related_screen="forgot-password-screen",
        ),
        query=ExtractedRequirement(
            id="password-reset-email-link", title="Password reset email link",
            description="A user requests a reset link to be emailed to reset their password.",
            actor="user", related_screen="forgot-password-screen",
        ),
        should_match=True,
        label="paraphrased duplicate (password reset)",
    ),
]


async def run_eval():
    await init_db()

    true_positives = false_positives = false_negatives = true_negatives = 0
    rows = []

    for case in LABELED_CASES:
        input_id_seed, input_id_query = uuid.uuid4(), uuid.uuid4()
        async with get_session() as session:
            await store_requirement_embedding(session, input_id_seed, case.seed)
            result = await find_similar_requirements(
                session, case.query, exclude_input_id=input_id_query
            )

        predicted_match = any(
            m.matched_requirement_id == case.seed.id for m in result.flagged_matches
        )

        if case.should_match and predicted_match:
            true_positives += 1
            outcome = "TP"
        elif case.should_match and not predicted_match:
            false_negatives += 1
            outcome = "FN"
        elif not case.should_match and predicted_match:
            false_positives += 1
            outcome = "FP"
        else:
            true_negatives += 1
            outcome = "TN"

        rows.append((case.label, case.should_match, predicted_match, outcome))

    print(f"{'Case':<45} {'Expected':<10} {'Predicted':<10} Outcome")
    for label, expected, predicted, outcome in rows:
        print(f"{label:<45} {str(expected):<10} {str(predicted):<10} {outcome}")

    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) else float("nan")
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) else float("nan")

    print(f"\nPrecision: {precision:.2f}")
    print(f"Recall:    {recall:.2f}")
    print(f"TP={true_positives} FP={false_positives} FN={false_negatives} TN={true_negatives}")


if __name__ == "__main__":
    asyncio.run(run_eval())
