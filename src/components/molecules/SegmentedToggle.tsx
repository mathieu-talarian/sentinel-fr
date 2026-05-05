import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface SegmentedToggleOptionT<V extends string> {
  value: V;
  label: string;
  title?: string;
}

interface SegmentedTogglePropsT<V extends string> {
  ariaLabel: string;
  value: V;
  options: readonly SegmentedToggleOptionT<V>[];
  onChange: (value: V) => void;
  disabled?: boolean;
}

export function SegmentedToggle<V extends string>(
  props: Readonly<SegmentedTogglePropsT<V>>,
) {
  return (
    <div {...sx(s.toggle)} role="radiogroup" aria-label={props.ariaLabel}>
      {props.options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={props.value === opt.value}
          {...sx(s.btn)}
          onClick={() => {
            props.onChange(opt.value);
          }}
          disabled={props.disabled}
          title={opt.title}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const s = stylex.create({
  toggle: {
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    display: "flex",
  },
  btn: {
    padding: "4px 10px",
    borderStyle: "none",
    borderWidth: 0,
    backgroundColor: {
      default: "transparent",
      ':is([aria-checked="true"])': colors.paper3,
    },
    color: {
      default: colors.ink4,
      ":hover:not(:disabled)": colors.ink2,
      ':is([aria-checked="true"])': colors.ink,
    },
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.04em",
    opacity: {
      default: 1,
      ":disabled": 0.55,
    },
  },
});
