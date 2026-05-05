import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { sx } from "~/lib/styles/sx";
import { colors, fonts } from "~/lib/styles/tokens.stylex";

export type HeadingLevelT = "h1" | "h2" | "h3";
export type HeadingSizeT = "sm" | "md" | "lg";
export type HeadingAlignT = "start" | "center";

interface HeadingPropsT extends Omit<
  JSX.HTMLAttributes<HTMLHeadingElement>,
  "style"
> {
  style?: StyleXStyles;
  level?: HeadingLevelT;
  size?: HeadingSizeT;
  align?: HeadingAlignT;
}

export function Heading(props: Readonly<HeadingPropsT>) {
  const [own, rest] = splitProps(props, ["level", "size", "align", "style"]);

  return (
    <Dynamic
      component={own.level ?? "h1"}
      {...rest}
      {...sx(
        s.heading,
        SIZES[own.size ?? "md"],
        own.align === "center" ? s.center : undefined,
        own.style,
      )}
    />
  );
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
