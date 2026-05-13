import type { IconKeyT } from "@/components/atoms/Icons";

import * as stylex from "@stylexjs/stylex";

import { Icon } from "@/components/atoms/Icons";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatMonthDay, formatRelativeDays } from "@/lib/utils/intl";

export type TimelineToneT = "neutral" | "ok" | "warn" | "err" | "info";

const ONE_DAY_MS = 86_400_000;

const formatWhen = (iso: string, lang: "en" | "fr"): string => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / ONE_DAY_MS);
  if (days <= 1) return formatRelativeDays(-Math.max(days, 0), lang);
  return formatMonthDay(d, lang);
};

interface CaseTimelineItemPropsT {
  icon: IconKeyT;
  tone: TimelineToneT;
  /** Short one-line label, e.g. "Quote captured". */
  label: string;
  /** Optional detail right after the label, e.g. landed-cost amount. */
  detail?: string;
  capturedAt: string;
  lang: "en" | "fr";
  /** When set, the row becomes a button that jumps to the matching tab. */
  onClick?: () => void;
}

/**
 * One activity row inside `CaseTimeline`. Renders as a static
 * `<article>` by default; switches to a button when `onClick` is set so
 * the row can jump to the inspector tab where the event lives.
 */
export function CaseTimelineItem(props: Readonly<CaseTimelineItemPropsT>) {
  const IconCmp = Icon[props.icon];
  const tone = TONE[props.tone];
  const body = (
    <>
      <span {...sx(s.icon, tone)} aria-hidden>
        <IconCmp />
      </span>
      <span {...sx(s.text)}>
        <span {...sx(s.label)}>
          {props.label}
          {props.detail && <span {...sx(s.detail)}> · {props.detail}</span>}
        </span>
        <span {...sx(s.when)}>{formatWhen(props.capturedAt, props.lang)}</span>
      </span>
    </>
  );

  if (props.onClick) {
    return (
      <button type="button" onClick={props.onClick} {...sx(s.row, s.rowButton)}>
        {body}
      </button>
    );
  }
  return <article {...sx(s.row)}>{body}</article>;
}

const s = stylex.create({
  row: {
    padding: "6px 10px",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 10,
    alignItems: "center",
    backgroundColor: "transparent",
    color: colors.ink2,
    display: "flex",
    fontFamily: fonts.sans,
    textAlign: "left",
    width: "100%",
  },
  rowButton: {
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    cursor: "pointer",
  },
  icon: {
    borderRadius: radii.sm,
    placeItems: "center",
    display: "grid",
    flexShrink: 0,
    height: 22,
    width: 22,
  },
  text: {
    flex: "1",
    gap: 2,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  label: {
    overflow: "hidden",
    color: colors.ink2,
    fontSize: 12.5,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  detail: {
    color: colors.ink3,
    fontFamily: fonts.mono,
    fontSize: 11.5,
  },
  when: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 10.5,
  },
});

const TONE = stylex.create({
  neutral: { backgroundColor: colors.paper3, color: colors.ink3 },
  ok: { backgroundColor: colors.okSoft, color: colors.ok },
  warn: { backgroundColor: colors.warnSoft, color: colors.warn },
  err: { backgroundColor: colors.errSoft, color: colors.err },
  info: { backgroundColor: colors.paper3, color: colors.ink2 },
});
