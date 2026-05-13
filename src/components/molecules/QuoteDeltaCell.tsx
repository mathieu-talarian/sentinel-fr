import type { QuoteDeltaT } from "@/lib/utils/quoteDiff";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatPercent, formatUsd } from "@/lib/utils/intl";

interface QuoteDeltaCellPropsT {
  delta: QuoteDeltaT;
  lang: "en" | "fr";
  /** Hide the percent suffix (e.g. for fees where the base may be 0). */
  hidePct?: boolean;
}

const s = stylex.create({
  cell: {
    fontFamily: fonts.mono,
    fontSize: 12,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
    whiteSpace: "nowrap",
  },
});

const toneStyles = stylex.create({
  up: { color: colors.err },
  down: { color: colors.ok },
  flat: { color: colors.ink4 },
});

const pickTone = (
  direction: QuoteDeltaT["direction"],
): (typeof toneStyles)[keyof typeof toneStyles] => {
  if (direction === "flat") return toneStyles.flat;
  if (direction === "up") return toneStyles.up;
  return toneStyles.down;
};

/**
 * One Δ cell: signed USD amount, optionally followed by a signed
 * percent. Tints green when the selected quote was cheaper (down) and
 * red when more expensive (up). Used by all three quote-diff molecules.
 */
export function QuoteDeltaCell(props: Readonly<QuoteDeltaCellPropsT>) {
  const { delta, hidePct } = props;
  const tone = pickTone(delta.direction);

  if (delta.direction === "flat") {
    return <span {...sx(s.cell, tone)}>—</span>;
  }

  const sign = delta.amountUsd > 0 ? "+" : "−";
  const abs = Math.abs(delta.amountUsd);
  const amountText = `${sign}${formatUsd(abs)}`;
  const pctText =
    hidePct || delta.pct === null
      ? null
      : ` (${sign}${formatPercent(Math.abs(delta.pct), props.lang, 1)})`;

  return (
    <span {...sx(s.cell, tone)}>
      {amountText}
      {pctText}
    </span>
  );
}
