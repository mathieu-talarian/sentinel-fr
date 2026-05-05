import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

export type EyebrowToneT = "default" | "accent";

interface EyebrowPropsT extends Omit<ComponentProps<"div">, "style"> {
  style?: StyleXStyles;
  rule?: boolean;
  tone?: EyebrowToneT;
}

export function Eyebrow(props: Readonly<EyebrowPropsT>) {
  const { rule, tone, style, ...rest } = props;

  return (
    <div
      {...rest}
      {...sx(
        s.eyebrow,
        tone === "accent" ? s.accent : s.def,
        rule && s.withRule,
        style,
      )}
    />
  );
}

const s = stylex.create({
  eyebrow: {
    gap: 8,
    alignItems: "center",
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  def: { color: colors.ink4 },
  accent: { color: colors.goldDeep },
  withRule: {
    "::before": {
      background: colors.gold,
      content: '""',
      height: 1,
      width: 18,
    },
  },
});
