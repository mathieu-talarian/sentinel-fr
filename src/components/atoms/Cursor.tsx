import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { animations } from "@/lib/styles/animations.stylex";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

export function Cursor(
  props: Readonly<
    {
      style?: StyleXStyles;
    } & ComponentProps<"span">
  >,
) {
  const { style, ...rest } = props;
  return <span aria-hidden="true" {...rest} {...sx(s.cursor, style)} />;
}

const s = stylex.create({
  cursor: {
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationName: animations.blink,
    animationTimingFunction: "step-end",
    backgroundColor: colors.ink,
    display: "inline-block",
    verticalAlign: "text-bottom",
    height: 14,
    marginLeft: 2,
    width: 7,
  },
});
