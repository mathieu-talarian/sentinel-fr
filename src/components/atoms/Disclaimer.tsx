import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";

import { sx } from "~/lib/styles/sx";
import { colors } from "~/lib/styles/tokens.stylex";

interface DisclaimerPropsT extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "style"
> {
  style?: StyleXStyles;
}

export function Disclaimer(props: Readonly<DisclaimerPropsT>) {
  const [own, rest] = splitProps(props, ["style"]);

  return <div {...rest} {...sx(s.text, own.style)} />;
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
