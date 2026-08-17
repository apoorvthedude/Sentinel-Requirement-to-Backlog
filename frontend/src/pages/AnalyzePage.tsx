import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import UsageBadge from "../components/UsageBadge";
import { buildSteps } from "../lib/steps";
import { getReview } from "../api/client";
import type { IngestResponse, SRSRequirementEntry } from "../types/api";
import "./AnalyzePage.css";

function RequirementList({ requirements }: { requirements: SRSRequirementEntry[] }) {
  return (
    <ul className="analyze-page__requirements">
      {requirements.map((r) => (
        <li key={r.id} className="analyze-page__requirement">
          <div className="analyze-page__requirement-title">{r.title}</div>
          <div className="analyze-page__requirement-desc">{r.description}</div>
          <div className="analyze-page__requirement-meta">
            {r.actor && <span className="analyze-page__tag">{r.actor}</span>}
            {r.related_screen && <span className="analyze-page__tag">{r.related_screen}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}

interface LocationState {
  ingestResponse?: IngestResponse;
}

export default function AnalyzePage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const preloaded = (location.state as LocationState | null)?.ingestResponse;

  const [data, setData] = useState<IngestResponse | null>(preloaded ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only re-fetch if we didn't arrive with a fresh response already in hand
    // (e.g. direct navigation to this URL, or a page refresh). A fresh fetch
    // won't carry usage_stats for a run still paused at an interrupt — that's
    // only available on the direct call that produced it.
    if (preloaded || !threadId) return;
    getReview(threadId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load run."));
  }, [threadId, preloaded]);

  const rejected = data?.status === "rejected";

  const srs =
    data?.status === "completed"
      ? data.srs
      : data?.status === "pending_review" && data.pending_review?.reason === "publish_approval_required"
        ? data.pending_review.srs
        : null;

  const dependencyReview =
    data?.status === "pending_review" &&
    data.pending_review?.reason === "flagged_dependencies_require_review"
      ? data.pending_review
      : null;

  return (
    <Layout steps={buildSteps("analyze", rejected)}>
      <div className="analyze-page">
        <div className="analyze-page__intro">
          <h1>AI Analysis</h1>
          <p>Compare what you wrote against what Sentinel extracted from it.</p>
        </div>

        {error && (
          <Card className="analyze-page__error">
            <p>Error: {error}</p>
          </Card>
        )}

        {!error && !data && (
          <Card>
            <p className="analyze-page__loading">Loading analysis…</p>
          </Card>
        )}

        {data?.status === "rejected" && data.rejection && (
          <Card className="analyze-page__error">
            <h2>Input rejected</h2>
            <p className="analyze-page__rejection-category">
              Category: {data.rejection.category}
            </p>
            <p>{data.rejection.reason}</p>
          </Card>
        )}

        {data && !rejected && (
          <div className="analyze-page__compare">
            <Card className="analyze-page__panel">
              <div className="analyze-page__panel-header">
                <span className="analyze-page__panel-label">Original Requirement</span>
              </div>
              <p className="analyze-page__original-text">
                {data.original_text ?? "—"}
              </p>
            </Card>

            <Card className="analyze-page__panel analyze-page__panel--ai">
              <div className="analyze-page__panel-header analyze-page__panel-header--split">
                <span className="analyze-page__panel-label analyze-page__panel-label--ai">
                  <Sparkles size={14} />
                  AI Response
                </span>
                {data.usage_stats && <UsageBadge stats={data.usage_stats} />}
              </div>

              {srs && (
                <>
                  <h2 className="analyze-page__srs-title">{srs.title}</h2>
                  <p className="analyze-page__srs-summary">{srs.summary}</p>
                  <RequirementList requirements={srs.requirements} />
                </>
              )}

              {dependencyReview && (
                <>
                  {dependencyReview.dependency_results.some(
                    (r) => r.flagged_matches.length > 0
                  ) && (
                    <div className="analyze-page__section">
                      <h3>Flagged Dependencies</h3>
                      {dependencyReview.dependency_results.map((dep) =>
                        dep.flagged_matches.map((match) => (
                          <div
                            key={`${dep.requirement_id}:${match.matched_requirement_id}`}
                            className="analyze-page__match"
                          >
                            <strong>{dep.requirement_id}</strong> may depend on{" "}
                            <strong>{match.matched_requirement_id}</strong> — "
                            {match.matched_title}" (similarity: {match.similarity_score},
                            source: {match.match_source})
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {dependencyReview.quality_scores.some((q) => q.flagged) && (
                    <div className="analyze-page__section analyze-page__section--quality">
                      <h3>Quality Flags</h3>
                      {dependencyReview.quality_scores
                        .filter((q) => q.flagged)
                        .map((q) => (
                          <p key={q.requirement_id}>
                            <strong>{q.requirement_id}</strong> scored {q.score.toFixed(2)}:{" "}
                            {q.reasoning}
                          </p>
                        ))}
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        )}

        {srs && (
          <div className="analyze-page__actions">
            <Button variant="secondary" onClick={() => navigate("/")}>
              Start Over
            </Button>
            <Button onClick={() => threadId && navigate(`/draft/${threadId}`)}>
              Continue to Jira Draft
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
