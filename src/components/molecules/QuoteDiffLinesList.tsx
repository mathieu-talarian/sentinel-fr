import type { LandedCostQuoteLineResponseT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { HtsCodeBadge } from "@/components/molecules/HtsCodeBadge";
import { QuoteDeltaCell } from "@/components/molecules/QuoteDeltaCell";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatUsd } from "@/lib/utils/intl";
import { computeDelta, pairLines } from "@/lib/utils/quoteDiff";

interface QuoteDiffLinesListPropsT {
  selectedLines: readonly LandedCostQuoteLineResponseT[];
  latestLines: readonly LandedCostQuoteLineResponseT[];
  lang: "en" | "fr";
}

const MISSING = "—";

/**
 * Paired-row variant of `QuoteLinesList`. One row per line position;
 * shows the position + HTS code (from whichever side has it) plus the
 * `lineTotalFeesUsd` from each quote and the Δ. Added/removed lines
 * render `—` on the missing side and a chip in the label cell.
 */
export function QuoteDiffLinesList(props: Readonly<QuoteDiffLinesListPropsT>) {
  const pairs = pairLines(props.selectedLines, props.latestLines);

  return (
    <section {...sx(s.section)}>
      <h3 {...sx(s.title)}>Lines</h3>
      <table {...sx(s.table)}>
        <thead>
          <tr>
            <th {...sx(s.cell, s.head)}>Line</th>
            <th {...sx(s.cell, s.head, s.right)}>Selected</th>
            <th {...sx(s.cell, s.head, s.right)}>Latest</th>
            <th {...sx(s.cell, s.head, s.right)}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => {
            const ref = p.selected ?? p.latest;
            const selectedAmount = p.selected?.lineTotalFeesUsd ?? 0;
            const latestAmount = p.latest?.lineTotalFeesUsd ?? 0;
            const onlySelected = p.latest == null;
            const onlyLatest = p.selected == null;
            return (
              <tr key={p.position}>
                <td {...sx(s.cell, s.labelCell)}>
                  <div {...sx(s.labelRow)}>
                    <span {...sx(s.position)}>#{p.position}</span>
                    {ref && <HtsCodeBadge code={ref.code} tone="selected" />}
                    {onlyLatest && <span {...sx(s.chipAdded)}>Added</span>}
                    {onlySelected && (
                      <span {...sx(s.chipRemoved)}>Removed</span>
                    )}
                  </div>
                  {ref?.description && (
                    <div {...sx(s.description)}>{ref.description}</div>
                  )}
                </td>
                <td {...sx(s.cell, s.amount)}>
                  {p.selected ? formatUsd(selectedAmount) : MISSING}
                </td>
                <td {...sx(s.cell, s.amount)}>
                  {p.latest ? formatUsd(latestAmount) : MISSING}
                </td>
                <td {...sx(s.cell, s.amount)}>
                  {p.selected && p.latest ? (
                    <QuoteDeltaCell
                      delta={computeDelta(selectedAmount, latestAmount)}
                      lang={props.lang}
                    />
                  ) : (
                    <span {...sx(s.amountMuted)}>{MISSING}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

const s = stylex.create({
  section: { gap: 8, display: "flex", flexDirection: "column" },
  title: {
    margin: 0,
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  table: { borderCollapse: "collapse", fontSize: 12, width: "100%" },
  cell: {
    padding: "8px 6px",
    verticalAlign: "top",
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
  },
  head: {
    color: colors.ink4,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  right: { textAlign: "right" },
  labelCell: { gap: 4, color: colors.ink2 },
  labelRow: { gap: 6, alignItems: "center", display: "flex", flexWrap: "wrap" },
  position: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 500,
  },
  description: {
    color: colors.ink3,
    fontSize: 11.5,
    lineHeight: 1.35,
  },
  amount: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  },
  amountMuted: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 12,
    textAlign: "right",
  },
  chipAdded: {
    padding: "1px 6px",
    borderRadius: radii.sm,
    backgroundColor: colors.okSoft,
    color: colors.ok,
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  chipRemoved: {
    padding: "1px 6px",
    borderRadius: radii.sm,
    backgroundColor: colors.errSoft,
    color: colors.err,
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
});
