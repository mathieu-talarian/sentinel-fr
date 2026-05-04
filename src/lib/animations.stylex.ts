import * as stylex from "@stylexjs/stylex";

export const animations = stylex.defineVars({
  spin: stylex.keyframes({
    to: { transform: "rotate(360deg)" },
  }),
  pulse: stylex.keyframes({
    "0%": { opacity: 0.5, transform: "scale(0.6)" },
    "100%": { opacity: 0, transform: "scale(1.6)" },
  }),
  blink: stylex.keyframes({
    "50%": { opacity: 0 },
  }),
});
