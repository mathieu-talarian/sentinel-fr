import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

export function LoginDivider() {
  return (
    <div {...sx(s.divider)} aria-hidden="true">
      or
    </div>
  );
}

const s = stylex.create({
  divider: {
    gap: 12,
    alignItems: "center",
    color: colors.ink4,
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    "::after": {
      flex: "1",
      backgroundColor: colors.line,
      content: '""',
      height: 1,
    },
    "::before": {
      flex: "1",
      backgroundColor: colors.line,
      content: '""',
      height: 1,
    },
  },
});
