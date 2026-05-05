import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, radii } from "@/lib/styles/tokens.stylex";

export type IconButtonSizeT = "sm" | "md" | "lg";
export type IconButtonVariantT =
  | "ghost"
  | "ghost-subtle"
  | "primary"
  | "danger";

interface IconButtonPropsT extends Omit<ComponentProps<"button">, "style"> {
  style?: StyleXStyles;
  size?: IconButtonSizeT;
  variant?: IconButtonVariantT;
  bordered?: boolean;
}

export function IconButton(props: Readonly<IconButtonPropsT>) {
  const { size, variant, bordered, style, type, ...rest } = props;

  return (
    <button
      type={type ?? "button"}
      {...rest}
      {...sx(
        s.btn,
        SIZES[size ?? "md"],
        VARIANTS[variant ?? "ghost"],
        bordered && s.bordered,
        style,
      )}
    />
  );
}

const s = stylex.create({
  btn: {
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: "none",
    borderWidth: 0,
    placeItems: "center",
    transition: "opacity 140ms",
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    display: "grid",
    opacity: {
      default: 1,
      ":disabled": 0.3,
    },
  },
  bordered: {
    borderColor: {
      default: "transparent",
      ":hover": colors.line,
    },
    borderStyle: borders.solid,
    borderWidth: borders.thin,
  },
});

const SIZES = stylex.create({
  sm: { height: 26, width: 26 },
  md: { height: 28, width: 28 },
  lg: { height: 30, width: 30 },
});

const VARIANTS = stylex.create({
  ghost: {
    background: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    color: {
      default: colors.ink3,
      ":hover": colors.ink,
    },
  },
  "ghost-subtle": {
    background: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    color: {
      default: colors.ink4,
      ":hover": colors.ink2,
    },
  },
  primary: {
    background: colors.ink,
    color: colors.paper,
  },
  danger: {
    background: colors.err,
    color: colors.paper,
  },
});
