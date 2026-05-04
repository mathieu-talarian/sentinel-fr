import { RadioGroup } from "@ark-ui/solid";
import * as stylex from "@stylexjs/stylex";
import { For } from "solid-js";

import { sx } from "~/lib/sx";
import { colors } from "~/lib/tokens.stylex";

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
        onValueChange={(d) => {
          if (d.value != null) props.onChange(d.value);
        }}
        {...sx(s.seg)}
      >
        <For each={props.options}>
          {(opt) => (
            <RadioGroup.Item value={opt.value} {...sx(s.segItem)}>
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText {...sx(s.segItemText)}>
                {opt.label}
              </RadioGroup.ItemText>
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>
          )}
        </For>
      </RadioGroup.Root>
    </div>
  );
}

const s = stylex.create({
  row: { gap: 6, display: "flex", flexDirection: "column" },
  rowLabel: { color: colors.ink2, fontSize: 12.5, fontWeight: 500 },
  seg: {
    background: colors.paper3,
    padding: 2,
    borderRadius: 8,
    display: "flex",
  },
  segItem: {
    padding: "5px 8px",
    borderRadius: 6,
    flex: "1",
    transition: "background 140ms, color 140ms",
    alignItems: "center",
    color: {
      default: colors.ink3,
      ":hover": colors.ink2,
    },
    cursor: "pointer",
    display: "flex",
    fontSize: 12,
    fontWeight: 500,
    justifyContent: "center",
  },
  segItemText: {
    background: {
      default: "transparent",
      ':is([data-state="checked"])': colors.paper,
    },
    margin: {
      default: 0,
      ':is([data-state="checked"])': "-5px -8px",
    },
    padding: {
      default: 0,
      ':is([data-state="checked"])': "5px 8px",
    },
    borderRadius: {
      default: 0,
      ':is([data-state="checked"])': 6,
    },
    boxShadow: {
      default: "none",
      ':is([data-state="checked"])': "0 1px 2px oklch(0.24 0.04 255 / 0.08)",
    },
    color: {
      default: "inherit",
      ':is([data-state="checked"])': colors.ink,
    },
  },
});
