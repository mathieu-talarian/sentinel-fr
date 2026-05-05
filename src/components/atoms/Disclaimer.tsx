import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface DisclaimerPropsT extends Omit<ComponentProps<"div">, "style"> {
  style?: StyleXStyles;
}

export function Disclaimer(props: Readonly<DisclaimerPropsT>) {
  const { style, ...rest } = props;

  return <div {...rest} {...sx(s.text, style)} />;
}

const s = stylex.create({
  text: {
    margin: "8px auto 0",
    color: colors.ink4,
    fontSize: 11,
    textAlign: "center",
    maxWidth: 760,
  },
});
