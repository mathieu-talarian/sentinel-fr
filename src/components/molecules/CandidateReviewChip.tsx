import type { CandidateReviewSummaryT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface CandidateReviewChipPropsT {
  summary: CandidateReviewSummaryT;
  onClick: () => void;
}

/**
 * Click-target chip surfacing a line's candidate review state. Opens
 * `CandidatesReviewDialog` on click. Three counts (pending / accepted /
 * rejected) render in dedicated pills only when non-zero so the chip
 * stays compact when most candidates are already settled.
 */
export function CandidateReviewChip(
  props: Readonly<CandidateReviewChipPropsT>,
) {
  const { summary } = props;
  if (summary.total === 0) return null;
  return (
    <button type="button" onClick={props.onClick} {...sx(s.chip)}>
      <span {...sx(s.label)}>Candidates</span>
      {summary.pending > 0 && (
        <span {...sx(s.pill, s.pending)} aria-label="Pending">
          {summary.pending}
        </span>
      )}
      {summary.accepted > 0 && (
        <span {...sx(s.pill, s.accepted)} aria-label="Accepted">
          ✓ {summary.accepted}
        </span>
      )}
      {summary.rejected > 0 && (
        <span {...sx(s.pill, s.rejected)} aria-label="Rejected">
          ✕ {summary.rejected}
        </span>
      )}
    </button>
  );
}

const s = stylex.create({
  chip: {
    padding: "3px 8px",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    alignItems: "center",
    backgroundColor: {
      default: colors.paper2,
      ":hover": colors.paper3,
    },
    color: colors.ink2,
    cursor: "pointer",
    display: "inline-flex",
    fontFamily: fonts.sans,
    fontSize: 11,
  },
  label: {
    color: colors.ink4,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  pill: {
    padding: "0 6px",
    borderRadius: radii.sm,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1.6,
  },
  pending: { backgroundColor: colors.warnSoft, color: colors.warn },
  accepted: { backgroundColor: colors.okSoft, color: colors.ok },
  rejected: { backgroundColor: colors.errSoft, color: colors.err },
});
