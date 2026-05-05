import type { InputStateT } from "@/components/atoms/Input";
import type { StyleXStyles } from "@stylexjs/stylex";
import type { ChangeEvent, ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

interface TextareaPropsT extends Omit<ComponentProps<"textarea">, "style"> {
  style?: StyleXStyles;
  state?: InputStateT;
  maxHeight?: number;
  onValueChange?: (v: string) => void;
}

export function Textarea(props: Readonly<TextareaPropsT>) {
  const { state, maxHeight, style, onValueChange, onChange, ...rest } = props;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange?.(e.currentTarget.value);
    onChange?.(e);
  };

  return (
    <textarea
      rows={1}
      {...rest}
      {...sx(
        s.textarea,
        STATES[state ?? "default"],
        s.dynamic(maxHeight ?? 160),
        style,
      )}
      onChange={handleChange}
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
