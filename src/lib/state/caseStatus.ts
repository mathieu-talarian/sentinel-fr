import type {
  ImportCaseLineItemT,
  ImportCaseStatusT,
  ImportCaseT,
} from "@/lib/types";

/**
 * Derive the 7-value FE-only `ImportCaseStatusT` from a server `ImportCaseT`.
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
const lineIsQuotable = (line: ImportCaseLineItemT): boolean =>
  Boolean(line.selectedHtsCode) && line.customsValueUsd != null;

const lineIsClassifying = (line: ImportCaseLineItemT): boolean =>
  line.classificationState === "candidates";

const lineNeedsClassificationReview = (line: ImportCaseLineItemT): boolean =>
  line.classificationState === "needsReview";

const isMissingCaseFacts = (c: ImportCaseT): boolean =>
  !c.transport ||
  !c.countryOfOrigin ||
  c.declaredValueUsd == null ||
  c.lineItems.length === 0;

export function selectCaseStatus(c: ImportCaseT): ImportCaseStatusT {
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
  if (!c.lastRiskScreenedAt) return "quoted";

  // Risk screen has run and quote exists. Whether the risk result returned
  // flags is not yet on `ImportCaseResponse` — backend currently exposes
  // only `lastRiskScreenedAt`. Treat presence of the timestamp as "screen
  // has run cleanly"; Phase 7 will refine this when the risk summary lands.
  return "readyForBroker";
}
