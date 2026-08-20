import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import IssueTypePicker, { type IssueType } from "../components/IssueTypePicker";
import AcceptanceCriteriaEditor from "../components/AcceptanceCriteriaEditor";
import ChildStoryCard from "../components/ChildStoryCard";
import SidebarField from "../components/SidebarField";
import DuplicateTicketCard, { type DuplicateChoice } from "../components/DuplicateTicketCard";
import { buildSteps } from "../lib/steps";
import {
  DEFAULT_ACCEPTANCE_CRITERIA,
  DEFAULT_CHILD_STORIES,
  MOCK_DUPLICATE_TICKET_ID,
  type ChildStory,
} from "../mockData";
import type { IngestResponse } from "../types/api";
import "./DraftPage.css";

interface LocationState {
  ingestResponse?: IngestResponse;
}

export interface DraftState {
  issueType: IssueType;
  draftTitle: string;
  draftDescription: string;
  storyPoints: string;
  priority: ChildStory["priority"];
  assignee: string;
  sprint: string;
  duplicateChoice: DuplicateChoice;
}

const POINTS_OPTIONS = ["1", "2", "3", "5", "8"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const ASSIGNEE_OPTIONS = ["Unassigned", "Amit Gupta", "Priya Nair", "Sam Torres"];
const SPRINT_OPTIONS = ["Backlog", "Sprint 24", "Sprint 25"];

export default function DraftPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const ingestResponse = (location.state as LocationState | null)?.ingestResponse;
  const srs =
    ingestResponse?.status === "completed"
      ? ingestResponse.srs
      : ingestResponse?.status === "pending_review" &&
          ingestResponse.pending_review?.reason === "publish_approval_required"
        ? ingestResponse.pending_review.srs
        : null;

  const [issueType, setIssueType] = useState<IssueType>("Story");
  const [draftTitle, setDraftTitle] = useState(
    srs?.title ?? "Improve dashboard search for faster item discovery"
  );
  const [draftDescription, setDraftDescription] = useState(
    srs?.summary ??
      "Enhance the dashboard's search capabilities to reduce the time users need to locate items."
  );
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(DEFAULT_ACCEPTANCE_CRITERIA);
  const [childStories, setChildStories] = useState<ChildStory[]>(DEFAULT_CHILD_STORIES);
  const [storyPoints, setStoryPoints] = useState("5");
  const [priority, setPriority] = useState<ChildStory["priority"]>("Medium");
  const [assignee, setAssignee] = useState("Unassigned");
  const [sprint, setSprint] = useState("Sprint 24");
  const [duplicateChoice, setDuplicateChoice] = useState<DuplicateChoice>("new");

  function updateChildStory(id: string, updated: ChildStory) {
    setChildStories((stories) => stories.map((s) => (s.id === id ? updated : s)));
  }

  function removeChildStory(id: string) {
    setChildStories((stories) => stories.filter((s) => s.id !== id));
  }

  function addChildStory() {
    setChildStories((stories) => [
      ...stories,
      {
        id: crypto.randomUUID(),
        title: "Untitled story",
        description: "",
        points: "3",
        priority: "Medium",
      },
    ]);
  }

  function handleContinue() {
    const draftState: DraftState = {
      issueType,
      draftTitle,
      draftDescription,
      storyPoints,
      priority,
      assignee,
      sprint,
      duplicateChoice,
    };
    navigate(`/approve/${threadId}`, { state: { ...draftState, ingestResponse } });
  }

  return (
    <Layout steps={buildSteps("draft")}>
      <div className="draft-page">
        <div className="draft-page__intro">
          <h1>Draft Jira Story</h1>
          <p>Review and edit every field before it goes to Jira. Nothing is created yet.</p>
        </div>

        <div className="draft-page__grid">
          <div className="draft-page__main">
            <IssueTypePicker value={issueType} onChange={setIssueType} />

            <div className="draft-page__field">
              <label className="draft-page__field-label">Title</label>
              <input
                className="draft-page__title-input"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
              />
            </div>

            <div className="draft-page__field">
              <label className="draft-page__field-label">Description</label>
              <textarea
                className="draft-page__description-input"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
              />
            </div>

            {issueType === "Epic" ? (
              <div className="draft-page__field">
                <label className="draft-page__field-label">Stories in this epic</label>
                <div className="draft-page__child-stories">
                  {childStories.map((story) => (
                    <ChildStoryCard
                      key={story.id}
                      story={story}
                      onChange={(updated) => updateChildStory(story.id, updated)}
                      onRemove={() => removeChildStory(story.id)}
                    />
                  ))}
                  <button
                    type="button"
                    className="draft-page__add-story"
                    onClick={addChildStory}
                  >
                    + Add story
                  </button>
                </div>
              </div>
            ) : (
              <AcceptanceCriteriaEditor
                criteria={acceptanceCriteria}
                onChange={setAcceptanceCriteria}
              />
            )}
          </div>

          <div className="draft-page__sidebar">
            <div className="draft-page__sidebar-card">
              <SidebarField
                label="Story points"
                value={storyPoints}
                onChange={setStoryPoints}
                options={POINTS_OPTIONS}
              />
              <SidebarField
                label="Priority"
                value={priority}
                onChange={(v) => setPriority(v as ChildStory["priority"])}
                options={PRIORITY_OPTIONS}
              />
              <SidebarField
                label="Assignee"
                value={assignee}
                onChange={setAssignee}
                options={ASSIGNEE_OPTIONS}
              />
              <SidebarField
                label="Sprint"
                value={sprint}
                onChange={setSprint}
                options={SPRINT_OPTIONS}
              />
              <div>
                <label className="draft-page__field-label">Labels</label>
                <div className="draft-page__labels">
                  <span className="draft-page__label-tag">users</span>
                  <span className="draft-page__label-tag">dashboard</span>
                  <span className="draft-page__label-tag">search</span>
                </div>
              </div>
            </div>

            <DuplicateTicketCard
              ticketId={MOCK_DUPLICATE_TICKET_ID}
              choice={duplicateChoice}
              onChange={setDuplicateChoice}
            />
          </div>
        </div>

        <div className="draft-page__actions">
          <Button
            variant="secondary"
            onClick={() => threadId && navigate(`/analyze/${threadId}`, { state: { ingestResponse } })}
          >
            Back
          </Button>
          <Button onClick={handleContinue}>Continue to Approve</Button>
        </div>
      </div>
    </Layout>
  );
}
