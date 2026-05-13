import type { LineItemClassificationStateT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

const LABELS: Record<LineItemClassificationStateT, string> = {
  unclassified: "Unclassified",
  candidates: "Candidates",
  selected: "Selected",
  needsReview: "Needs review",
};

const KNOWN = new Set<LineItemClassificationStateT>([
  "unclassified",
  "candidates",
  "selected",
  "needsReview",
]);

const asKnown = (state: string): LineItemClassificationStateT =>
  KNOWN.has(state as LineItemClassificationStateT)
    ? (state as LineItemClassificationStateT)
    : "unclassified";

interface ClassificationStateChipPropsT {
  /** Wire shape is `string`; we narrow to the known enum. */
  state: string;
}

export function ClassificationStateChip(
  props: Readonly<ClassificationStateChipPropsT>,
) {
  const state = asKnown(props.state);
  return <span {...sx(s.chip, TONE[state])}>{LABELS[state]}</span>;
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
  unclassified: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
    color: colors.ink3,
  },
  candidates: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
    color: colors.ink3,
  },
  selected: {
    borderColor: colors.okSoft,
    backgroundColor: colors.okSoft,
    color: colors.ok,
  },
  needsReview: {
    borderColor: colors.warnSoft,
    backgroundColor: colors.warnSoft,
    color: colors.warn,
  },
});
