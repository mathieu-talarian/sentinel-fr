import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

const LABELS: Record<string, string> = {
  // Case-level
  transport: "Transport",
  countryOfOrigin: "Country of origin",
  declaredValueUsd: "Declared value",
  lineItems: "Line items",
  // Line-level
  selectedHtsCode: "HTS code",
  customsValueUsd: "Customs value",
};

interface MissingFieldChipPropsT {
  /** Internal field key — e.g. `"transport"`, `"selectedHtsCode"`. */
  field: string;
  /** Optional click handler (e.g. scroll the field into view). */
  onClick?: () => void;
}

export function MissingFieldChip(props: Readonly<MissingFieldChipPropsT>) {
  const label = LABELS[props.field] ?? props.field;
  if (props.onClick) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        {...sx(s.chip, s.clickable)}
      >
        {label}
      </button>
    );
  }
  return <span {...sx(s.chip)}>{label}</span>;
}

const s = stylex.create({
  chip: {
    padding: "1px 6px",
    borderColor: colors.warnSoft,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: colors.warnSoft,
    color: colors.warn,
    fontFamily: fonts.sans,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
  },
  clickable: {
    cursor: "pointer",
    textTransform: "none",
  },
});
