/**
 * Sentinel chat UI types — render-state shapes that have no wire
 * equivalent. Wire types come straight from `@/lib/api/generated/types.gen`;
 * consumers import them directly.
 *
 * `find_cross_rulings` has no REST mirror in the spec yet, so
 * `RulingItemT` / `CrossRulingsContentT` stay hand-written here.
 *
 * `ImportCasePersistedStatusT`, `ImportCaseStatusT`, and
 * `LineItemClassificationStateT` are FE-only enums narrowed from the
 * server's free-form `string` fields.
 */

import type { UsageInfoT } from "@/lib/api/generated/types.gen";

export type ToolNameT =
  | "search_codes"
  | "get_code_details"
  | "get_landed_cost"
  | "find_cross_rulings"
  | "subscribe_watch"
  | "list_alerts";

/**
 * Stricter `role` than the generated `ChatTurnT` (which is `string` on
 * the wire). Used by the streaming request-body builder.
 */
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
  usage?: UsageInfoT;
}

export interface UserMessageDataT {
  id: string;
  role: "user";
  text: string;
}

export type MessageT = UserMessageDataT | AssistantMessageDataT;

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

/* ---------- FE-only narrowed enums ---------- */

/**
 * Server-persisted case status (backend spec §4.2). This is the user's
 * filing decision, set explicitly via `PATCH /import-cases/{id}`.
 *
 * Distinct from `ImportCaseStatusT` (the 7-value FE-derived UI status) —
 * see `selectCaseStatus` in `src/lib/state/caseStatus.ts`.
 */
export type ImportCasePersistedStatusT =
  | "draft"
  | "ready_for_review"
  | "archived";

/**
 * Client-derived case status used by the workbench UI. Computed from line
 * classification state, quote presence, and risk results — except when the
 * persisted status is `archived`, which always wins (decision 4).
 *
 * Defined per `FRONTEND_IMPORT_CASE_WORKBENCH.md` §Case Status Model.
 */
export type ImportCaseStatusT =
  | "draft"
  | "classifying"
  | "readyForQuote"
  | "quoted"
  | "needsReview"
  | "readyForBroker"
  | "archived";

/**
 * Line-item classification state surfaced from the backend (`string` on the
 * wire — narrowed here to the known enum). Order mirrors the FE doc:
 *   unclassified → candidates → selected → needsReview.
 */
export type LineItemClassificationStateT =
  | "unclassified"
  | "candidates"
  | "selected"
  | "needsReview";
