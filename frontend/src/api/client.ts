import type { ApprovalRequestBody, IngestResponse } from "../types/api";

const API_BASE = "http://localhost:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }
  return response.json() as Promise<T>;
}

export async function ingest(text: string): Promise<IngestResponse> {
  const response = await fetch(`${API_BASE}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handleResponse<IngestResponse>(response);
}

export async function getReview(threadId: string): Promise<IngestResponse> {
  const response = await fetch(`${API_BASE}/review/${threadId}`);
  return handleResponse<IngestResponse>(response);
}

interface ApproveReviewOptions {
  approvedPairs?: string[];
  publishApproved?: boolean;
}

export async function approveReview(
  threadId: string,
  { approvedPairs, publishApproved }: ApproveReviewOptions
): Promise<IngestResponse> {
  const body: ApprovalRequestBody = {
    approved_pairs: approvedPairs ?? [],
    publish_approved: publishApproved ?? false,
  };
  const response = await fetch(`${API_BASE}/review/${threadId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<IngestResponse>(response);
}
