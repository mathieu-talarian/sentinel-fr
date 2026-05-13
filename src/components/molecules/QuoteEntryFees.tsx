import type {
  FeeScheduleRefViewT,
  QuoteSummaryT,
} from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { FeeRow } from "@/components/molecules/FeeRow";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface QuoteEntryFeesPropsT {
  summary: QuoteSummaryT;
  feeScheduleRefs: readonly FeeScheduleRefViewT[];
  showHmf: boolean;
}

export function QuoteEntryFees(props: Readonly<QuoteEntryFeesPropsT>) {
  const { summary, feeScheduleRefs, showHmf } = props;
  return (
    <section {...sx(s.section)}>
      <h3 {...sx(s.title)}>Entry fees</h3>
      <div {...sx(s.fees)}>
        <FeeRow
          feeCode="mpf_formal"
          amountUsd={summary.mpfUsd}
          schedule={feeScheduleRefs.find((f) => f.feeCode === "mpf_formal")}
        />
        {showHmf && (
          <FeeRow
            feeCode="hmf_ocean"
            amountUsd={summary.hmfUsd}
            schedule={feeScheduleRefs.find((f) => f.feeCode === "hmf_ocean")}
          />
        )}
      </div>
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
  fees: { gap: 8, display: "flex", flexDirection: "column" },
});
