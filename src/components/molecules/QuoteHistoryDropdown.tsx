import type { LandedCostQuoteSummaryItemT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface QuoteHistoryDropdownPropsT {
  /** Quotes sorted desc by `createdAt`. Index 0 is the latest. */
  quotes: readonly LandedCostQuoteSummaryItemT[];
  /** Either the currently rendered quote id, or null while loading. */
  activeId: string | null;
  /** Pre-formatted label per quote, parallel to `quotes`. */
  labelFor: (q: LandedCostQuoteSummaryItemT) => string;
  onSelect: (quoteId: string) => void;
}

export function QuoteHistoryDropdown(
  props: Readonly<QuoteHistoryDropdownPropsT>,
) {
  return (
    <div {...sx(s.row)}>
      <label htmlFor="quote-history" {...sx(s.label)}>
        Quote history
      </label>
      <select
        id="quote-history"
        value={props.activeId ?? ""}
        onChange={(e) => {
          props.onSelect(e.currentTarget.value);
        }}
        {...sx(s.select)}
      >
        {props.quotes.map((q, i) => (
          <option key={q.id} value={q.id}>
            {i === 0 ? "Latest · " : ""}
            {props.labelFor(q)}
          </option>
        ))}
      </select>
    </div>
  );
}

const s = stylex.create({
  row: { gap: 8, alignItems: "center", display: "flex" },
  label: {
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  select: {
    padding: "4px 8px",
    borderColor: colors.lineStrong,
    borderRadius: radii.sm,
    borderStyle: "solid",
    borderWidth: borders.thin,
    flex: "1",
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 12,
    minWidth: 0,
  },
});
