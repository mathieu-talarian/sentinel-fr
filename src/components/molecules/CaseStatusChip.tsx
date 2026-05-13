import type { ImportCaseStatusT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

/**
 * Renders the FE-derived `ImportCaseStatusT` or the server-persisted
 * status enum as a colored chip. Persisted values (`draft` /
 * `ready_for_review` / `archived`) accept the same component because the
 * derived enum is a superset for those three values.
 *
 * Color scale follows the workbench convention: neutral for in-progress
 * states, gold for "ready", green for terminal-good, red for blocked.
 */
export type CaseStatusChipValueT =
  | ImportCaseStatusT
  // Server-persisted enum; overlaps with derived for `draft` / `archived`.
  | "ready_for_review";

const LABELS: Record<CaseStatusChipValueT, string> = {
  draft: "Draft",
  classifying: "Classifying",
  readyForQuote: "Ready for quote",
  quoted: "Quoted",
  needsReview: "Needs review",
  readyForBroker: "Ready for broker",
  ready_for_review: "Ready for review",
  archived: "Archived",
};

interface CaseStatusChipPropsT {
  status: CaseStatusChipValueT;
}

export function CaseStatusChip(props: Readonly<CaseStatusChipPropsT>) {
  return (
    <span {...sx(s.chip, TONE[props.status])}>{LABELS[props.status]}</span>
  );
}

const s = stylex.create({
  chip: {
    padding: "1px 6px",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    fontFamily: fonts.sans,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
});

const TONE = stylex.create({
  draft: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
    color: colors.ink3,
  },
  classifying: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
    color: colors.ink3,
  },
  readyForQuote: {
    borderColor: colors.goldSoft,
    backgroundColor: colors.goldSoft,
    color: colors.goldDeep,
  },
  quoted: {
    borderColor: colors.goldSoft,
    backgroundColor: colors.goldSoft,
    color: colors.goldDeep,
  },
  needsReview: {
    borderColor: colors.warnSoft,
    backgroundColor: colors.warnSoft,
    color: colors.warn,
  },
  readyForBroker: {
    borderColor: colors.okSoft,
    backgroundColor: colors.okSoft,
    color: colors.ok,
  },
  ready_for_review: {
    borderColor: colors.warnSoft,
    backgroundColor: colors.warnSoft,
    color: colors.warn,
  },
  archived: {
    borderColor: colors.line,
    backgroundColor: "transparent",
    color: colors.ink4,
  },
});
