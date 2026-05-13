import type { RiskScreenStatusT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import {
  borders,
  colors,
  fonts,
  radii,
  risk,
} from "@/lib/styles/tokens.stylex";

/**
 * Header chip for the risk panel. `clear` is green; `needsReview` is
 * amber (review-level); `incomplete` is neutral (means "we couldn't
 * finish the screen — usually missing facts"). When no screen has ever
 * run, the panel uses `"notRun"` which renders dashed.
 */
export type RiskStatusChipValueT = RiskScreenStatusT | "notRun";

interface RiskStatusChipPropsT {
  status: RiskStatusChipValueT;
}

const LABELS: Record<RiskStatusChipValueT, string> = {
  clear: "Clear",
  needsReview: "Needs review",
  incomplete: "Incomplete",
  notRun: "Not checked",
};

export function RiskStatusChip(props: Readonly<RiskStatusChipPropsT>) {
  return (
    <span {...sx(s.chip, TONE[props.status])}>{LABELS[props.status]}</span>
  );
}

const s = stylex.create({
  chip: {
    padding: "2px 7px",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    fontFamily: fonts.sans,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
});

const TONE = stylex.create({
  clear: {
    borderColor: colors.okSoft,
    backgroundColor: colors.okSoft,
    color: colors.ok,
  },
  needsReview: {
    borderColor: risk.bgReview,
    backgroundColor: risk.bgReview,
    color: risk.fgReview,
  },
  incomplete: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
    color: colors.ink3,
  },
  notRun: {
    borderColor: colors.line,
    backgroundColor: "transparent",
    color: colors.ink4,
  },
});
