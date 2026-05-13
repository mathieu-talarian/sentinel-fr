import type {
  FeeScheduleRefViewT,
  LandedCostQuoteResponseT,
  QuoteSummaryT,
} from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { QuoteDeltaCell } from "@/components/molecules/QuoteDeltaCell";
import { SourceLink } from "@/components/molecules/SourceLink";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatUsd } from "@/lib/utils/intl";
import { computeDelta, pairEntryFees } from "@/lib/utils/quoteDiff";

const FEE_LABELS: Record<string, string> = {
  mpf_formal: "Merchandise Processing Fee",
  hmf_ocean: "Harbor Maintenance Fee",
};

interface QuoteDiffEntryFeesPropsT {
  selectedQuote: LandedCostQuoteResponseT;
  latestSummary: QuoteSummaryT;
  latestRefs: readonly FeeScheduleRefViewT[];
  lang: "en" | "fr";
  showHmf: boolean;
}

/**
 * Paired-row variant of `QuoteEntryFees`. One row per visible fee with
 * Selected / Latest / Δ. The source-schedule attribution renders under
 * the row (preferring the selected quote's ref when available).
 */
export function QuoteDiffEntryFees(props: Readonly<QuoteDiffEntryFeesPropsT>) {
  const rows = pairEntryFees(
    props.selectedQuote,
    props.latestSummary,
    props.latestRefs,
    props.showHmf,
  );

  return (
    <section {...sx(s.section)}>
      <h3 {...sx(s.title)}>Entry fees</h3>
      <table {...sx(s.table)}>
        <thead>
          <tr>
            <th {...sx(s.cell, s.head)}>Fee</th>
            <th {...sx(s.cell, s.head, s.right)}>Selected</th>
            <th {...sx(s.cell, s.head, s.right)}>Latest</th>
            <th {...sx(s.cell, s.head, s.right)}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const label = FEE_LABELS[r.feeCode] ?? r.feeCode;
            return (
              <tr key={r.feeCode}>
                <td {...sx(s.cell, s.labelCell)}>
                  <div {...sx(s.label)}>{label}</div>
                  {r.schedule && (
                    <SourceLink
                      label={`${label} schedule`}
                      url={r.schedule.sourceUrl}
                      effectiveDate={r.schedule.effectiveFrom}
                    />
                  )}
                </td>
                <td {...sx(s.cell, s.amount)}>
                  {formatUsd(r.selectedAmountUsd)}
                </td>
                <td {...sx(s.cell, s.amount)}>
                  {formatUsd(r.latestAmountUsd)}
                </td>
                <td {...sx(s.cell, s.amount)}>
                  <QuoteDeltaCell
                    delta={computeDelta(r.selectedAmountUsd, r.latestAmountUsd)}
                    lang={props.lang}
                    hidePct
                  />
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
  labelCell: { gap: 3, display: "flex", flexDirection: "column" },
  label: { color: colors.ink2, fontSize: 12.5, fontWeight: 500 },
  amount: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  },
});
