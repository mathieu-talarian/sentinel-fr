import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";

import { sx } from "~/lib/styles/sx";
import { borders, colors, radii, shadows } from "~/lib/styles/tokens.stylex";

export type CardElevationT = "none" | "md" | "lg";
export type CardGapT = "none" | "sm" | "md" | "lg";

interface CardPropsT extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "style"> {
  style?: StyleXStyles;
  elevation?: CardElevationT;
  bordered?: boolean;
  padded?: boolean;
  gap?: CardGapT;
  width?: number;
}

export function Card(props: Readonly<CardPropsT>) {
  const [own, rest] = splitProps(props, [
    "elevation",
    "bordered",
    "padded",
    "gap",
    "width",
    "style",
  ]);

  return (
    <div
      {...rest}
      {...sx(
        s.card,
        ELEVATIONS[own.elevation ?? "none"],
        GAPS[own.gap ?? "none"],
        own.bordered !== false && s.bordered,
        own.padded && s.padded,
        own.width != null && s.maxW(own.width),
        own.style,
      )}
    />
  );
}

const s = stylex.create({
  card: {
    background: colors.paper,
    borderRadius: radii.lg,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  bordered: {
    borderColor: colors.line,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
  },
  padded: { padding: "32px 28px" },
  maxW: (width: number) => ({
    maxWidth: width,
  }),
});

const ELEVATIONS = stylex.create({
  none: { boxShadow: "none" },
  md: { boxShadow: shadows.md },
  lg: { boxShadow: shadows.lg },
});

const GAPS = stylex.create({
  none: { gap: 0 },
  sm: { gap: 10 },
  md: { gap: 16 },
  lg: { gap: 22 },
});
