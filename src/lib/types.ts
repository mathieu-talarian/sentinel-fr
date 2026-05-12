/**
 * Wire types for the Sentinel chat. Tool-result shapes, the SSE
 * `ChatChunk` discriminated union, and `UsageInfo` all come from the
 * OpenAPI spec via `@/lib/api/generated/types.gen`. This file's role is
 * down to:
 *   - thin local aliases that feed the renderer organisms (so they
 *     don't import generated types directly and the `no-barrel-files`
 *     rule stays satisfied);
 *   - the UI-side message shapes (`MessageT`, `AssistantMessageDataT`,
 *     `UserMessageDataT`, `ToolCallT`) — those are render-state, not
 *     wire shapes, and don't have a spec equivalent.
 *
 * The two remaining hand-written wire types are `RulingItemT` /
 * `CrossRulingsContentT` — `find_cross_rulings` doesn't have a REST
 * mirror in the spec yet.
 */

import type {
  AlertItem,
  AlertsResponse,
  AppliedSurcharge,
  ChatChunk,
  CommodityBody,
  CommodityHierarchyEntry,
  LandedCostResponse,
  LandedCostRow,
  SearchBody,
  SearchCandidate,
  UsageInfo,
  WatchSubscribeResponse,
} from "@/lib/api/generated/types.gen";

export type UsageT = UsageInfo;

export type ToolNameT =
  | "search_codes"
  | "get_code_details"
  | "get_landed_cost"
  | "find_cross_rulings"
  | "subscribe_watch"
  | "list_alerts";

export type ChatChunkT = ChatChunk;

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
  /** Set by `toolError` chunks; a short backend-issued error code. */
  errorCode?: string;
  /** Set by `toolError` chunks; human-readable message. */
  errorMessage?: string;
}

export interface AssistantMessageDataT {
  id: string;
  role: "assistant";
  /**
   * Server-issued message id from the `turnStart` chunk. Used for
   * conversation persistence; the in-tree `id` stays as the FE-minted
   * uuid so the reducer can keep finding the message.
   */
  serverId?: string;
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
export type AppliedSurchargeT = AppliedSurcharge;

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
