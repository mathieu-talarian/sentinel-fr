import type { LandedCostQuoteSummaryT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatUsd } from "@/lib/utils/intl";

interface QuoteSummaryTablePropsT {
  summary: LandedCostQuoteSummaryT;
  /** When false (no ocean transport), the HMF row is suppressed. */
  showHmf?: boolean;
}

/**
 * The canonical seven-row breakdown from the FE doc §Quote Panel. Rows
 * are ordered to mirror the broker filing flow: customs value first,
 * then per-line duty + surcharges, then entry-level fees (MPF / HMF),
 * then freight, then the landed total on a heavier rule line.
 */
export function QuoteSummaryTable(props: Readonly<QuoteSummaryTablePropsT>) {
  const { summary, showHmf = true } = props;
  return (
    <table {...sx(s.table)}>
      <tbody>
        <Row label="Customs value" amount={summary.declaredTotalUsd} />
        <Row label="Duty" amount={summary.dutyTotalUsd} />
        <Row label="Surcharges" amount={summary.surchargeTotalUsd} />
        <Row label="Merchandise Processing Fee" amount={summary.mpfUsd} />
        {showHmf && (
          <Row label="Harbor Maintenance Fee" amount={summary.hmfUsd} />
        )}
        <Row label="Freight" amount={summary.freightUsd} />
        {summary.insuranceUsd > 0 && (
          <Row label="Insurance" amount={summary.insuranceUsd} />
        )}
        <tr>
          <td {...sx(s.cell, s.totalLeft)}>Landed cost</td>
          <td {...sx(s.cell, s.totalRight)}>
            {formatUsd(summary.landedCostUsd)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function Row(props: Readonly<{ label: string; amount: number }>) {
  return (
    <tr>
      <td {...sx(s.cell, s.cellLeft)}>{props.label}</td>
      <td {...sx(s.cell, s.cellRight)}>{formatUsd(props.amount)}</td>
    </tr>
  );
}

const s = stylex.create({
  table: { borderCollapse: "collapse", fontSize: 12.5, width: "100%" },
  cell: {
    padding: "7px 0",
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
  },
  cellLeft: { color: colors.ink2 },
  cellRight: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  },
  totalLeft: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: 600,
    borderBottomStyle: "none",
    borderBottomWidth: 0,
    borderTopColor: colors.ink,
    borderTopStyle: borders.solid,
    borderTopWidth: borders.thick,
    paddingTop: 9,
  },
  totalRight: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    textAlign: "right",
    borderBottomStyle: "none",
    borderBottomWidth: 0,
    borderTopColor: colors.ink,
    borderTopStyle: borders.solid,
    borderTopWidth: borders.thick,
    paddingTop: 9,
  },
});
