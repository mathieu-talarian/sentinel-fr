import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";

import { cn, sx } from "~/lib/styles/sx";
import { colors } from "~/lib/styles/tokens.stylex";

interface FieldLabelPropsT extends Omit<
  JSX.LabelHTMLAttributes<HTMLLabelElement>,
  "style"
> {
  style?: StyleXStyles;
}

export function FieldLabel(props: Readonly<FieldLabelPropsT>) {
  const [own, rest] = splitProps(props, ["style", "class"]);
  const styled = () => sx(s.label, own.style);

  return (
    <label
      {...rest}
      class={cn(styled().class, own.class)}
      style={styled().style}
    />
  );
}

const s = stylex.create({
  label: { color: colors.ink2, fontSize: 12, fontWeight: 500 },
});
