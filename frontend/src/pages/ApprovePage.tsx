import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import SuccessCard from "../components/SuccessCard";
import { buildSteps } from "../lib/steps";
import { MOCK_CREATED_TICKET_ID } from "../mockData";
import type { DraftState } from "./DraftPage";
import "./ApprovePage.css";

export default function ApprovePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state as DraftState | null;

  // Local-only UI state for this mock flow — distinct from the real
  // `approveReview()` API call, which resumes the actual LangGraph
  // publish-approval interrupt. That real flow is separate, out-of-scope work;
  // this button only flips a local flag to show the mock success screen.
  const [created, setCreated] = useState(false);

  const issueType = draft?.issueType ?? "Story";
  const draftTitle = draft?.draftTitle ?? "Improve dashboard search for faster item discovery";
  const draftDescription =
    draft?.draftDescription ??
    "Enhance the dashboard's search capabilities to reduce the time users need to locate items.";
  const priority = draft?.priority ?? "Medium";
  const storyPoints = draft?.storyPoints ?? "5";
  const assignee = draft?.assignee ?? "Unassigned";
  const sprint = draft?.sprint ?? "Sprint 24";

  return (
    <Layout steps={buildSteps("approve")}>
      <div className="approve-page">
        {!created && (
          <>
            <div className="approve-page__intro">
              <h1>Approve &amp; create</h1>
              <p>This is the last step before anything touches Jira. Confirm the details below.</p>
            </div>

            <div className="approve-page__card">
              <div className="approve-page__card-header">
                <span className="approve-page__issue-type">{issueType}</span>
                <span className="approve-page__project">Project: PROJ</span>
              </div>
              <h3 className="approve-page__title">{draftTitle}</h3>
              <p className="approve-page__description">{draftDescription}</p>
              <div className="approve-page__meta-grid">
                <div>
                  <span className="approve-page__meta-label">Priority</span>
                  <br />
                  {priority}
                </div>
                <div>
                  <span className="approve-page__meta-label">Story points</span>
                  <br />
                  {storyPoints}
                </div>
                <div>
                  <span className="approve-page__meta-label">Assignee</span>
                  <br />
                  {assignee}
                </div>
                <div>
                  <span className="approve-page__meta-label">Sprint</span>
                  <br />
                  {sprint}
                </div>
              </div>
            </div>

            <div className="approve-page__actions">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Edit draft
              </Button>
              <Button onClick={() => setCreated(true)}>Create in Jira</Button>
            </div>
          </>
        )}

        {created && (
          <SuccessCard
            ticketId={MOCK_CREATED_TICKET_ID}
            title={draftTitle}
            onNewRequirement={() => navigate("/")}
          />
        )}
      </div>
    </Layout>
  );
}
