import * as stylex from "@stylexjs/stylex";
import { RadioGroup } from "radix-ui";

import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface SegOptionT {
  value: string;
  label: string;
}

interface SegmentedRadioPropsT {
  label: string;
  value: string;
  options: SegOptionT[];
  onChange: (v: string) => void;
}

export function SegmentedRadio(props: Readonly<SegmentedRadioPropsT>) {
  return (
    <div {...sx(s.row)}>
      <span {...sx(s.rowLabel)}>{props.label}</span>
      <RadioGroup.Root
        value={props.value}
        onValueChange={props.onChange}
        {...sx(s.seg)}
      >
        {props.options.map((opt) => (
          <RadioGroup.Item key={opt.value} value={opt.value} {...sx(s.segItem)}>
            {opt.label}
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
}

const s = stylex.create({
  row: { gap: 6, display: "flex", flexDirection: "column" },
  rowLabel: { color: colors.ink2, fontSize: 12.5, fontWeight: 500 },
  seg: {
    padding: 2,
    borderRadius: 8,
    backgroundColor: colors.paper3,
    display: "flex",
  },
  segItem: {
    padding: "5px 8px",
    borderRadius: 6,
    borderStyle: "none",
    borderWidth: 0,
    flex: "1",
    transition: "background 140ms, color 140ms, box-shadow 140ms",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ':is([data-state="checked"])': colors.paper,
    },
    boxShadow: {
      default: "none",
      ':is([data-state="checked"])': "0 1px 2px oklch(0.24 0.04 255 / 0.08)",
    },
    color: {
      default: colors.ink3,
      ':is([data-state="checked"])': colors.ink,
      ":hover": colors.ink2,
    },
    cursor: "pointer",
    display: "flex",
    fontSize: 12,
    fontWeight: 500,
    justifyContent: "center",
  },
});
