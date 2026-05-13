import type { QuoteSummaryT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { QuoteDeltaCell } from "@/components/molecules/QuoteDeltaCell";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatUsd } from "@/lib/utils/intl";
import { computeDelta } from "@/lib/utils/quoteDiff";

interface QuoteDiffSummaryTablePropsT {
  selected: QuoteSummaryT;
  latest: QuoteSummaryT;
  lang: "en" | "fr";
  showHmf?: boolean;
}

/**
 * Paired-row variant of `QuoteSummaryTable`. Four columns: label,
 * selected amount, latest amount, Δ. Row order mirrors the original
 * table so users can scan both renders interchangeably.
 */
export function QuoteDiffSummaryTable(
  props: Readonly<QuoteDiffSummaryTablePropsT>,
) {
  const { selected, latest, lang, showHmf = true } = props;
  const showInsurance = selected.insuranceUsd > 0 || latest.insuranceUsd > 0;
  return (
    <table {...sx(s.table)}>
      <thead>
        <tr>
          <th {...sx(s.cell, s.head)}>{/* label column */}</th>
          <th {...sx(s.cell, s.head, s.right)}>Selected</th>
          <th {...sx(s.cell, s.head, s.right)}>Latest</th>
          <th {...sx(s.cell, s.head, s.right)}>Δ</th>
        </tr>
      </thead>
      <tbody>
        <Row
          label="Customs value"
          selected={selected.declaredTotalUsd}
          latest={latest.declaredTotalUsd}
          lang={lang}
        />
        <Row
          label="Duty"
          selected={selected.dutyTotalUsd}
          latest={latest.dutyTotalUsd}
          lang={lang}
        />
        <Row
          label="Surcharges"
          selected={selected.surchargeTotalUsd}
          latest={latest.surchargeTotalUsd}
          lang={lang}
        />
        <Row
          label="Merchandise Processing Fee"
          selected={selected.mpfUsd}
          latest={latest.mpfUsd}
          lang={lang}
        />
        {showHmf && (
          <Row
            label="Harbor Maintenance Fee"
            selected={selected.hmfUsd}
            latest={latest.hmfUsd}
            lang={lang}
          />
        )}
        <Row
          label="Freight"
          selected={selected.freightUsd}
          latest={latest.freightUsd}
          lang={lang}
        />
        {showInsurance && (
          <Row
            label="Insurance"
            selected={selected.insuranceUsd}
            latest={latest.insuranceUsd}
            lang={lang}
          />
        )}
        <TotalRow
          selected={selected.landedCostUsd}
          latest={latest.landedCostUsd}
          lang={lang}
        />
      </tbody>
    </table>
  );
}

interface RowPropsT {
  label: string;
  selected: number;
  latest: number;
  lang: "en" | "fr";
}

function Row(props: Readonly<RowPropsT>) {
  return (
    <tr>
      <td {...sx(s.cell, s.label)}>{props.label}</td>
      <td {...sx(s.cell, s.amount)}>{formatUsd(props.selected)}</td>
      <td {...sx(s.cell, s.amount)}>{formatUsd(props.latest)}</td>
      <td {...sx(s.cell, s.amount)}>
        <QuoteDeltaCell
          delta={computeDelta(props.selected, props.latest)}
          lang={props.lang}
        />
      </td>
    </tr>
  );
}

function TotalRow(props: Readonly<Omit<RowPropsT, "label">>) {
  return (
    <tr>
      <td {...sx(s.cell, s.totalLeft)}>Landed cost</td>
      <td {...sx(s.cell, s.totalRight)}>{formatUsd(props.selected)}</td>
      <td {...sx(s.cell, s.totalRight)}>{formatUsd(props.latest)}</td>
      <td {...sx(s.cell, s.totalRight)}>
        <QuoteDeltaCell
          delta={computeDelta(props.selected, props.latest)}
          lang={props.lang}
        />
      </td>
    </tr>
  );
}

const s = stylex.create({
  table: { borderCollapse: "collapse", fontSize: 12, width: "100%" },
  cell: {
    padding: "6px 6px",
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
  label: { color: colors.ink2 },
  amount: {
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
    fontSize: 13,
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
