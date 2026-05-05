import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";

import { sx } from "~/lib/styles/sx";
import { colors, fonts } from "~/lib/styles/tokens.stylex";

export type EyebrowToneT = "default" | "accent";

interface EyebrowPropsT extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "style"
> {
  style?: StyleXStyles;
  rule?: boolean;
  tone?: EyebrowToneT;
}

export function Eyebrow(props: Readonly<EyebrowPropsT>) {
  const [own, rest] = splitProps(props, ["rule", "tone", "style"]);
  const tone = () => (own.tone === "accent" ? s.accent : s.def);

  return (
    <div
      {...rest}
      {...sx(s.eyebrow, tone(), own.rule && s.withRule, own.style)}
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
