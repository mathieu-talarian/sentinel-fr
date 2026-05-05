import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";
import type { InputStateT } from "~/components/atoms/Input";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";


import { sx } from "~/lib/styles/sx";
import { colors, fonts } from "~/lib/styles/tokens.stylex";

interface TextareaPropsT extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "style"
> {
  style?: StyleXStyles;
  state?: InputStateT;
  maxHeight?: number;
  onValueChange?: (v: string) => void;
}

export function Textarea(props: Readonly<TextareaPropsT>) {
  const [own, rest] = splitProps(props, [
    "state",
    "maxHeight",
    "style",
    "onValueChange",
    "onInput",
  ]);

  const handleInput: JSX.InputEventHandler<HTMLTextAreaElement, InputEvent> = (
    e,
  ) => {
    own.onValueChange?.(e.currentTarget.value);
    const native = own.onInput;
    if (typeof native === "function") native(e);
  };

  return (
    <textarea
      rows={1}
      {...rest}
      {...sx(
        s.textarea,
        STATES[own.state ?? "default"],
        s.dynamic(own.maxHeight ?? 160),
        own.style,
      )}
      onInput={handleInput}
    />
  );
}

const s = stylex.create({
  textarea: {
    background: "transparent",
    padding: "12px 14px 4px",
    borderStyle: "none",
    borderWidth: 0,
    outline: "none",
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 1.55,
    resize: "none",
    minHeight: 28,
    width: "100%",
    "::placeholder": { color: colors.ink4 },
  },
  dynamic: (maxHeight: number) => ({
    maxHeight,
  }),
});

const STATES = stylex.create({
  default: {},
  error: { color: colors.err },
  warning: { color: colors.warn },
  success: { color: colors.ok },
});
