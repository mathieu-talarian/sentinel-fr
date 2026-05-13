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
  AlertItemT as AlertItemGen,
  AlertsResponseT as AlertsResponseGen,
  AppliedSurchargeT as AppliedSurchargeGen,
  CasePatchT as CasePatchGen,
  ChatChunkT as ChatChunkGen,
  CommodityBodyT as CommodityBodyGen,
  CommodityHierarchyEntryT as CommodityHierarchyEntryGen,
  CreateCaseBodyT as CreateCaseBodyGen,
  CreateLineItemBodyT as CreateLineItemBodyGen,
  CreateQuoteBodyT as CreateQuoteBodyGen,
  FeeScheduleRefViewT as FeeScheduleRefViewGen,
  ImportCaseLineItemResponseT as ImportCaseLineItemResponseGen,
  ImportCaseResponseT as ImportCaseResponseGen,
  ImportCaseSummaryT as ImportCaseSummaryGen,
  LandedCostQuoteLineResponseT as LandedCostQuoteLineResponseGen,
  LandedCostQuoteResponseT as LandedCostQuoteResponseGen,
  LandedCostQuoteSummaryItemT as LandedCostQuoteSummaryItemGen,
  LandedCostResponseT as LandedCostResponseGen,
  LandedCostRowT as LandedCostRowGen,
  PatchCaseBodyT as PatchCaseBodyGen,
  PatchLineItemBodyT as PatchLineItemBodyGen,
  QuoteSummaryT as QuoteSummaryGen,
  RiskFlagCodeT as RiskFlagCodeGen,
  RiskFlagT as RiskFlagGen,
  RiskScreenResponseT as RiskScreenResponseGen,
  RiskScreenStatusT as RiskScreenStatusGen,
  RiskSeverityT as RiskSeverityGen,
  SearchBodyT as SearchBodyGen,
  SearchCandidateT as SearchCandidateGen,
  SourceRefT as SourceRefGen,
  UsageInfoT as UsageInfoGen,
  WatchSubscribeResponseT as WatchSubscribeResponseGen,
} from "@/lib/api/generated/types.gen";

export type UsageT = UsageInfoGen;

export type ToolNameT =
  | "search_codes"
  | "get_code_details"
  | "get_landed_cost"
  | "find_cross_rulings"
  | "subscribe_watch"
  | "list_alerts";

export type ChatChunkT = ChatChunkGen;

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

export type SearchCandidateT = SearchCandidateGen;
export type SearchCodesContentT = SearchBodyGen;

export type HierarchyNodeT = CommodityHierarchyEntryGen;
export type CodeDetailsContentT = CommodityBodyGen;

export type LandedCostContentT = LandedCostResponseGen;
export type LandedCostRowT = LandedCostRowGen;
export type AppliedSurchargeT = AppliedSurchargeGen;

export type AlertItemT = AlertItemGen;
export type AlertsContentT = AlertsResponseGen;

export type SubscribeWatchContentT = WatchSubscribeResponseGen;

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

/* ---------- Import-case shapes (backend Phase 2) ---------- */

export type ImportCaseSummaryT = ImportCaseSummaryGen;
export type ImportCaseT = ImportCaseResponseGen;
export type ImportCaseLineItemT = ImportCaseLineItemResponseGen;
export type CreateCaseBodyT = CreateCaseBodyGen;
export type PatchCaseBodyT = PatchCaseBodyGen;
export type CreateLineItemBodyT = CreateLineItemBodyGen;
export type PatchLineItemBodyT = PatchLineItemBodyGen;

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

/* ---------- Landed-cost quote shapes (backend Step 3) ---------- */

export type LandedCostQuoteT = LandedCostQuoteResponseGen;
export type LandedCostQuoteLineT = LandedCostQuoteLineResponseGen;
export type LandedCostQuoteSummaryT = QuoteSummaryGen;
export type LandedCostQuoteSummaryItemT = LandedCostQuoteSummaryItemGen;
export type CreateQuoteBodyT = CreateQuoteBodyGen;
export type FeeScheduleRefT = FeeScheduleRefViewGen;

/* ---------- Case-aware chat patch suggestions (backend Step 4) ---------- */

export type CasePatchT = CasePatchGen;

/* ---------- Risk screen (backend Step 5) ---------- */

export type RiskFlagT = RiskFlagGen;
export type RiskFlagCodeT = RiskFlagCodeGen;
export type RiskScreenT = RiskScreenResponseGen;
export type RiskScreenStatusT = RiskScreenStatusGen;
export type RiskSeverityT = RiskSeverityGen;
export type SourceRefT = SourceRefGen;
