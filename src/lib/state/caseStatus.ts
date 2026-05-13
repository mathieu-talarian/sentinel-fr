import type {
  ImportCaseLineItemResponseT,
  ImportCaseResponseT,
  RiskScreenResponseT,
} from "@/lib/api/generated/types.gen";
import type { ImportCaseStatusT } from "@/lib/types";

/**
 * Derive the 7-value FE-only `ImportCaseStatusT` from a server `ImportCaseResponseT`.
 *
 * Persisted status (`draft | ready_for_review | archived`) is the user's
 * filing decision; the derived value reflects pipeline progress.
 *
 * Asymmetry (decision 4): `archived` on the persisted side always wins —
 * an archived case is read-only regardless of what its line items or
 * quote/risk timestamps say. All other persisted states fall through to
 * derivation.
 *
 * Order of checks mirrors `FRONTEND_IMPORT_CASE_WORKBENCH.md` §Case Status
 * Model:
 *   draft         — no line items or any line is missing required facts
 *   classifying   — at least one line is mid-classification
 *   readyForQuote — every quoted line has a selected HTS code & value
 *   quoted        — a landed-cost quote has been generated
 *   needsReview   — risk screen flagged review items
 *   readyForBroker— quote + risk-clean (Phase 8 will tighten this once
 *                   the evidence panel can attest attached rulings)
 */

/**
 * A line is "ready for quote" when it has a selected HTS code AND a customs
 * value. The backend will reject a quote request when either is missing.
 */
const lineIsQuotable = (line: ImportCaseLineItemResponseT): boolean =>
  Boolean(line.selectedHtsCode) && line.customsValueUsd != null;

const lineIsClassifying = (line: ImportCaseLineItemResponseT): boolean =>
  line.classificationState === "candidates";

const lineNeedsClassificationReview = (
  line: ImportCaseLineItemResponseT,
): boolean => line.classificationState === "needsReview";

export type MissingCaseFactKeyT =
  | "transport"
  | "countryOfOrigin"
  | "declaredValueUsd"
  | "lineItems";

export type MissingLineFactKeyT = "selectedHtsCode" | "customsValueUsd";

/**
 * Returns the case-level facts that haven't been filled in yet. Drives
 * the "missing fields" chips in the workbench header + `CaseFactsPanel`.
 */
export function selectMissingCaseFacts(
  c: ImportCaseResponseT,
): MissingCaseFactKeyT[] {
  const missing: MissingCaseFactKeyT[] = [];
  if (!c.transport) missing.push("transport");
  if (!c.countryOfOrigin) missing.push("countryOfOrigin");
  if (c.declaredValueUsd == null) missing.push("declaredValueUsd");
  if (c.lineItems.length === 0) missing.push("lineItems");
  return missing;
}

/**
 * Returns the line-level facts blocking a quote on this line. A line is
 * quotable when it has a selected HTS code AND a customs value.
 */
export function selectMissingLineFacts(
  line: ImportCaseLineItemResponseT,
): MissingLineFactKeyT[] {
  const missing: MissingLineFactKeyT[] = [];
  if (!line.selectedHtsCode) missing.push("selectedHtsCode");
  if (line.customsValueUsd == null) missing.push("customsValueUsd");
  return missing;
}

const isMissingCaseFacts = (c: ImportCaseResponseT): boolean =>
  selectMissingCaseFacts(c).length > 0;

export function selectCaseStatus(
  c: ImportCaseResponseT,
  riskScreen?: RiskScreenResponseT | null,
): ImportCaseStatusT {
  // Persisted "archived" always wins — case is read-only regardless of data.
  // Other persisted values (`draft`, `ready_for_review`) are informational;
  // archive affordances read the raw `c.status` separately.
  if (c.status === "archived") return "archived";

  if (c.lineItems.some((l) => lineNeedsClassificationReview(l))) {
    return "needsReview";
  }
  if (c.lineItems.some((l) => lineIsClassifying(l))) return "classifying";
  if (isMissingCaseFacts(c)) return "draft";
  if (!c.lineItems.every((l) => lineIsQuotable(l))) return "draft";

  // From here all quoted lines have selected HTS + value. Quote/risk
  // progression decides the next state.
  if (!c.lastQuotedAt) return "readyForQuote";

  // Phase 7: when the caller passes in the latest risk screen we use its
  // verdict directly. Otherwise fall back to the timestamp-only check —
  // older call sites and selectors that only have access to the case
  // shape don't need to know.
  if (riskScreen) {
    if (riskScreen.status === "needsReview") return "needsReview";
    if (riskScreen.status === "clear") return "readyForBroker";
    return "quoted";
  }
  if (!c.lastRiskScreenedAt) return "quoted";

  // Risk screen has run and quote exists. Whether the risk result returned
  // flags is not yet on `ImportCaseResponse` — backend currently exposes
  // only `lastRiskScreenedAt`. Treat presence of the timestamp as "screen
  // has run cleanly"; Phase 7 will refine this when the risk summary lands.
  return "readyForBroker";
}
