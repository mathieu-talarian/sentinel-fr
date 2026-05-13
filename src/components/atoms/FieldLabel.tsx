import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface FieldLabelPropsT extends Omit<
  ComponentProps<"label">,
  "style" | "htmlFor"
> {
  htmlFor: string;
  style?: StyleXStyles;
}

export function FieldLabel(props: Readonly<FieldLabelPropsT>) {
  const { style, htmlFor, ...rest } = props;

  return <label {...rest} htmlFor={htmlFor} {...sx(s.label, style)} />;
}

const s = stylex.create({
  label: { color: colors.ink2, fontSize: 12, fontWeight: 500 },
});
