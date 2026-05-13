import type { CandidateViewT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { Button } from "@/components/atoms/Button";
import { HtsCodeBadge } from "@/components/molecules/HtsCodeBadge";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatPercent } from "@/lib/utils/intl";

interface CandidateRowPropsT {
  candidate: CandidateViewT;
  /** Whether this candidate matches the line's `selectedHtsCode`. */
  isSelected: boolean;
  /** Per-action busy state. Only one action is in flight at a time. */
  busy: null | "accepting" | "rejecting" | "deleting";
  isReadOnly: boolean;
  lang: "en" | "fr";
  onAccept: () => void;
  onReject: () => void;
  onDelete: () => void;
}

const STATE_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

const pickStateTone = (
  state: string,
): (typeof stateStyles)[keyof typeof stateStyles] => {
  if (state === "accepted") return stateStyles.accepted;
  if (state === "rejected") return stateStyles.rejected;
  return stateStyles.pending;
};

const pickShortDescription = (raw: CandidateViewT["description"]): string => {
  if (raw == null) return "";
  const en = raw.en;
  if (typeof en === "string") return en;
  const fr = raw.fr;
  if (typeof fr === "string") return fr;
  return "";
};

/**
 * One candidate inside `CandidatesReviewDialog`. Renders the code, a
 * short description (when present), the source + score, and the three
 * actions: Accept / Reject / Delete. Accept is disabled when the
 * candidate is already accepted; Delete is always available so the
 * user can clean up classify-noise.
 */
export function CandidateRow(props: Readonly<CandidateRowPropsT>) {
  const { candidate, isSelected, busy, isReadOnly } = props;
  const description = pickShortDescription(candidate.description);

  return (
    <article {...sx(s.row, isSelected && s.rowSelected)}>
      <header {...sx(s.head)}>
        <HtsCodeBadge code={candidate.code} tone="selected" />
        <span {...sx(s.state, pickStateTone(candidate.reviewState))}>
          {STATE_LABELS[candidate.reviewState] ?? candidate.reviewState}
        </span>
        {isSelected && <span {...sx(s.selectedTag)}>Current selection</span>}
      </header>

      {description && <p {...sx(s.description)}>{description}</p>}

      <footer {...sx(s.footer)}>
        <span {...sx(s.source)}>
          {candidate.source}
          {candidate.score == null
            ? ""
            : ` · ${formatPercent(candidate.score, props.lang, 0)}`}
        </span>
        <div {...sx(s.actions)}>
          <Button
            variant="primary"
            onClick={props.onAccept}
            disabled={
              isReadOnly || busy != null || candidate.reviewState === "accepted"
            }
          >
            {busy === "accepting" ? "Accepting…" : "Accept"}
          </Button>
          <Button
            variant="secondary"
            onClick={props.onReject}
            disabled={
              isReadOnly || busy != null || candidate.reviewState === "rejected"
            }
          >
            {busy === "rejecting" ? "Rejecting…" : "Reject"}
          </Button>
          <Button
            variant="danger"
            onClick={props.onDelete}
            disabled={isReadOnly || busy != null}
          >
            {busy === "deleting" ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </footer>
    </article>
  );
}

const s = stylex.create({
  row: {
    padding: "10px 12px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    backgroundColor: colors.paper,
    display: "flex",
    flexDirection: "column",
  },
  rowSelected: {
    borderColor: colors.lineStrong,
    backgroundColor: colors.paper2,
  },
  head: {
    gap: 8,
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  state: {
    padding: "1px 6px",
    borderRadius: radii.sm,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  selectedTag: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    fontStyle: "italic",
  },
  description: {
    margin: 0,
    color: colors.ink2,
    fontSize: 12.5,
    lineHeight: 1.4,
  },
  footer: {
    gap: 8,
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  source: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  actions: { gap: 6, display: "flex" },
});

const stateStyles = stylex.create({
  pending: { backgroundColor: colors.warnSoft, color: colors.warn },
  accepted: { backgroundColor: colors.okSoft, color: colors.ok },
  rejected: { backgroundColor: colors.errSoft, color: colors.err },
});
