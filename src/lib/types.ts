/**
 * Wire types for the Sentinel chat SSE protocol.
 * Source of truth: /Users/mathieumoullec/work/sentinel/docs/CHAT_SSE_PROTOCOL.md
 *
 * Tool-result shapes that the OpenAPI spec covers (landed cost, alerts,
 * conversations, …) are imported from `@/lib/api/generated/types.gen`. The
 * hand-written types in this file describe the SSE chunks themselves
 * (`ChatChunkT`, `ToolCallT`, `MessageT`) plus the renderer-side variants
 * we use until each tool-result shape is also surfaced through the spec.
 */

import type {
  LandedCostResponse,
  LandedCostRow,
} from "@/lib/api/generated/types.gen";

export interface UsageT {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cached_input_tokens: number;
}

export type ToolNameT =
  | "search_codes"
  | "get_code_details"
  | "get_landed_cost"
  | "find_cross_rulings"
  | "subscribe_watch"
  | "list_alerts";

export type ChatChunkT =
  | { type: "delta"; text: string }
  | { type: "reasoning"; id?: string; text: string }
  | { type: "reasoning_delta"; id?: string; text: string }
  | { type: "tool_call"; call_id: string; name: string; args: unknown }
  | {
      type: "tool_call_delta";
      call_id: string;
      delta: { kind: "name"; name: string } | { kind: "args"; text: string };
    }
  | { type: "tool_result"; call_id: string; content: unknown }
  | { type: "turn_end"; usage: UsageT }
  | { type: "error"; message: string }
  | { type: "done"; usage?: UsageT };

export interface ChatTurnT {
  role: "user" | "assistant";
  content: string;
}

/* ---------- UI-side message shape ---------- */

export type ToolCallStatusT = "in-flight" | "complete" | "failed";

export interface ToolCallT {
  id: string;
  tool: string;
  args: unknown;
  status: ToolCallStatusT;
  startedAt: number;
  durationMs?: number;
  result?: unknown;
}

export interface AssistantMessageDataT {
  id: string;
  role: "assistant";
  thinking: string;
  thinkingActive: boolean;
  thinkingMs?: number;
  thinkingStartedAt?: number;
  calls: ToolCallT[];
  reply: string;
  streaming: boolean;
  caveats?: string[];
  done: boolean;
  error?: string;
  usage?: UsageT;
}

export interface UserMessageDataT {
  id: string;
  role: "user";
  text: string;
}

export type MessageT = UserMessageDataT | AssistantMessageDataT;

/* ---------- Tool-result content shapes (best-effort, partial) ---------- */

export interface SearchCandidateT {
  code: string;
  desc_en?: string;
  desc?: string;
  fused_score?: number;
  score?: number;
}

export interface SearchCodesContentT {
  candidates: SearchCandidateT[];
}

export interface HierarchyNodeT {
  code: string;
  desc_en?: string;
  desc_fr?: string;
  general_rate?: string | null;
}

export interface CodeDetailsContentT {
  found?: boolean;
  code: string;
  desc_en?: string;
  desc_fr?: string;
  desc?: string;
  /** Backend-native shape: array of `{code, desc_en, desc_fr, general_rate}`. */
  hierarchy?: HierarchyNodeT[];
  /** Legacy/scenario shape: pre-rendered breadcrumb segments. */
  chain?: string[];
  general_rate?: string | null;
  rate_text?: string;
  mfn_rate?: string;
  units?: string | null;
  unit?: string;
  section301?: string;
  is_declarable?: boolean;
}

// Landed-cost shapes come straight from the OpenAPI spec — backend has
// shipped the canonical shape from `BACKEND_INTEGRATION.md` § 3.2 (no `*_usd`
// flat-soup fallback needed). Local aliases avoid the `no-barrel-files` rule
// that blocks pure `export … from` re-exports.
export type LandedCostContentT = LandedCostResponse;
export type LandedCostRowT = LandedCostRow;

export interface RulingItemT {
  num: string;
  date: string;
  subject: string;
  codes: string[];
  url?: string;
}

export interface CrossRulingsContentT {
  rulings: RulingItemT[];
}

export interface SubscribeWatchContentT {
  ok?: boolean;
  subscription_id?: string;
  email: string;
  codes: string[];
  sources: string[];
  cadence?: string;
  subscriptions?: unknown[];
}

export interface AlertItemT {
  date: string;
  code: string;
  source: string;
  status: string;
  subject: string;
}

export interface AlertsContentT {
  alerts: AlertItemT[];
}
