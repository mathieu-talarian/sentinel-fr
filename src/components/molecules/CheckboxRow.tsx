import * as stylex from "@stylexjs/stylex";

import { Checkbox } from "@/components/atoms/Checkbox";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface CheckboxRowPropsT {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}

export function CheckboxRow(props: Readonly<CheckboxRowPropsT>) {
  return (
    <label {...sx(s.row)}>
      <Checkbox
        checked={props.checked}
        disabled={props.disabled}
        onCheckedChange={props.onChange}
      />
      <span>{props.label}</span>
    </label>
  );
}

const s = stylex.create({
  row: {
    gap: 8,
    alignItems: "center",
    color: colors.ink2,
    cursor: "pointer",
    display: "flex",
    fontSize: 13,
    userSelect: "none",
  },
});
