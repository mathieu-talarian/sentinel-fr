import { Switch } from "@ark-ui/solid";
import * as stylex from "@stylexjs/stylex";
import { Show } from "solid-js";

import { sx } from "~/lib/sx";
import { colors } from "~/lib/tokens.stylex";

interface ToggleRowPropsT {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleRow(props: Readonly<ToggleRowPropsT>) {
  return (
    <div {...sx(s.row)}>
      <span {...sx(s.rowLabel)}>{props.label}</span>
      <Switch.Root
        checked={props.checked}
        onCheckedChange={(d) => {
          props.onChange(d.checked);
        }}
      >
        <Switch.Control {...sx(s.switchCtrl)}>
          <Switch.Thumb {...sx(s.switchThumb)} />
        </Switch.Control>
        <Switch.HiddenInput />
        <Show when={false}>
          <Switch.Label />
        </Show>
      </Switch.Root>
    </div>
  );
}

const s = stylex.create({
  row: {
    gap: 12,
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLabel: { color: colors.ink2, fontSize: 12.5, fontWeight: 500 },
  switchCtrl: {
    background: {
      default: colors.lineStrong,
      ':is([data-state="checked"])': colors.ok,
    },
    borderRadius: 999,
    borderStyle: "none",
    borderWidth: 0,
    transition: "background 140ms",
    cursor: "pointer",
    position: "relative",
    height: 18,
    width: 32,
  },
  switchThumb: {
    background: colors.paper,
    borderRadius: "50%",
    transition: "transform 140ms",
    boxShadow: "0 1px 2px oklch(0 0 0 / 0.25)",
    position: "absolute",
    transform: {
      default: "translateX(0)",
      ':is([data-state="checked"])': "translateX(14px)",
    },
    height: 14,
    left: 2,
    top: 2,
    width: 14,
  },
});
