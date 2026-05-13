import type { CaseRulingViewT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { HtsCodeBadge } from "@/components/molecules/HtsCodeBadge";
import { SourceLink } from "@/components/molecules/SourceLink";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

export type SupportStateT = "yes" | "no" | "unknown";

const SUPPORT_LABELS: Record<SupportStateT, string> = {
  yes: "Supports",
  no: "Conflicts",
  unknown: "Reference",
};

const asSupportState = (raw: string): SupportStateT =>
  raw === "yes" || raw === "no" || raw === "unknown" ? raw : "unknown";

interface CaseRulingCardPropsT {
  ruling: CaseRulingViewT;
  /** Resolves `ruling.lineItemId` → display position. */
  linePositionsById: Map<string, number>;
  detaching: boolean;
  refreshing: boolean;
  isReadOnly: boolean;
  onDetach: () => void;
  onRefresh: () => void;
}

/**
 * One attached CROSS ruling card. Renders the metadata broker reviewers
 * look at first (ruling number, date, subject) plus the user's verdict
 * on whether the ruling supports the line's selected HTS code. Used
 * inside `CaseEvidencePanel`'s three groups.
 */
export function CaseRulingCard(props: Readonly<CaseRulingCardPropsT>) {
  const { ruling, detaching, refreshing, isReadOnly } = props;
  const busy = detaching || refreshing;
  const support = asSupportState(ruling.supportsSelectedCode);
  const position = ruling.lineItemId
    ? props.linePositionsById.get(ruling.lineItemId)
    : undefined;

  return (
    <article {...sx(s.card)}>
      <header {...sx(s.head)}>
        <span {...sx(s.number)}>{ruling.rulingNumber}</span>
        {ruling.rulingDate && <span {...sx(s.date)}>{ruling.rulingDate}</span>}
        <span {...sx(s.support, SUPPORT_TONE[support])}>
          {SUPPORT_LABELS[support]}
        </span>
      </header>

      {ruling.subject && <p {...sx(s.subject)}>{ruling.subject}</p>}

      {ruling.assignedHtsCodes.length > 0 && (
        <div {...sx(s.codes)}>
          {ruling.assignedHtsCodes.map((code) => (
            <HtsCodeBadge key={code} code={code} tone="default" />
          ))}
        </div>
      )}

      {position != null && (
        <div {...sx(s.affects)}>Pinned to line #{position}</div>
      )}

      {ruling.matchNote && <p {...sx(s.note)}>{ruling.matchNote}</p>}

      <div {...sx(s.footer)}>
        <SourceLink label="View on CROSS" url={ruling.url} />
        <div {...sx(s.actions)}>
          <button
            type="button"
            onClick={props.onRefresh}
            disabled={busy}
            {...sx(s.action)}
            aria-label={`Refresh ruling ${ruling.rulingNumber}`}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={props.onDetach}
            disabled={isReadOnly || busy}
            {...sx(s.detach)}
            aria-label={`Detach ruling ${ruling.rulingNumber}`}
          >
            {detaching ? "Detaching…" : "Detach"}
          </button>
        </div>
      </div>
    </article>
  );
}

const s = stylex.create({
  card: {
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
  head: {
    gap: 8,
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
  },
  number: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: 600,
  },
  date: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  support: {
    padding: "1px 6px",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginLeft: "auto",
  },
  subject: {
    margin: 0,
    color: colors.ink2,
    fontSize: 12.5,
    lineHeight: 1.45,
  },
  codes: {
    gap: 4,
    display: "flex",
    flexWrap: "wrap",
  },
  affects: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  note: {
    margin: 0,
    padding: "6px 8px",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: colors.paper2,
    color: colors.ink3,
    fontSize: 11.5,
    fontStyle: "italic",
    lineHeight: 1.4,
  },
  footer: {
    gap: 8,
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  actions: {
    gap: 6,
    alignItems: "center",
    display: "flex",
  },
  action: {
    padding: "2px 8px",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: {
      default: "transparent",
      ":hover:not(:disabled)": colors.paper3,
    },
    color: {
      default: colors.ink4,
      ":hover:not(:disabled)": colors.ink,
    },
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    fontFamily: fonts.sans,
    fontSize: 11,
  },
  detach: {
    padding: "2px 8px",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: {
      default: "transparent",
      ":hover:not(:disabled)": colors.errSoft,
    },
    color: {
      default: colors.ink4,
      ":hover:not(:disabled)": colors.err,
    },
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    fontFamily: fonts.sans,
    fontSize: 11,
  },
});

const SUPPORT_TONE = stylex.create({
  yes: {
    borderColor: colors.okSoft,
    backgroundColor: colors.okSoft,
    color: colors.ok,
  },
  no: {
    borderColor: colors.errSoft,
    backgroundColor: colors.errSoft,
    color: colors.err,
  },
  unknown: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
    color: colors.ink3,
  },
});
