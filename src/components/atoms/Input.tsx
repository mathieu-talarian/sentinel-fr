import type { StyleXStyles } from "@stylexjs/stylex";
import type { ChangeEvent, ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

export type InputStateT = "default" | "error" | "warning" | "success";

interface InputPropsT extends Omit<ComponentProps<"input">, "style"> {
  /** StyleX overrides — applied last so callers win over local rules. */
  style?: StyleXStyles;
  state?: InputStateT;
  paddedRight?: boolean;
  onValueChange?: (v: string) => void;
}

export function Input(props: Readonly<InputPropsT>) {
  const { state, paddedRight, style, onValueChange, onChange, ...rest } = props;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(e.currentTarget.value);
    onChange?.(e);
  };

  return (
    <input
      type="text"
      {...rest}
      {...sx(
        s.input,
        STATES[state ?? "default"],
        paddedRight && s.padRight,
        style,
      )}
      onChange={handleChange}
    />
  );
}

const s = stylex.create({
  input: {
    padding: "10px 12px",
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    transition: "border-color 140ms, outline-width 140ms",
    backgroundColor: colors.paper,
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
