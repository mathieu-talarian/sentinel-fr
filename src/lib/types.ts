/**
 * Wire types for the Sentinel chat SSE protocol.
 * Source of truth: /Users/mathieumoullec/work/sentinel/docs/CHAT_SSE_PROTOCOL.md
 *
 * Tool-result shapes that the OpenAPI spec covers (search, code details,
 * landed cost, alerts, conversations, …) are imported from
 * `@/lib/api/generated/types.gen` — those are the canonical contracts. The
 * hand-written types in this file describe the SSE chunks themselves
 * (`ChatChunkT`, `ToolCallT`, `MessageT`) which the spec doesn't model
 * (chat/stream is typed `unknown`), plus tool-result shapes that don't yet
 * have a REST mirror in the spec (`CrossRulingsContentT`,
 * `SubscribeWatchContentT`).
 */

import type {
  AlertItem,
  AlertsResponse,
  CommodityBody,
  CommodityHierarchyEntry,
  LandedCostResponse,
  LandedCostRow,
  SearchBody,
  SearchCandidate,
  WatchSubscribeResponse,
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

/* ---------- Tool-result content shapes ----------
 *
 * Aliases of the OpenAPI-generated types. The backend ships these same
 * shapes via REST (e.g. `POST /search`, `GET /code/{code}`) AND inside
 * SSE `tool_result.content`. Local aliases avoid the `no-barrel-files`
 * rule that blocks pure `export … from` re-exports.
 */

export type SearchCandidateT = SearchCandidate;
export type SearchCodesContentT = SearchBody;

export type HierarchyNodeT = CommodityHierarchyEntry;
export type CodeDetailsContentT = CommodityBody;

export type LandedCostContentT = LandedCostResponse;
export type LandedCostRowT = LandedCostRow;

export type AlertItemT = AlertItem;
export type AlertsContentT = AlertsResponse;

export type SubscribeWatchContentT = WatchSubscribeResponse;

/* ---------- Tool-result shapes not yet in the OpenAPI spec ---------- */

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
