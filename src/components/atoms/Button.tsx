import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

export type ButtonVariantT = "primary" | "secondary" | "danger";

interface ButtonPropsT extends Omit<ComponentProps<"button">, "style"> {
  style?: StyleXStyles;
  variant?: ButtonVariantT;
  fullWidth?: boolean;
}

export function Button(props: Readonly<ButtonPropsT>) {
  const { variant, fullWidth, style, type, ...rest } = props;

  return (
    <button
      type={type ?? "button"}
      {...rest}
      {...sx(s.btn, VARIANTS[variant ?? "primary"], fullWidth && s.full, style)}
    />
  );
}

const s = stylex.create({
  btn: {
    padding: "11px 14px",
    borderRadius: radii.md,
    gap: 8,
    transition: "background 140ms, border-color 140ms",
    alignItems: "center",
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    display: "flex",
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: 500,
    justifyContent: "center",
    opacity: {
      default: 1,
      ":disabled": 0.55,
    },
  },
  full: { width: "100%" },
});

const VARIANTS = stylex.create({
  primary: {
    borderStyle: "none",
    borderWidth: 0,
    backgroundColor: {
      default: colors.ink,
      ":hover:not(:disabled)": colors.ink2,
    },
    color: colors.paper,
  },
  secondary: {
    borderColor: {
      default: colors.lineStrong,
      ":hover:not(:disabled)": colors.ink4,
    },
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: {
      default: colors.paper,
      ":hover:not(:disabled)": colors.paper3,
    },
    color: colors.ink,
  },
  danger: {
    borderColor: colors.err,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: {
      default: "transparent",
      ":hover:not(:disabled)": colors.errSoft,
    },
    color: colors.err,
  },
});
