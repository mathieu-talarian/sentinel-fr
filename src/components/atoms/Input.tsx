import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";

import { cn, sx } from "~/lib/styles/sx";
import { borders, colors, fonts, radii } from "~/lib/styles/tokens.stylex";

export type InputStateT = "default" | "error" | "warning" | "success";

interface InputPropsT extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "style"
> {
  /** StyleX overrides — applied last so callers win over local rules. */
  style?: StyleXStyles;
  state?: InputStateT;
  paddedRight?: boolean;
  onValueChange?: (v: string) => void;
}

export function Input(props: Readonly<InputPropsT>) {
  const [own, rest] = splitProps(props, [
    "state",
    "paddedRight",
    "style",
    "onValueChange",
    "onInput",
    "class",
  ]);

  const styled = () =>
    sx(
      s.input,
      STATES[own.state ?? "default"],
      own.paddedRight && s.padRight,
      own.style,
    );

  const handleInput: JSX.InputEventHandler<HTMLInputElement, InputEvent> = (
    e,
  ) => {
    own.onValueChange?.(e.currentTarget.value);
    const native = own.onInput;
    if (typeof native === "function") native(e);
  };

  return (
    <input
      type="text"
      {...rest}
      class={cn(styled().class, own.class)}
      style={styled().style}
      onInput={handleInput}
    />
  );
}

const s = stylex.create({
  input: {
    background: colors.paper,
    padding: "10px 12px",
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    transition: "border-color 140ms, outline-width 140ms",
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
    outlineOffset: 0,
    outlineStyle: borders.solid,
    width: "100%",
    "::placeholder": { color: colors.ink4 },
  },
  padRight: { paddingRight: 40 },
});

const STATES = stylex.create({
  default: {
    borderColor: {
      default: colors.lineStrong,
      ":focus": colors.ink3,
    },
    outlineColor: colors.goldSoft,
    outlineWidth: {
      default: 0,
      ":focus": 3,
    },
  },
  error: {
    borderColor: colors.err,
    outlineColor: colors.errSoft,
    outlineWidth: 3,
  },
  warning: {
    borderColor: colors.warn,
    outlineColor: colors.warnSoft,
    outlineWidth: 3,
  },
  success: {
    borderColor: colors.ok,
    outlineColor: colors.okSoft,
    outlineWidth: 3,
  },
});
