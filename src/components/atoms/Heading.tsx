import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";
import { createElement } from "react";

import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

export type HeadingLevelT = "h1" | "h2" | "h3";
export type HeadingSizeT = "sm" | "md" | "lg";
export type HeadingAlignT = "start" | "center";

interface HeadingPropsT extends Omit<ComponentProps<"h1">, "style"> {
  style?: StyleXStyles;
  level?: HeadingLevelT;
  size?: HeadingSizeT;
  align?: HeadingAlignT;
}

export function Heading(props: Readonly<HeadingPropsT>) {
  const { level, size, align, style, ...rest } = props;

  return createElement(level ?? "h1", {
    ...rest,
    ...sx(
      s.heading,
      SIZES[size ?? "md"],
      align === "center" ? s.center : undefined,
      style,
    ),
  });
}

const s = stylex.create({
  heading: {
    margin: 0,
    color: colors.ink,
    fontFamily: fonts.serif,
    fontWeight: 400,
  },
  center: { textAlign: "center" },
});

const SIZES = stylex.create({
  sm: { fontSize: 18, letterSpacing: "-0.01em", lineHeight: 1.25 },
  md: { fontSize: 26, letterSpacing: "-0.015em", lineHeight: 1.2 },
  lg: { fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1.15 },
});
