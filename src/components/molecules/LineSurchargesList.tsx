import type { AppliedSurchargeT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { SourceLink } from "@/components/molecules/SourceLink";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatPercent, formatUsd } from "@/lib/utils/intl";

// Lifted verbatim from FRONTEND_IMPORT_CASE_WORKBENCH.md §Quote Panel —
// the wording matters: "we ran the rules and nothing matched" vs "the
// rules don't apply here". Mirrors the legacy `LandedCost.tsx` empty
// state so the two surfaces never drift apart.
const NO_SURCHARGE_RULE = "No verified surcharge rule matched this case.";

const formatRate = (
  surcharge: AppliedSurchargeT,
  lang: "en" | "fr",
): string | null => {
  if (surcharge.rate_text) return surcharge.rate_text;
  if (surcharge.rate_pct != null)
    return formatPercent(surcharge.rate_pct, lang);
  if (surcharge.specific_per_unit_usd != null && surcharge.specific_unit) {
    return `${formatUsd(surcharge.specific_per_unit_usd)}/${surcharge.specific_unit}`;
  }
  return null;
};

interface LineSurchargesListPropsT {
  surcharges: readonly AppliedSurchargeT[];
  lang: "en" | "fr";
}

/**
 * Renders the surcharge attributions for one quote line (or any other
 * `AppliedSurcharge[]` source). Empty array shows the verbatim
 * no-rule-matched copy.
 */
export function LineSurchargesList(props: Readonly<LineSurchargesListPropsT>) {
  if (props.surcharges.length === 0) {
    return <p {...sx(s.noRule)}>{NO_SURCHARGE_RULE}</p>;
  }
  return (
    <ul {...sx(s.list)}>
      {props.surcharges.map((surcharge) => {
        const rate = formatRate(surcharge, props.lang);
        return (
          <li key={surcharge.rule_id} {...sx(s.row)}>
            <div {...sx(s.head)}>
              <span {...sx(s.program)}>{surcharge.program}</span>
              {surcharge.chapter_99_code && (
                <span {...sx(s.chapter99)}>{surcharge.chapter_99_code}</span>
              )}
              {rate && <span {...sx(s.rate)}>{rate}</span>}
              <span {...sx(s.amount)}>{formatUsd(surcharge.amount_usd)}</span>
            </div>
            {surcharge.source_url && (
              <SourceLink
                label={surcharge.source_notice ?? `${surcharge.program} notice`}
                url={surcharge.source_url}
                effectiveDate={surcharge.effective_from}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

const s = stylex.create({
  noRule: {
    margin: 0,
    color: colors.ink4,
    fontSize: 11.5,
    fontStyle: "italic",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: 6,
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
  row: { gap: 2, display: "flex", flexDirection: "column" },
  head: {
    gap: 6,
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
  },
  program: { color: colors.ink2, fontSize: 12, fontWeight: 600 },
  rate: {
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    fontVariantNumeric: "tabular-nums",
  },
  amount: {
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    fontVariantNumeric: "tabular-nums",
    marginLeft: "auto",
  },
  chapter99: {
    padding: "1px 5px",
    borderRadius: 3,
    backgroundColor: colors.paper3,
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    fontWeight: 600,
  },
});
