import { Clock, Coins } from "lucide-react";
import type { UsageStats } from "../../types/api";
import "./UsageBadge.css";

interface UsageBadgeProps {
  stats: UsageStats;
}

type LatencyLevel = "fast" | "moderate" | "slow";

function getLatencyLevel(seconds: number): LatencyLevel {
  if (seconds < 3) return "fast";
  if (seconds <= 8) return "moderate";
  return "slow";
}

function formatTokens(tokens: number): string {
  return tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : String(tokens);
}

export default function UsageBadge({ stats }: UsageBadgeProps) {
  const level = getLatencyLevel(stats.latency_seconds);

  return (
    <div className="usage-badge" title={`${stats.llm_call_count} LLM call(s)`}>
      <span className={`usage-badge__pill usage-badge__pill--${level}`}>
        <Clock size={12} />
        {stats.latency_seconds.toFixed(1)}s
      </span>
      <span className="usage-badge__pill usage-badge__pill--neutral">
        <Coins size={12} />
        {formatTokens(stats.total_tokens)} tokens
      </span>
    </div>
  );
}
