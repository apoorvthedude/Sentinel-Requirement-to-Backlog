// Mock/placeholder data for design-fidelity screens that aren't wired to real
// backend endpoints yet (Dashboard stats, History, Similar Tickets, Jira Draft
// defaults). Delete/replace piecemeal as real endpoints are added.

export type DeltaTone = "positive" | "warning" | "neutral";

export interface StatCardData {
  label: string;
  value: string;
  delta: string;
  deltaTone: DeltaTone;
}

export const MOCK_STAT_CARDS: StatCardData[] = [
  { label: "Requirements processed", value: "38", delta: "+6 this month", deltaTone: "positive" },
  { label: "Approval rate", value: "86%", delta: "+4pts vs last month", deltaTone: "positive" },
  { label: "Tickets created this week", value: "7", delta: "3 stories, 1 epic", deltaTone: "neutral" },
  { label: "Duplicate/overlap catches", value: "5", delta: "Flagged before drafting", deltaTone: "warning" },
];

export interface ActivityItem {
  text: string;
  time: string;
}

export const MOCK_ACTIVITY_ITEMS: ActivityItem[] = [
  { text: 'PROJ-1284 created from "Improve dashboard search for faster item discovery"', time: "2h ago" },
  { text: 'Approved: "Add bulk export for invoices"', time: "1d ago" },
  { text: 'Duplicate flagged: "Mobile nav" overlaps PROJ-410 (54% match)', time: "2d ago" },
  { text: 'PROJ-1201 created from "Allow CSV import of team rosters"', time: "5d ago" },
];

export interface SimilarTicket {
  id: string;
  title: string;
  status: string;
  matchPercent: string;
}

export const MOCK_SIMILAR_TICKETS: SimilarTicket[] = [
  { id: "PROJ-482", title: "Global search returns stale results", status: "In Progress", matchPercent: "78%" },
  { id: "PROJ-410", title: "Add filters to dashboard list view", status: "Backlog", matchPercent: "54%" },
];

export type HistoryStatus = "Created" | "Pending Approval" | "Draft";

export interface HistoryRow {
  title: string;
  status: HistoryStatus;
  ticket: string;
  date: string;
}

export const MOCK_HISTORY_ITEMS: HistoryRow[] = [
  { title: "Improve dashboard search for faster item discovery", status: "Created", ticket: "PROJ-1284", date: "Aug 18" },
  { title: "Add bulk export for invoices", status: "Pending Approval", ticket: "—", date: "Aug 15" },
  { title: "Mobile nav is hard to reach one-handed", status: "Draft", ticket: "—", date: "Aug 12" },
  { title: "Allow CSV import of team rosters", status: "Created", ticket: "PROJ-1201", date: "Aug 5" },
];

export const MOCK_DUPLICATE_TICKET_ID = "PROJ-482";

export interface ChildStory {
  id: string;
  title: string;
  description: string;
  points: string;
  priority: "Low" | "Medium" | "High";
}

export const DEFAULT_CHILD_STORIES: ChildStory[] = [
  {
    id: "child-1",
    title: "Add debounced search input with loading state",
    description:
      "Wire the dashboard search box to fire queries after a short pause instead of on every keystroke.",
    points: "3",
    priority: "Medium",
  },
  {
    id: "child-2",
    title: "Rank results by relevance and recency",
    description:
      "Update the query to score exact title matches higher and boost recently touched items.",
    points: "5",
    priority: "High",
  },
];

export interface AcceptanceCriterion {
  id: string;
  text: string;
}

export const DEFAULT_ACCEPTANCE_CRITERIA: AcceptanceCriterion[] = [
  { id: "ac-1", text: "Search results return in under 300ms for queries against the current backlog index." },
  { id: "ac-2", text: "Results are ranked by relevance, with exact title matches surfaced first." },
  { id: "ac-3", text: "Search input is keyboard-accessible and supports arrow-key navigation of results." },
];

export const MOCK_CREATED_TICKET_ID = "PROJ-1284";
