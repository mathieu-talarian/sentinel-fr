import * as stylex from "@stylexjs/stylex";

import { animations } from "~/lib/animations.stylex";
import { sx } from "~/lib/sx";
import { borders, colors } from "~/lib/tokens.stylex";

interface SpinnerPropsT {
  tone: "ink" | "paper";
}

export function Spinner(props: Readonly<SpinnerPropsT>) {
  return <span {...sx(s.spinner, props.tone === "paper" ? s.paper : s.ink)} />;
}

const s = stylex.create({
  spinner: {
    borderRadius: "50%",
    borderStyle: borders.solid,
    borderWidth: borders.thick,
    animationDuration: "0.8s",
    animationIterationCount: "infinite",
    animationName: animations.spin,
    animationTimingFunction: "linear",
    borderTopColor: "transparent",
    height: 14,
    width: 14,
  },
  ink: { borderColor: colors.ink },
  paper: { borderColor: colors.paper },
});
