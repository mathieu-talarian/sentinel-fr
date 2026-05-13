import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatHtsCode } from "@/lib/utils/format";

export type HtsCodeBadgeToneT = "default" | "selected" | "candidate";

interface HtsCodeBadgePropsT {
  code: string;
  tone?: HtsCodeBadgeToneT;
}

/**
 * Compact dotted HTS code badge. `default` is neutral, `selected` marks
 * the line's resolved code, `candidate` marks one of several pending
 * options. Mono font + tabular nums so columns of badges align.
 */
export function HtsCodeBadge(props: Readonly<HtsCodeBadgePropsT>) {
  return (
    <span {...sx(s.badge, TONE[props.tone ?? "default"])}>
      {formatHtsCode(props.code)}
    </span>
  );
}

const s = stylex.create({
  badge: {
    padding: "1px 5px",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
});

const TONE = stylex.create({
  default: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
    color: colors.ink2,
  },
  selected: {
    borderColor: colors.goldSoft,
    backgroundColor: colors.goldSoft,
    color: colors.goldDeep,
  },
  candidate: {
    borderColor: colors.line,
    backgroundColor: "transparent",
    color: colors.ink3,
  },
});
