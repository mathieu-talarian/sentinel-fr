import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";
import type { InputStateT } from "~/components/atoms/Input";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";


import { cn, sx } from "~/lib/styles/sx";
import { colors } from "~/lib/styles/tokens.stylex";

interface CheckboxPropsT extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "style"
> {
  style?: StyleXStyles;
  state?: InputStateT;
  onCheckedChange?: (v: boolean) => void;
}

export function Checkbox(props: Readonly<CheckboxPropsT>) {
  const [own, rest] = splitProps(props, [
    "state",
    "style",
    "onCheckedChange",
    "onChange",
    "class",
  ]);

  const styled = () => sx(s.box, STATES[own.state ?? "default"], own.style);

  const handleChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = (e) => {
    own.onCheckedChange?.(e.currentTarget.checked);
    const native = own.onChange;
    if (typeof native === "function") native(e);
  };

  return (
    <input
      type="checkbox"
      {...rest}
      class={cn(styled().class, own.class)}
      style={styled().style}
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
