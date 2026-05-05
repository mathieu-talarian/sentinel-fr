import * as stylex from "@stylexjs/stylex";
import { Switch } from "radix-ui";

import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface ToggleSwitchPropsT {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleSwitch(props: Readonly<ToggleSwitchPropsT>) {
  return (
    <div {...sx(s.row)}>
      <span {...sx(s.rowLabel)}>{props.label}</span>
      <Switch.Root
        checked={props.checked}
        onCheckedChange={props.onChange}
        {...sx(s.switchRoot)}
      >
        <Switch.Thumb {...sx(s.switchThumb)} />
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
  switchRoot: {
    borderRadius: 999,
    borderStyle: "none",
    borderWidth: 0,
    transition: "background 140ms",
    backgroundColor: {
      default: colors.lineStrong,
      ':is([data-state="checked"])': colors.ok,
    },
    cursor: "pointer",
    position: "relative",
    height: 18,
    width: 32,
  },
  switchThumb: {
    borderRadius: "50%",
    transition: "transform 140ms",
    backgroundColor: colors.paper,
    boxShadow: "0 1px 2px oklch(0 0 0 / 0.25)",
    display: "block",
    transform: {
      default: "translateX(2px)",
      ':is([data-state="checked"])': "translateX(16px)",
    },
    willChange: "transform",
    height: 14,
    width: 14,
  },
});
