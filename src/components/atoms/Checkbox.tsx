import type { InputStateT } from "@/components/atoms/Input";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface CheckboxPropsT extends Omit<ComponentProps<"input">, "style"> {
  style?: StyleXStyles;
  state?: InputStateT;
  onCheckedChange?: (v: boolean) => void;
}

export function Checkbox(props: Readonly<CheckboxPropsT>) {
  const { state, style, onCheckedChange, onChange, ...rest } = props;

  const handleChange: ComponentProps<"input">["onChange"] = (e) => {
    onCheckedChange?.(e.currentTarget.checked);
    const native = onChange;
    if (typeof native === "function") native(e);
  };

  return (
    <input
      type="checkbox"
      {...rest}
      {...sx(s.box, STATES[state ?? "default"], style)}
      onChange={handleChange}
    />
  );
}

const s = stylex.create({
  box: {
    cursor: "pointer",
    height: 15,
    width: 15,
  },
});

const STATES = stylex.create({
  default: { accentColor: colors.ink },
  error: { accentColor: colors.err },
  warning: { accentColor: colors.warn },
  success: { accentColor: colors.ok },
});
