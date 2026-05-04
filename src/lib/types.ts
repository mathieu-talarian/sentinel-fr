/**
 * Wire types for the Sentinel chat SSE protocol.
 * Source of truth: /Users/mathieumoullec/work/sentinel/docs/CHAT_SSE_PROTOCOL.md
 */

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

export interface LandedCostRowT {
  label: string;
  amount: number;
  sub?: string;
}

export interface LandedCostContentT {
  code?: string;
  rows?: LandedCostRowT[];
  declared_value_usd?: number;
  customs_value_usd?: number;
  duty_amount_usd?: number;
  mpf_usd?: number;
  hmf_usd?: number;
  freight_usd?: number;
  total_fees_usd?: number;
  landed_cost_usd?: number;
  total?: number;
  rate_text?: string | null;
  rate_source_code?: string | null;
  duty_kind?: string;
  transport?: string;
  caveats?: string[];
}

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
