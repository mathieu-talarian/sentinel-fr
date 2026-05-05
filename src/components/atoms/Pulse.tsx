import * as stylex from "@stylexjs/stylex";

import { animations } from "@/lib/styles/animations.stylex";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

export function Pulse() {
  return <span {...sx(s.dot)} />;
}

const s = stylex.create({
  dot: {
    borderRadius: "50%",
    backgroundColor: colors.gold,
    flexShrink: 0,
    position: "relative",
    height: 8,
    width: 8,
    "::before": {
      inset: -3,
      borderRadius: "50%",
      animationDuration: "1.6s",
      animationIterationCount: "infinite",
      animationName: animations.pulse,
      animationTimingFunction: "ease-out",
      backgroundColor: colors.gold,
      content: '""',
      opacity: 0.35,
      position: "absolute",
    },
  },
});
