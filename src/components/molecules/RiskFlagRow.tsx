import type { RiskFlagT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { Icon } from "@/components/atoms/Icons";
import { SourceLink } from "@/components/molecules/SourceLink";
import { sx } from "@/lib/styles/sx";
import {
  borders,
  colors,
  fonts,
  radii,
  risk,
} from "@/lib/styles/tokens.stylex";

interface RiskFlagRowPropsT {
  flag: RiskFlagT;
  /** Used to label "Affects: line N" when `flag.lineItemId` is set. */
  linePositionsById: Map<string, number>;
}

const SeverityIcon = (props: Readonly<{ severity: RiskFlagT["severity"] }>) => {
  switch (props.severity) {
    case "blocking": {
      return <Icon.Blocking />;
    }
    case "review": {
      return <Icon.Warn />;
    }
    default: {
      return <Icon.Info />;
    }
  }
};

/**
 * One row in the risk-flag list. Severity drives the left-rule color
 * (blocking = red, review = amber, info = neutral) per the FE doc —
 * red is reserved for "missing data that prevents a quote or strongly
 * invalidates the quote", not splashed on every flag.
 */
export function RiskFlagRow(props: Readonly<RiskFlagRowPropsT>) {
  const { flag } = props;
  const position = flag.lineItemId
    ? props.linePositionsById.get(flag.lineItemId)
    : undefined;

  return (
    <li {...sx(s.row, TONE[flag.severity])}>
      <div {...sx(s.head)}>
        <span {...sx(s.icon, ICON_TONE[flag.severity])}>
          <SeverityIcon severity={flag.severity} />
        </span>
        <div {...sx(s.titleCol)}>
          <div {...sx(s.title)}>{flag.title}</div>
          {position != null && (
            <div {...sx(s.affects)}>Affects line #{position}</div>
          )}
        </div>
      </div>
      <p {...sx(s.reason)}>{flag.reason}</p>
      <p {...sx(s.next)}>
        <span {...sx(s.nextLabel)}>Next:</span> {flag.nextAction}
      </p>
      <SourceLink label={flag.source.label} url={flag.source.url} />
    </li>
  );
}

const s = stylex.create({
  row: {
    padding: "10px 12px",
    borderRadius: radii.md,
    gap: 6,
    display: "flex",
    flexDirection: "column",
    borderLeftStyle: borders.solid,
    borderLeftWidth: borders.bold,
  },
  head: {
    gap: 8,
    alignItems: "flex-start",
    display: "flex",
  },
  icon: {
    display: "inline-flex",
    flexShrink: 0,
  },
  titleCol: { flex: "1", gap: 2, display: "flex", flexDirection: "column" },
  title: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: 600,
  },
  affects: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  reason: {
    margin: 0,
    color: colors.ink3,
    fontSize: 12,
    lineHeight: 1.45,
  },
  next: {
    margin: 0,
    color: colors.ink2,
    fontSize: 12,
    lineHeight: 1.45,
  },
  nextLabel: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
});

const TONE = stylex.create({
  blocking: {
    backgroundColor: risk.bgBlocking,
    borderLeftColor: risk.fgBlocking,
  },
  review: {
    backgroundColor: risk.bgReview,
    borderLeftColor: risk.fgReview,
  },
  info: {
    backgroundColor: risk.bgInfo,
    borderLeftColor: colors.line,
  },
});

const ICON_TONE = stylex.create({
  blocking: { color: risk.fgBlocking },
  review: { color: risk.fgReview },
  info: { color: risk.fgInfo },
});
