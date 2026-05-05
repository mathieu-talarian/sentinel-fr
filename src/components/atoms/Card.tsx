import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, radii, shadows } from "@/lib/styles/tokens.stylex";

export type CardElevationT = "none" | "md" | "lg";
export type CardGapT = "none" | "sm" | "md" | "lg";

interface CardPropsT extends Omit<ComponentProps<"div">, "style"> {
  style?: StyleXStyles;
  elevation?: CardElevationT;
  bordered?: boolean;
  padded?: boolean;
  gap?: CardGapT;
  width?: number;
}

export function Card(props: Readonly<CardPropsT>) {
  const { elevation, bordered, padded, gap, width, style, ...rest } = props;

  return (
    <div
      {...rest}
      {...sx(
        s.card,
        ELEVATIONS[elevation ?? "none"],
        GAPS[gap ?? "none"],
        bordered !== false && s.bordered,
        padded && s.padded,
        width != null && s.maxW(width),
        style,
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
