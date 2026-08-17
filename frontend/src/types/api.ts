export interface SRSRequirementEntry {
  id: string;
  title: string;
  description: string;
  actor: string | null;
  related_screen: string | null;
  dependencies: string[];
}

export interface SRSDocument {
  input_id: string;
  title: string;
  summary: string;
  requirements: SRSRequirementEntry[];
  generated_at: string;
}

export type MatchSource = "embedding" | "structural";

export interface DependencyMatch {
  matched_requirement_id: string;
  matched_input_id: string;
  matched_title: string;
  similarity_score: number;
  confirmed: boolean;
  match_source: MatchSource;
}

export interface RequirementDependencyResult {
  requirement_id: string;
  flagged_matches: DependencyMatch[];
}

export interface QualityScore {
  requirement_id: string;
  score: number;
  reasoning: string;
  flagged: boolean;
}

export interface PublishedStory {
  requirement_id: string;
  jira_key: string;
  jira_url: string;
}

export interface PublishResult {
  epic_key: string;
  epic_url: string;
  stories: PublishedStory[];
  confluence_page_id: string;
  confluence_url: string;
}

export type GuardrailCategory = "quality" | "safety" | null;

export interface GuardrailResult {
  passed: boolean;
  reason: string;
  category: GuardrailCategory;
}

export type PendingReviewReason =
  | "flagged_dependencies_require_review"
  | "publish_approval_required";

export interface DependencyReviewPayload {
  reason: "flagged_dependencies_require_review";
  dependency_results: RequirementDependencyResult[];
  quality_scores: QualityScore[];
}

export interface PublishApprovalPayload {
  reason: "publish_approval_required";
  srs: SRSDocument;
}

export type PendingReview = DependencyReviewPayload | PublishApprovalPayload;

export type RunStatus = "pending_review" | "completed" | "rejected";

export interface UsageStats {
  latency_seconds: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  llm_call_count: number;
}

export interface IngestResponse {
  thread_id: string;
  status: RunStatus;
  original_text: string | null;
  pending_review: PendingReview | null;
  srs: SRSDocument | null;
  publish_result: PublishResult | null;
  rejection: GuardrailResult | null;
  usage_stats: UsageStats | null;
}

export interface ApprovalRequestBody {
  approved_pairs?: string[];
  publish_approved?: boolean;
}
