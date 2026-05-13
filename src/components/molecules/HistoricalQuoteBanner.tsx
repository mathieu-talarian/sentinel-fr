import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, radii } from "@/lib/styles/tokens.stylex";

interface HistoricalQuoteBannerPropsT {
  compareMode: boolean;
  onCompareModeChange: (next: boolean) => void;
}

/**
 * Banner shown above the quote body when the user has selected a
 * non-latest snapshot from `QuoteHistoryDropdown`. Combines the
 * "historical snapshot" hint with the "Compare to latest" checkbox; the
 * panel turns the checkbox into a real diff render by passing the
 * latest quote into `QuoteBody`.
 */
export function HistoricalQuoteBanner(
  props: Readonly<HistoricalQuoteBannerPropsT>,
) {
  return (
    <div {...sx(s.banner)}>
      <span>
        Viewing a historical snapshot. Re-run the quote to capture a fresh one.
      </span>
      <label {...sx(s.toggle)}>
        <input
          type="checkbox"
          checked={props.compareMode}
          onChange={(e) => {
            props.onCompareModeChange(e.currentTarget.checked);
          }}
        />
        Compare to latest
      </label>
    </div>
  );
}

const s = stylex.create({
  banner: {
    margin: 0,
    padding: "6px 10px",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: "dashed",
    borderWidth: borders.thin,
    gap: 8,
    alignItems: "center",
    backgroundColor: colors.paper2,
    color: colors.ink3,
    display: "flex",
    flexWrap: "wrap",
    fontSize: 11.5,
    fontStyle: "italic",
    justifyContent: "space-between",
  },
  toggle: {
    gap: 6,
    alignItems: "center",
    color: colors.ink2,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: 11.5,
    fontStyle: "normal",
  },
});
