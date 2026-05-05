import * as stylex from "@stylexjs/stylex";

import { animations } from "~/lib/styles/animations.stylex";
import { sx } from "~/lib/styles/sx";
import { colors } from "~/lib/styles/tokens.stylex";

export function Cursor() {
  return <span {...sx(s.cursor)} aria-hidden="true" />;
}

const s = stylex.create({
  cursor: {
    background: colors.ink,
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationName: animations.blink,
    animationTimingFunction: "step-end",
    display: "inline-block",
    verticalAlign: "text-bottom",
    height: 14,
    marginLeft: 2,
    width: 7,
  },
});
