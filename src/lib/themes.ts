import * as stylex from "@stylexjs/stylex";

import { colors } from "./tokens.stylex";

export const darkTheme = stylex.createTheme(colors, {
  ink: "oklch(0.96 0.006 80)",
  ink2: "oklch(0.84 0.008 80)",
  ink3: "oklch(0.68 0.01 80)",
  ink4: "oklch(0.54 0.012 80)",
  ink5: "oklch(0.42 0.014 80)",

  paper: "oklch(0.16 0.02 255)",
  paper2: "oklch(0.2 0.022 255)",
  paper3: "oklch(0.24 0.024 255)",
  paper4: "oklch(0.28 0.026 255)",

  line: "oklch(0.3 0.025 255)",
  lineStrong: "oklch(0.4 0.028 255)",

  gold: "oklch(0.78 0.11 75)",
  goldDeep: "oklch(0.68 0.11 75)",
  goldSoft: "oklch(0.3 0.04 75)",

  ok: "oklch(0.62 0.1 155)",
  okSoft: "oklch(0.28 0.04 155)",
  warn: "oklch(0.7 0.12 60)",
  warnSoft: "oklch(0.3 0.05 60)",
  err: "oklch(0.58 0.16 25)",
  errSoft: "oklch(0.3 0.05 25)",
});
