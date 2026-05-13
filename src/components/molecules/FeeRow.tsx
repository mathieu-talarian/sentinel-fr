import type { FeeScheduleRefViewT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { SourceLink } from "@/components/molecules/SourceLink";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatUsd } from "@/lib/utils/intl";

const FEE_LABELS: Record<string, string> = {
  mpf_formal: "Merchandise Processing Fee",
  hmf_ocean: "Harbor Maintenance Fee",
};

interface FeeRowPropsT {
  feeCode: string;
  amountUsd: number;
  /**
   * Optional source-schedule attribution. Named `schedule` (not `ref`)
   * because React reserves the `ref` prop name for component refs.
   */
  schedule?: FeeScheduleRefViewT;
}

/**
 * Entry-level fee row used in the quote panel's "Entry fees" section.
 * Pairs the per-fee amount with the `FeeScheduleRefViewT` (effective date +
 * source URL) so the user can audit which `fee_schedule` row was used.
 */
export function FeeRow(props: Readonly<FeeRowPropsT>) {
  const label = FEE_LABELS[props.feeCode] ?? props.feeCode;
  const schedule = props.schedule;
  return (
    <div {...sx(s.row)}>
      <div {...sx(s.head)}>
        <span {...sx(s.label)}>{label}</span>
        <span {...sx(s.amount)}>{formatUsd(props.amountUsd)}</span>
      </div>
      {schedule && (
        <SourceLink
          label={`${label} schedule`}
          url={schedule.sourceUrl}
          effectiveDate={schedule.effectiveFrom}
        />
      )}
    </div>
  );
}

const s = stylex.create({
  row: {
    padding: "8px 10px",
    borderColor: colors.line,
    borderRadius: 6,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 4,
    backgroundColor: colors.paper,
    display: "flex",
    flexDirection: "column",
  },
  head: {
    gap: 10,
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  label: { color: colors.ink2, fontSize: 12.5, fontWeight: 500 },
  amount: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: 12.5,
    fontVariantNumeric: "tabular-nums",
  },
});
